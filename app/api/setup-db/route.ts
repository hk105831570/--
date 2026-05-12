import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 添加 accessCode 列（如果不存在）
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Case" ADD COLUMN IF NOT EXISTS "accessCode" TEXT`
    );
    // 添加 paymentVerified 列（如果不存在，兼容旧表）
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Case" ADD COLUMN IF NOT EXISTS "paymentVerified" BOOLEAN NOT NULL DEFAULT false`
    );
    return NextResponse.json({ success: true, message: "数据库更新完成" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
