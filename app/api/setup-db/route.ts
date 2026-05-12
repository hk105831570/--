import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  // 仅生产环境可用
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json({ error: "仅生产环境可用" }, { status: 403 });
  }

  try {
    const prisma = new PrismaClient();

    // 创建 Case 表
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Case" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL,
        "userRole" TEXT NOT NULL,
        "sceneId" TEXT NOT NULL,
        "sceneTitle" TEXT NOT NULL,
        "basicInfo" TEXT NOT NULL,
        "answers" TEXT NOT NULL,
        "riskLevel" TEXT NOT NULL,
        "riskScore" INTEGER NOT NULL,
        "riskResult" TEXT,
        "reportData" TEXT,
        "reportNumber" TEXT
      );
    `);

    await prisma.$disconnect();

    return NextResponse.json({ success: true, message: "数据库表创建成功" });
  } catch (error) {
    console.error("Setup DB error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
