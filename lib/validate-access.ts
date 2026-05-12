import { prisma } from "./prisma";

export interface AccessValidation {
  valid: boolean;
  error: string;
  status: number;
}

export async function validateCaseAccess(
  caseId: string,
  accessToken: string
): Promise<AccessValidation> {
  if (!caseId || !accessToken) {
    return { valid: false, error: "缺少访问凭证", status: 401 };
  }

  const case_ = await prisma.case.findUnique({ where: { id: caseId } });

  if (!case_ || !case_.accessToken || case_.accessToken !== accessToken) {
    return { valid: false, error: "无权访问该诊断记录", status: 403 };
  }

  return { valid: true, error: "", status: 200 };
}
