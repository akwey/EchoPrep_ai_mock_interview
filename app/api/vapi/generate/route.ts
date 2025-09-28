import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// GET health check
export async function GET() {
  return NextResponse.json({ success: true, data: "Server is alive!" }, { status: 200 });
}

// POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { type, role, level, techstack, amount, userid } = body;

    if (!role || !level || !techstack || !type || !amount || !userid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields in request body." },
        { status: 400 }
      );
    }

    // Call AI model to generate questions
    let questionsText = "";
    try {
      const response = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `Prepare questions for a job interview.
Role: ${role}
Experience level: ${level}
Tech stack: ${techstack}
Question type: ${type}
Amount: ${amount}

Return ONLY the questions as an array of strings, without extra text. Example:
["Question 1", "Question 2"]`,
      });

      questionsText = response.text;
    } catch (aiError: any) {
      console.error("AI generation failed:", aiError);
      return NextResponse.json(
        { success: false, error: "Failed to generate questions from AI." },
        { status: 500 }
      );
    }

    // Parse AI response safely
    let parsedQuestions: string[] = [];
    try {
      parsedQuestions = JSON.parse(questionsText);
      if (!Array.isArray(parsedQuestions)) throw new Error("Parsed result is not an array");
      parsedQuestions = parsedQuestions.filter((q) => typeof q === "string" && q.length > 0);
    } catch {
      // Fallback: split lines and clean text
      const cleaned = questionsText
        .replace(/[\r\n]+/g, "\n")
        .replace(/^\d+[\).\s-]+/gm, "")
        .replace(/["“”]/g, "")
        .trim();

      parsedQuestions = cleaned.split("\n").filter((q) => q.length > 0);
    }

    if (parsedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: "AI did not return any valid questions." },
        { status: 500 }
      );
    }

    // Build interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((t: string) => t.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore
    const docRef = await db.collection("interviews").add(interview);

    return NextResponse.json({ success: true, interviewId: docRef.id }, { status: 200 });
  } catch (error: any) {
    console.error("Interview creation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
