export type RiskLevel = "low" | "medium" | "high" | "critical";
export type SceneStatus = "available" | "coming-soon";

export interface Scene {
  id: string;
  title: string;
  description: string;
  employeeDesc: string;
  status: SceneStatus;
}

export interface QuestionOption {
  label: string;
  employeeLabel?: string;
  score: number;
  riskLevel: RiskLevel;
  riskReason: string;
  suggestion: string;
  legalBasis?: string;
}

export interface Question {
  id: string;
  text: string;
  employeeLabel?: string;
  options: QuestionOption[];
}

export interface BasicInfo {
  companyName?: string;
  companySize?: string;
  city?: string;
  industry?: string;
  hasHr?: string;
  hasEvidence?: string;
  monthlySalary?: string;
  entryDate?: string;
  disputeOccurred?: string;
  arbitrationNotice?: string;
  contact?: string;
}

export interface DiagnosisAnswer {
  questionId: string;
  questionText: string;
  selected: QuestionOption;
}

export interface DiagnosisSession {
  sceneId: string;
  sceneTitle: string;
  userRole: 'employer' | 'employee';
  answers: DiagnosisAnswer[];
}

export interface RiskResult {
  level: RiskLevel;
  levelText: string;
  score: number;
  conclusion: string;
  disputePoints: string[];
  evidenceGaps: string[];
  consequences: string[];
  suggestions: string[];
  handlingAdvice: string;
  needsReview: boolean;
  legalBasisItems: string[];
}

export interface ReportData {
  reportTitle: string;
  reportNumber: string;
  reportDate: string;
  sceneType: string;
  riskLevel: string;
  region: string;

  disputeRiskAnalysis: {
    summary: string;
    keyRisks: Array<{ title: string; description: string; level: string }>;
  };

  evidenceGaps: Array<{ item: string; importance: string; status: "missing" | "partial" | "complete" }>;

  sevenDayActions: Array<{ day: string; actions: string[] }>;

  communicationNotes: Array<{ audience: string; keyPoints: string[]; avoid: string[] }>;

  documentTemplates: Array<{ name: string; purpose: string; keyClauses: string[] }>;

  handlingPath: {
    options: Array<{ path: string; description: string; pros: string[]; cons: string[]; successRate: string }>;
    recommendation: string;
  };

  similarCases: Array<{ title: string; situation: string; result: string; basis: string; reference: string }>;

  legalBasis: Array<{ law: string; article: string; content: string }>;

  disclaimer: string;
}
