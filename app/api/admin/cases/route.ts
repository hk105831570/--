import { NextRequest, NextResponse } from "next/server";
import { getCases } from "@/lib/diagnosis-service";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const sortBy = (searchParams.get("sortBy") || "createdAt") as "createdAt" | "riskScore";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
    const riskLevel = searchParams.get("riskLevel") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getCases({ page, pageSize, sortBy, sortOrder, riskLevel, search });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list cases:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
