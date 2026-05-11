import type { DiagnosisAnswer, RiskLevel, RiskResult } from "@/types/risk";

export function getRiskMeta(level: RiskLevel, isEmployee = false) {
  if (isEmployee) {
    return {
      low: {
        levelText: "低风险",
        handlingAdvice: "当前情况对您较为有利，相关权益主张有较好的法律依据支撑。建议整理好现有证据，必要时可主动维权。",
        conclusion: "根据您的填写情况，当前您的权益主张有较好的法律和证据基础。但仍建议正式行动前完成证据梳理，并咨询专业律师确认最佳维权策略。"
      },
      medium: {
        levelText: "中风险",
        handlingAdvice: "建议先补强关键证据，再评估是否需要启动法律程序。",
        conclusion: "根据您的填写情况，当前您的主张存在一定不确定性，部分权益可能面临举证困难。建议先补齐关键证据和沟通记录，再决定是否提起仲裁。"
      },
      high: {
        levelText: "高风险",
        handlingAdvice: "建议尽快收集补强证据，必要时咨询专业律师。",
        conclusion: "根据您的填写情况，当前您的主张面临较高争议风险。主要问题在于关键证据可能尚不完整或公司方面有制度依据支撑。建议先补强证据，不要贸然行动。"
      },
      critical: {
        levelText: "极高风险",
        handlingAdvice: "建议立即咨询专业律师，尽快采取维权措施，避免超过仲裁时效。",
        conclusion: "当前您的权益面临严重侵害风险，相关法律依据明确。但需要尽快采取行动，避免超过仲裁时效或关键证据灭失。"
      }
    }[level];
  }

  return {
    low: {
      levelText: "低风险",
      handlingAdvice: "可以继续完善流程后推进处理。",
      conclusion: "当前材料基础相对完整，但仍建议在正式处理前完成证据归档和流程复核。"
    },
    medium: {
      levelText: "中风险",
      handlingAdvice: "建议补充部分证据后再推进。",
      conclusion: "当前存在一定争议空间，建议先补齐关键证据和沟通记录，降低后续仲裁中的不确定性。"
    },
    high: {
      levelText: "高风险",
      handlingAdvice: "不建议立即采取单方处理措施，应先补强证据链。",
      conclusion: "根据你的填写情况，企业当前在该场景下存在较高争议风险。主要问题不一定在事实本身，而在于解除依据、制度依据、考核记录或证据链尚不完整。"
    },
    critical: {
      levelText: "极高风险",
      handlingAdvice: "建议暂停处理，并进行人工复核。",
      conclusion: "当前存在极高争议风险，若直接推进单方处理，可能被认定为处理依据不足或流程存在重大瑕疵。"
    }
  }[level];
}

function riskLevel(score: number, hasCritical: boolean): RiskLevel {
  if (hasCritical || score >= 81) return "critical";
  if (score >= 51) return "high";
  if (score >= 21) return "medium";
  return "low";
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function getConsequences(level: RiskLevel, isEmployee: boolean): string[] {
  if (isEmployee) {
    switch (level) {
      case "critical":
        return [
          "公司可能被认定为违法解除或违法处理，您有权主张双倍赔偿金",
          "您的工资、加班费或经济补偿可能被长期拖欠",
          "超过仲裁时效（1年）后将丧失胜诉权，需尽快行动"
        ];
      case "high":
        return [
          "因证据不完整，您的部分主张可能在仲裁中不被支持",
          "公司可能利用制度或合同条款进行抗辩",
          "需要尽快补充证据，否则维权难度将增大"
        ];
      case "medium":
        return [
          "部分权益主张可能存在举证困难",
          "处理节奏过慢可能导致证据灭失或时效问题",
          "建议主动沟通或咨询律师，避免被动等待"
        ];
      default:
        return [
          "仍需注意整理和保管现有证据",
          "个案结果仍受完整事实和当地裁判口径影响"
        ];
    }
  }

  switch (level) {
    case "critical":
      return [
        "可能被认定为处理依据不足",
        "可能引发仲裁或诉讼中的程序争议",
        "特殊保护情形下可能产生更高补偿或赔偿风险"
      ];
    case "high":
      return [
        "可能被认定为证据链不完整",
        "员工可能主张企业处理流程不充分",
        "可能产生经济补偿、赔偿或恢复劳动关系等争议"
      ];
    case "medium":
      return [
        "部分证据缺口可能影响企业抗辩",
        "处理节奏过快时可能放大争议"
      ];
    default:
      return [
        "仍需注意材料归档和送达留痕",
        "个案结果仍受完整事实和当地裁判口径影响"
      ];
  }
}

function getDefaultSuggestions(isEmployee: boolean): string[] {
  if (isEmployee) {
    return [
      "整理劳动合同、工资单、考勤记录、沟通记录等关键材料，形成一份证据目录",
      "确认仲裁时效（离职后1年内），避免错过维权窗口期",
      "建议先与公司正式书面沟通，固定争议事实后再决定是否提起仲裁"
    ];
  }
  return [
    "整理合同、制度、沟通、考核和送达材料，形成一份证据目录。",
    "正式处理前进行一次内部流程复核。"
  ];
}

export function calculateRisk(answers: DiagnosisAnswer[], userRole: "employer" | "employee" = "employer"): RiskResult {
  const isEmployee = userRole === "employee";
  const score = answers.reduce((sum, answer) => sum + answer.selected.score, 0);
  const hasCritical = answers.some((answer) => answer.selected.riskLevel === "critical");
  const level = riskLevel(score, hasCritical);
  const meta = getRiskMeta(level, isEmployee);

  const flagged = answers.filter((answer) =>
    answer.selected.riskLevel === "high" || answer.selected.riskLevel === "critical"
  );

  const legalBasisItems = unique(
    flagged.map((answer) => answer.selected.legalBasis).filter((b): b is string => !!b)
  );

  return {
    level,
    levelText: meta.levelText,
    score,
    conclusion: meta.conclusion,
    disputePoints: flagged.length
      ? unique(
          flagged.map((answer) =>
            isEmployee
              ? `${answer.questionText}：${answer.selected.employeeLabel || answer.selected.label}`
              : `${answer.questionText}：${answer.selected.label}`
          )
        ).slice(0, 6)
      : [isEmployee ? "暂未识别出明显可主张的权益项目。" : "暂未识别出明显高风险争议点。"],
    evidenceGaps: flagged.length
      ? unique(flagged.map((answer) => answer.selected.riskReason)).slice(0, 6)
      : [isEmployee ? "您手上的证据相对完整，建议继续做好归档和备份。" : "核心证据链相对完整，建议继续完成归档复核。"],
    consequences: getConsequences(level, isEmployee),
    suggestions: flagged.length
      ? unique(flagged.map((answer) => answer.selected.suggestion)).slice(0, 5)
      : getDefaultSuggestions(isEmployee),
    handlingAdvice: meta.handlingAdvice,
    needsReview: level === "high" || level === "critical",
    legalBasisItems
  };
}
