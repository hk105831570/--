import { NextResponse } from "next/server";
import { getCaseById } from "@/lib/diagnosis-service";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const detail = await getCaseById(id);

    if (!detail) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error("Failed to get case:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
