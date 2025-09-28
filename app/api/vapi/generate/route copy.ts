// import { db } from "@/firebase/admin";
// import { getRandomInterviewCover } from "@/lib/utils";
// import { google } from "@ai-sdk/google";
// import { generateText } from "ai";
// import { NextResponse } from "next/server";

// // GET example
// export async function GET() {
//   return NextResponse.json(
//     { success: true, data: "THANK YOU" },
//     { status: 200 }
//   );
// }

// export async function POST(request: Request) {
//   const { type, role, level, techstack, amount, userid } = await request.json();

//   try {
//     const { text: questions } = await generateText({
//       model: google("gemini-2.0-flash-001"),
//       prompt: `Prepare questions for a job interview.
//         The job role is ${role}.
//         The job experience level is ${level}.
//         The tech stack used in the job is: ${techstack}.
//         The focus between behavioural and technical questions should lean towards: ${type}.
//         The amount of questions required is: ${amount}.
//         Please return only the questions, without any additional text.
//         The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
//         Return the questions formatted like this:
//         ["Question 1", "Question 2", "Question 3"]

//         Thank you! <3
//       `,
//     });

//     const interview = {
//       role,
//       type,
//       level,
//       techstack: techstack.split(","),
//       questions: JSON.parse(questions),
//       userId: userid,
//       finalized: true, 
//       coverImage: getRandomInterviewCover(),
//       createdAt: new Date().toISOString(), 
//     };

//     // Save interview and get document reference
//     const docRef = await db.collection("interviews").add(interview);


//     return NextResponse.json(
//       { success: true, interviewId: docRef.id },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ success: false, error }, { status: 500 });
//   }
// }

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

// GET example (health check)
export async function GET() {
  return NextResponse.json(
    { success: true, data: "THANK YOU" },
    { status: 200 }
  );
}

// POST handler
export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    // Call Gemini
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]

        Thank you! <3
      `,
    });

   //  Ensure valid JSON array
let parsedQuestions: string[] = [];

try {
  // Try parsing directly
  parsedQuestions = JSON.parse(questions);

  // Ensure it's an array of strings
  if (!Array.isArray(parsedQuestions)) {
    throw new Error("Parsed result is not an array.");
  }
} catch {
  // Fallback: clean and split text
  const cleaned = questions
    .replace(/[\r\n]+/g, "\n") // normalize line breaks
    .replace(/^\d+[\).\s-]+/gm, "") // remove leading numbers like "1. " or "2) "
    .replace(/["“”]/g, "") // strip quotes
    .trim();

  parsedQuestions = cleaned.split("\n").filter((q) => q.length > 0);
}

// Safety check
if (parsedQuestions.length === 0) {
  throw new Error("Model did not return any valid questions.");
}


    // Interview object
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

    return NextResponse.json(
      { success: true, interviewId: docRef.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(" Interview creation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
