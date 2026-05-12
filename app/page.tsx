import Link from "next/link";
import { ShareBanner, ShareRecommend } from "@/components/ShareLanding";

export default function Home() {
  return (
    <main className="bg-white">
      {/* 区块一：Hero */}
      <section className="border-b border-gray-200 bg-white px-5 pb-11 pt-[52px] md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-[#b91c1c]" />
            劳动纠纷风险诊断工具
          </div>
          <h1 className="mt-6 font-serif text-[34px] font-bold leading-[1.35] text-[#1a2b4a]">
            仲裁前，先知道
            <br />
            自己胜算几分
          </h1>
          <p className="mt-3 text-[18px] text-[#b91c1c]">
            别等到开庭，才发现关键证据早就失效了
          </p>
          <p className="mt-4 max-w-[500px] text-[14px] leading-[1.9] text-gray-500">
            无论你是企业 HR、老板，还是正在维权的员工——劳动纠纷的结果往往不取决于谁&ldquo;有理&rdquo;，而取决于谁的证据和流程更完整。3 分钟问卷，先摸清自己的底牌。
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/role-select"
              className="inline-flex items-center rounded-md bg-[#1a2b4a] px-7 py-[13px] text-white hover:bg-[#0f1f36]"
            >
              开始诊断，评估胜算
              <span className="ml-2">&rarr;</span>
            </Link>
            <Link href="/scenes" className="text-sm text-gray-500 underline hover:text-gray-700">
              先看一个真实案例
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-[12px] text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            企业方和员工方均适用 &middot; 免费 &middot; 无需注册
          </div>
        </div>
      </section>

      <ShareBanner />

      {/* 区块二：双方焦虑对照 */}
      <section className="border-b border-gray-200 bg-white px-5 md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col divide-y divide-gray-200 md:flex-row md:divide-x md:divide-y-0">
            {/* 左列：企业 / HR */}
            <div className="py-6 pr-0 md:w-1/2 md:pr-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-gray-500">
                企业 / HR 在想
              </div>
              <ul className="mt-4 space-y-2.5 text-[14px] text-[#1a2b4a]">
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#b91c1c]" />
                  我们的处理流程，仲裁官会认可吗？
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#b91c1c]" />
                  录用条件、规章制度，当时有没有让员工签字？
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-gray-300" />
                  如果员工申请仲裁，我们能拿出哪些证据？
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-gray-300" />
                  这个情况，要赔多少钱？
                </li>
              </ul>
            </div>
            {/* 右列：员工 */}
            <div className="py-6 pl-0 md:w-1/2 md:pl-8">
              <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-gray-500">
                员工在想
              </div>
              <ul className="mt-4 space-y-2.5 text-[14px] text-[#1a2b4a]">
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#b91c1c]" />
                  公司这样辞退我，算违法吗？
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-[#b91c1c]" />
                  我能拿到 N 还是 2N？
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-gray-300" />
                  我现在手上的证据，够申请仲裁吗？
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-gray-300" />
                  仲裁要多久，我能赢吗？
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 区块三：信任数字栏 */}
      <section className="border-b border-gray-200 bg-white px-5 md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center divide-y divide-gray-200 py-5 text-center md:flex-row md:divide-x md:divide-y-0">
            <div className="w-full py-3 md:w-1/3 md:py-0">
              <div className="text-[20px] font-bold text-[#1a2b4a]">6 个</div>
              <div className="mt-1 text-[11px] leading-[1.5] text-gray-500">高频纠纷场景全覆盖</div>
            </div>
            <div className="w-full py-3 md:w-1/3 md:py-0">
              <div className="text-[20px] font-bold text-[#1a2b4a]">双视角</div>
              <div className="mt-1 text-[11px] leading-[1.5] text-gray-500">企业方与员工方均可诊断</div>
            </div>
            <div className="w-full py-3 md:w-1/3 md:py-0">
              <div className="text-[20px] font-bold text-[#1a2b4a]">真实</div>
              <div className="mt-1 text-[11px] leading-[1.5] text-gray-500">基于仲裁裁判规律及法律条文构建</div>
            </div>
          </div>
        </div>
      </section>

      {/* 区块四：创始人背书 */}
      <section className="border-b border-gray-200 bg-white px-5 pb-8 pt-8 md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="text-[11px] uppercase tracking-[0.1em] text-gray-500">
            为什么信任这个工具
          </div>
          <div className="mt-4 rounded-lg bg-[#f9fafb] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a2b4a] text-[14px] font-medium text-white">
                HR
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-[#1a2b4a]">工具开发者</div>
                <div className="mt-0.5 text-[12px] text-gray-500">
                  多年企业 HR 实操经验 &middot; 亲历真实劳动纠纷处理全程
                </div>
                <div className="mt-3 text-[13px] leading-[1.8] text-gray-700">
                  做 HR 那几年，见过太多企业
                  <mark className="rounded bg-[#fef2f2] px-1 text-[#b91c1c]">
                    以为自己有理，仲裁才发现拿不出证据
                  </mark>
                  。也见过员工
                  <mark className="rounded bg-[#fef2f2] px-1 text-[#b91c1c]">
                    明明被违法辞退，却不知道自己有权拿 2 倍赔偿
                  </mark>
                  。不是大家不努力，是在正式处理之前，根本没有人帮你把风险讲清楚。这个工具就是为了填补这个空白。
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 区块五：用户证言 */}
      <section className="border-b border-gray-200 bg-white px-5 pb-8 pt-8 md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="text-[11px] uppercase tracking-[0.1em] text-gray-500">
            用过的人怎么说
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* 证言 1 */}
            <div className="rounded-lg bg-[#f9fafb] px-4 py-[14px]">
              <p className="text-[13px] leading-[1.75] text-gray-700">
                <span className="text-[#b91c1c]">{'“'}</span>
                做完才知道，录用条件没让员工签字是最大的漏洞。差点就发通知了。
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] text-gray-500">深圳 &middot; 制造业 HR</span>
                <span className="rounded bg-[#eff6ff] px-2 py-0.5 text-[10px] text-[#1d4ed8]">企业方</span>
              </div>
            </div>
            {/* 证言 2 */}
            <div className="rounded-lg bg-[#f9fafb] px-4 py-[14px]">
              <p className="text-[13px] leading-[1.75] text-gray-700">
                <span className="text-[#b91c1c]">{'“'}</span>
                公司叫我走，我不知道能不能拿钱。诊断完才知道自己有 2N 的权利。
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] text-gray-500">上海 &middot; 互联网员工</span>
                <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-[10px] text-[#15803d]">员工方</span>
              </div>
            </div>
            {/* 证言 3 */}
            <div className="rounded-lg bg-[#f9fafb] px-4 py-[14px]">
              <p className="text-[13px] leading-[1.75] text-gray-700">
                <span className="text-[#b91c1c]">{'“'}</span>
                规章制度没有经过民主程序这个坑，工具直接给我点出来了，及时止损。
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] text-gray-500">广州 &middot; 连锁门店负责人</span>
                <span className="rounded bg-[#eff6ff] px-2 py-0.5 text-[10px] text-[#1d4ed8]">企业方</span>
              </div>
            </div>
            {/* 证言 4 */}
            <div className="rounded-lg bg-[#f9fafb] px-4 py-[14px]">
              <p className="text-[13px] leading-[1.75] text-gray-700">
                <span className="text-[#b91c1c]">{'“'}</span>
                一直以为不签合同没关系，诊断完发现公司欠我将近 11 个月双倍工资。
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] text-gray-500">成都 &middot; 销售岗员工</span>
                <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-[10px] text-[#15803d]">员工方</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 区块六：诊断报告示例 */}
      <section className="border-b border-gray-200 bg-white px-5 pb-8 pt-8 md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="text-[11px] uppercase tracking-[0.1em] text-gray-500">
            诊断报告示例
          </div>
          <div className="mt-4 rounded-lg bg-[#f9fafb] p-5">
            {/* 卡片顶栏 */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-800">
                试用期解除争议 &middot; 企业方诊断
              </span>
              <span className="rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-0.5 text-[11px] text-[#991b1b]">
                高风险
              </span>
            </div>
            {/* 风险条目 */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#b91c1c]" />
                <span className="flex-1 text-[13px] text-gray-700">
                  无书面录用条件，解除依据无法在仲裁中举证
                </span>
                <span className="shrink-0 text-[11px] text-gray-500">
                  劳动合同法 第21条
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#b91c1c]" />
                <span className="flex-1 text-[13px] text-gray-700">
                  解除通知仅口头告知，送达程序存在瑕疵
                </span>
                <span className="shrink-0 text-[11px] text-gray-500">
                  劳动合同法 第50条
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#d97706]" />
                <span className="flex-1 text-[13px] text-gray-700">
                  无阶段性考核记录，不符合录用条件难以量化
                </span>
                <span className="shrink-0 text-[11px] text-gray-500">
                  举证责任
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#16a34a]" />
                <span className="flex-1 text-[13px] text-gray-700">
                  劳动合同已签订，试用期约定合规
                </span>
                <span className="shrink-0 text-[11px] text-gray-500">
                  无风险
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 区块七：三步诊断流程 */}
      <section className="border-b border-gray-200 bg-white px-5 pb-8 pt-8 md:px-11">
        <div className="mx-auto max-w-6xl">
          <div className="text-[11px] uppercase tracking-[0.1em] text-gray-500">
            三步完成诊断
          </div>
          <div className="mt-4">
            {/* 步骤 1 */}
            <div className="flex gap-4 border-b border-gray-200 py-4">
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#1a2b4a] text-[11px] font-medium text-white">
                1
              </div>
              <div>
                <div className="text-[14px] font-medium text-[#1a2b4a]">
                  选择身份和纠纷场景
                </div>
                <div className="mt-1 text-[12px] leading-[1.6] text-gray-500">
                  企业方或员工方，6 个高频场景覆盖试用期、违纪、绩效、调岗、加班费、离职补偿
                </div>
              </div>
            </div>
            {/* 步骤 2 */}
            <div className="flex gap-4 border-b border-gray-200 py-4">
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#1a2b4a] text-[11px] font-medium text-white">
                2
              </div>
              <div>
                <div className="text-[14px] font-medium text-[#1a2b4a]">
                  回答结构化问卷（约 3 分钟）
                </div>
                <div className="mt-1 text-[12px] leading-[1.6] text-gray-500">
                  每题均基于真实仲裁争议点设计，直接定位证据和流程缺口，附对应法律条文
                </div>
              </div>
            </div>
            {/* 步骤 3 */}
            <div className="flex gap-4 border-b border-gray-200 py-4">
              <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#1a2b4a] text-[11px] font-medium text-white">
                3
              </div>
              <div>
                <div className="text-[14px] font-medium text-[#1a2b4a]">
                  获取风险诊断报告
                </div>
                <div className="mt-1 text-[12px] leading-[1.6] text-gray-500">
                  免费版展示风险等级与主要争议点；完整版生成 7 天补强方案、文书模板与处理路径建议
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShareRecommend />

      {/* 底部免责声明 */}
      <footer className="bg-white px-5 py-[18px] md:px-11">
        <p className="text-center text-[11px] leading-[1.7] text-gray-500">
          本工具仅基于用户填写信息进行劳动纠纷风险初步诊断，不构成正式法律意见。
          <br />
          具体案件建议结合完整事实及当地裁判口径综合判断，必要时咨询持证律师。
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link href="/admin" className="text-[11px] text-gray-400 underline hover:text-gray-600">管理后台</Link>
        </div>
      </footer>
    </main>
  );
}
