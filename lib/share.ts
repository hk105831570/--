export const SHARE_DOMAIN = "https://www.laodongjiufen.xin";

// Scene ID mapping for share URLs (short IDs)
export const SCENE_TO_SHARE_ID: Record<string, string> = {
  "probation-termination": "probation",
  "disciplinary-dispute": "misconduct",
  "performance-dispute": "performance",
  "job-salary-adjustment": "transfer",
  "overtime-pay": "overtime",
  "departure-compensation": "severance",
};

export const SHARE_ID_TO_SCENE: Record<string, string> = {
  probation: "probation-termination",
  misconduct: "disciplinary-dispute",
  performance: "performance-dispute",
  transfer: "job-salary-adjustment",
  overtime: "overtime-pay",
  severance: "departure-compensation",
};

export const SHARE_ID_TO_NAME: Record<string, string> = {
  probation: "试用期解除争议",
  misconduct: "员工违纪处理争议",
  performance: "绩效不达标处理争议",
  transfer: "调岗降薪争议",
  overtime: "加班费争议",
  severance: "离职补偿争议",
};

export const LEVEL_LABELS: Record<string, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  critical: "极高风险",
};

export const ROLE_LABELS: Record<string, string> = {
  employer: "企业方",
  employee: "员工方",
};

export interface ShareInfo {
  fromShare: boolean;
  shareScene: string;
  shareRole: string;
  shareLevel: string;
  landingTime: string;
}

export function buildShareUrl(
  sceneId: string,
  role: "employer" | "employee",
  level: string
): string {
  const shareId = SCENE_TO_SHARE_ID[sceneId] || sceneId;
  return `${SHARE_DOMAIN}/?ref=share&scene=${shareId}&role=${role}&level=${level}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export function getShareLinkText(sceneId: string, role: "employer" | "employee", level: string): string {
  const shareId = SCENE_TO_SHARE_ID[sceneId] || sceneId;
  return `${SHARE_DOMAIN}/?ref=share&scene=${shareId}&role=${role}&level=${level}`;
}
