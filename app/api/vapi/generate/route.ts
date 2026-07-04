import { generateText } from "ai";
import { NextResponse } from "next/server";

import { getGeminiModel } from "@/lib/ai/client";
import { verifyVapiWebhook } from "@/lib/api/verify-webhook";
import { buildInterviewQuestionsPrompt } from "@/lib/prompts";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: "Server is alive!",
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  console.log("========== API HIT ==========");

  console.log(
    "Authorization:",
    request.headers.get("authorization")
  );

  console.log(
    "x-api-key:",
    request.headers.get("x-api-key")
  );

  if (!verifyVapiWebhook(request)) {
    console.log("❌ Webhook verification failed");

    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  console.log("✅ Webhook verified");

  try {
    console.log(
      "Google API Key Loaded:",
      !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    );

    const body = await request.json();

    console.log("========== REQUEST BODY ==========");
    console.dir(body, { depth: null });

    const {
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    } = body;

    if (!role || !level || !techstack || !type || !userid) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields in request body.",
        },
        { status: 400 }
      );
    }

    // Keep amount between 1 and 20
    const safeAmount = Math.max(
      1,
      Math.min(Number(amount) || 10, 20)
    );

    let questionsText = "";

    try {
      const response = await generateText({
        model: getGeminiModel(),
        prompt: buildInterviewQuestionsPrompt({
          role,
          level,
          techstack,
          type,
          amount: safeAmount,
        }),
        maxRetries: 1,
      });

      questionsText = response.text;

      console.log("========== AI RESPONSE ==========");
      console.log(questionsText);
    } catch (aiError: unknown) {
      console.log("========== AI ERROR ==========");
      console.dir(aiError, { depth: null });

      if (
        aiError &&
        typeof aiError === "object" &&
        "cause" in aiError
      ) {
        console.log("========== AI ERROR CAUSE ==========");
        console.dir(
          (aiError as { cause?: unknown }).cause,
          { depth: null }
        );
      }

      const message =
        aiError instanceof Error
          ? aiError.message
          : "AI generation failed";

      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 500 }
      );
    }

    let parsedQuestions: string[] = [];

    try {
      parsedQuestions = JSON.parse(questionsText);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Parsed result is not an array");
      }

      parsedQuestions = parsedQuestions.filter(
        (q) => typeof q === "string" && q.trim().length > 0
      );
    } catch {
      const cleaned = questionsText
        .replace(/[\r\n]+/g, "\n")
        .replace(/^\d+[\).\s-]+/gm, "")
        .replace(/["""'']/g, "")
        .trim();

      parsedQuestions = cleaned
        .split("\n")
        .map((q) => q.trim())
        .filter(Boolean);
    }

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "AI did not return any valid questions.",
        },
        { status: 500 }
      );
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack
        .split(",")
        .map((t: string) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection("interviews")
      .add(interview);

    console.log("✅ Interview Created:", docRef.id);

    return NextResponse.json(
      {
        success: true,
        interviewId: docRef.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("========== SERVER ERROR ==========");
    console.dir(error, { depth: null });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}