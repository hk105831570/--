import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Dynamically import and run prisma db push
    const { execSync } = await import("child_process");
    const output = execSync(
      "npx prisma db push --accept-data-loss --skip-generate",
      { encoding: "utf-8", timeout: 30000 }
    );
    return NextResponse.json({ ok: true, output: output.slice(0, 1000) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("setup-db failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
