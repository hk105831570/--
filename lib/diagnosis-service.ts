import { prisma } from "./prisma";
import type { BasicInfo, DiagnosisAnswer, DiagnosisSession, ReportData, RiskResult } from "@/types/risk";

export interface CreateCaseInput {
  basicInfo: BasicInfo | null;
  session: DiagnosisSession;
  riskResult: RiskResult;
}

export interface CaseListItem {
  id: string;
  createdAt: Date;
  userRole: string;
  sceneTitle: string;
  companyName: string;
  riskLevel: string;
  riskScore: number;
  hasReport: boolean;
  reportNumber: string | null;
}

export interface CaseDetail {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userRole: string;
  sceneId: string;
  sceneTitle: string;
  basicInfo: BasicInfo | null;
  answers: DiagnosisAnswer[];
  riskLevel: string;
  riskScore: number;
  riskResult: RiskResult | null;
  reportData: ReportData | null;
  reportNumber: string | null;
}

export interface CasesQuery {
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "riskScore";
  sortOrder?: "asc" | "desc";
  riskLevel?: string;
  search?: string;
}

export interface CasesResponse {
  cases: CaseListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function createCase(input: CreateCaseInput): Promise<string> {
  const basicInfo = input.basicInfo ?? {};
  const companyName =
    typeof basicInfo === "object" && "companyName" in basicInfo
      ? String((basicInfo as Record<string, unknown>).companyName ?? "")
      : "";

  const case_ = await prisma.case.create({
    data: {
      userRole: input.session.userRole,
      sceneId: input.session.sceneId,
      sceneTitle: input.session.sceneTitle,
      basicInfo: JSON.stringify(basicInfo),
      answers: JSON.stringify(input.session.answers),
      riskLevel: input.riskResult.level,
      riskScore: input.riskResult.score,
      riskResult: JSON.stringify(input.riskResult),
    },
  });

  return case_.id;
}

export async function updateCaseReport(
  caseId: string,
  reportData: ReportData,
  reportNumber: string
): Promise<void> {
  await prisma.case.update({
    where: { id: caseId },
    data: {
      reportData: JSON.stringify(reportData),
      reportNumber,
    },
  });
}

export async function getCases(query: CasesQuery = {}): Promise<CasesResponse> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
    riskLevel,
    search,
  } = query;

  const where: Record<string, unknown> = {};

  if (riskLevel) {
    where.riskLevel = riskLevel;
  }

  if (search) {
    where.basicInfo = { contains: search };
  }

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.case.count({ where }),
  ]);

  return {
    cases: cases.map((c) => {
      let companyName = "";
      try {
        const info = JSON.parse(c.basicInfo);
        companyName = info?.companyName ?? "";
      } catch {
        // ignore parse errors
      }

      return {
        id: c.id,
        createdAt: c.createdAt,
        userRole: c.userRole,
        sceneTitle: c.sceneTitle,
        companyName,
        riskLevel: c.riskLevel,
        riskScore: c.riskScore,
        hasReport: !!c.reportData,
        reportNumber: c.reportNumber,
      };
    }),
    total,
    page,
    pageSize,
  };
}

export async function getCaseById(id: string): Promise<CaseDetail | null> {
  const c = await prisma.case.findUnique({ where: { id } });
  if (!c) return null;

  let basicInfo: BasicInfo | null = null;
  let answers: DiagnosisAnswer[] = [];
  let riskResult: RiskResult | null = null;
  let reportData: ReportData | null = null;

  try {
    basicInfo = JSON.parse(c.basicInfo);
  } catch {
    // ignore
  }
  try {
    answers = JSON.parse(c.answers);
  } catch {
    // ignore
  }
  try {
    riskResult = JSON.parse(c.riskResult);
  } catch {
    // ignore
  }
  try {
    reportData = c.reportData ? JSON.parse(c.reportData) : null;
  } catch {
    // ignore
  }

  return {
    id: c.id,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    userRole: c.userRole,
    sceneId: c.sceneId,
    sceneTitle: c.sceneTitle,
    basicInfo,
    answers,
    riskLevel: c.riskLevel,
    riskScore: c.riskScore,
    riskResult,
    reportData,
    reportNumber: c.reportNumber,
  };
}
