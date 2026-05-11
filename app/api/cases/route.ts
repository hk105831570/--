import { type NextRequest } from "next/server";

const SYSTEM_PROMPT = `你是一位专业的中国劳动法律顾问。
根据用户提供的劳动纠纷信息，严格按照以下 JSON 结构返回数据，不要输出任何 JSON 以外的内容，不要加 markdown 代码块标记。

【重要】userRole 决定整个报告的立场和措辞：
- "employer"（企业方）：从企业角度分析用工风险、合规操作、如何降低赔偿风险
- "employee"（员工方）：从员工角度分析维权依据、可获赔偿、如何保留证据和提起仲裁

返回的 JSON 结构如下：
{
  "reportTitle": "string，报告标题",
  "reportNumber": "string，格式如 LD-20250510-001",
  "reportDate": "string，今天日期 YYYY-MM-DD",
  "userRole": "string，employer 或 employee",
  "sceneType": "string，纠纷场景名称",
  "riskLevel": "string，高风险/中风险/低风险",
  "region": "string，用户所在城市",
  "roleContext": "string，根据 userRole 生成的一句话定位",
  "disputeRiskAnalysis": {
    "summary": "string，风险总结 100 字以内，企业方聚焦合规漏洞，员工方聚焦权益受损点",
    "keyRisks": [
      { "title": "string", "description": "string，60字以内", "level": "高/中/低" }
    ]
  },
  "evidenceGaps": [
    { "item": "string，证据名称", "importance": "string，企业方说明为何此证据能降低败诉风险，员工方说明为何此证据能支持维权", "status": "missing" }
  ],
  "sevenDayActions": [
    { "day": "第1-2天", "actions": ["string，企业方为合规补救步骤，员工方为维权操作步骤"] }
  ],
  "communicationNotes": [
    { "audience": "string", "keyPoints": ["string"], "avoid": ["string"] }
  ],
  "documentTemplates": [
    { "name": "string", "purpose": "string", "keyClauses": ["string"] }
  ],
  "handlingPath": {
    "options": [
      { "path": "string", "description": "string", "pros": ["string"], "cons": ["string"], "successRate": "string，如 65%" }
    ],
    "recommendation": "string"
  },
  "compensation": {
    "description": "string，企业方为预计赔偿敞口，员工方为预计可主张金额",
    "items": [
      { "name": "string，如经济补偿金/二倍工资/赔偿金", "basis": "string，计算依据", "estimated": "string，如约 X 个月工资或需结合实际工资核算" }
    ]
  },
  "similarCases": [
    { "title": "string", "situation": "string", "result": "string", "basis": "string", "reference": "string，企业方说明如何避免同类风险，员工方说明如何借鉴维权" }
  ],
  "legalBasis": [
    { "law": "string，法规名称", "article": "string，条款", "content": "string，条款内容摘要" }
  ],
  "disclaimer": "以上内容基于常见案例规律生成，仅供参考，不构成正式法律意见。建议结合当地实际情况咨询持证律师。"
}

要求：
- similarCases 提供 3 条，基于中国真实劳动仲裁判例规律，不得编造具体案号
- evidenceGaps 的 status 字段只能是 "missing" | "partial" | "complete"
- 所有数组至少有 2-3 条内容
- compensation 模块必须输出，金额只给范围和依据，不要给出精确数字
- 所有措辞严格按照 userRole 的立场，不得混用视角
- 只输出纯 JSON，不要任何前缀或后缀`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "DEEPSEEK_API_KEY not configured" }), { status: 500 });
  }

  const body = await req.json();
  const { city, industry, companySize, workYears, sceneName, userAnswers, riskLevel, riskPoints, userRole } = body;

  const region = city || "中国";
  const date = new Date().toISOString().split("T")[0];
  const reportNumber = `LD-${date.replace(/-/g, "")}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

  const roleLabel = userRole === "employee" ? "员工方" : "企业方";

  const userPrompt = `用户劳动纠纷信息如下：

【基本信息】
- 所在城市：${city || "未填写"}
- 行业类型：${industry || "未填写"}
- 公司规模：${companySize || "未填写"}
- 工作年限：${workYears || "未填写"}

【用户身份】${roleLabel}（userRole: "${userRole || "employer"}"）

【纠纷场景】
- 场景类型：${sceneName}
- 具体情况：${userAnswers}

【诊断结果】
- 综合风险等级：${riskLevel}
- 主要风险点：${riskPoints?.join("、") || "无"}

请根据以上信息，严格按照 userRole 立场生成《劳动纠纷处理建议书》JSON。`;

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      stream: false,
      max_tokens: 8192,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    return new Response(JSON.stringify({ error: `DeepSeek API error: ${response.status} - ${text}` }), { status: 500 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return new Response(JSON.stringify({ error: "No content in response" }), { status: 500 });
  }

  try {
    const json = JSON.parse(content);
    return new Response(JSON.stringify(json), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to parse JSON", content }), { status: 500 });
  }
}
