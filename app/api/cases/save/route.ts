import { NextRequest, NextResponse } from "next/server";
import { createCase } from "@/lib/diagnosis-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { basicInfo, session, riskResult } = body;

    if (!session || !riskResult) {
      return NextResponse.json(
        { error: "Missing required fields: session, riskResult" },
        { status: 400 }
      );
    }

    const caseId = await createCase({ basicInfo, session, riskResult });

    return NextResponse.json({ caseId }, { status: 201 });
  } catch (error) {
    console.error("Failed to save case:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
