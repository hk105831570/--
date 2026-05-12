"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, FileText, Eye, LogOut } from "lucide-react";

interface CaseItem {
  id: string;
  createdAt: string;
  userRole: string;
  sceneTitle: string;
  companyName: string;
  riskLevel: string;
  riskScore: number;
  hasReport: boolean;
  reportNumber: string | null;
}

interface CasesResponse {
  cases: CaseItem[];
  total: number;
  page: number;
  pageSize: number;
}

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-red-700 bg-red-50 border-red-200",
  critical: "text-red-900 bg-red-100 border-red-300",
};

const RISK_LABELS: Record<string, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
  critical: "极高风险",
};

const ROLE_LABELS: Record<string, string> = {
  employer: "企业方",
  employee: "员工方",
};

const FILTERS = [
  { label: "全部", value: "" },
  { label: "低风险", value: "low" },
  { label: "中风险", value: "medium" },
  { label: "高风险", value: "high" },
  { label: "极高风险", value: "critical" },
];

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<CasesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [riskLevel, setRiskLevel] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        setAuthed(true);
      })
      .catch(() => {
        router.replace("/admin/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const fetchData = async (p: number, rl: string, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("pageSize", "20");
      if (rl) params.set("riskLevel", rl);
      if (q) params.set("search", q);

      const res = await fetch(`/api/admin/cases?${params.toString()}`);
      if (!res.ok) throw new Error(`请求失败: ${res.status}`);
      const json = (await res.json()) as CasesResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, riskLevel, search);
  }, [page, riskLevel, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <p className="text-sm text-slate-500">验证身份...</p>
      </main>
    );
  }

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-[#F7F8FB]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-900" />
            <h1 className="text-lg font-semibold text-slate-900">管理后台</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              诊断案例列表
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setPage(1);
                  setRiskLevel(f.value);
                }}
                className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                  riskLevel === f.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索企业名称..."
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              搜索
            </button>
          </form>
        </div>

        {/* Refresh */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {data ? `共 ${data.total} 条记录` : ""}
          </p>
          <button
            type="button"
            onClick={() => fetchData(page, riskLevel, search)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => fetchData(page, riskLevel, search)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              重试
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data?.cases.length === 0 && (
          <div className="mt-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              暂无诊断案例
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              完成一次诊断后，案例会自动出现在这里。
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              开始诊断
            </Link>
          </div>
        )}

        {/* Table */}
        {data && data.cases.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    身份
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    场景
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    企业名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    风险等级
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                    风险分
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                    AI 报告
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {new Date(c.createdAt).toLocaleDateString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {ROLE_LABELS[c.userRole] || c.userRole}
                      </span>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-sm text-slate-700">
                      {c.sceneTitle}
                    </td>
                    <td className="max-w-[120px] truncate px-4 py-3 text-sm text-slate-700">
                      {c.companyName || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                          RISK_COLORS[c.riskLevel] || ""
                        }`}
                      >
                        {RISK_LABELS[c.riskLevel] || c.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                      {c.riskScore}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.hasReport ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          已生成
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                          未生成
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        <Eye className="h-4 w-4" />
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > data.pageSize && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <span className="text-sm text-slate-600">
              第 {data.page} / {Math.ceil(data.total / data.pageSize)} 页
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.total / data.pageSize)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
