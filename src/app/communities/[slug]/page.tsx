"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ExportButtons } from "@/components/ExportButtons";

interface Account {
  name: string;
  number: string;
  amount: number;
  type: string;
}

interface CommunityData {
  communityName: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  accounts: Account[];
  period: { from: string; to: string; method: string };
}

interface KPIProperty {
  name: string;
  revenue: number;
  expenses: number;
  noi: number;
  noiMargin: number;
  netAfterDebt: number;
  totalUnits: number;
  occupied: number;
  vacant: number;
  occupancyRate: number;
  vacancyLoss: number;
  laborPercent: number;
  laborTotal: number;
  debtService: number;
  dscr: number;
  oer: number;
  status: "Strong" | "Watch" | "Concern";
}

const fmt = (n: number) =>
  "$" +
  Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtK = (n: number) =>
  (n < 0 ? "-" : "") +
  "$" +
  Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

const statusColor = (s: string) => {
  if (s === "Strong") return "bg-emerald-100 text-emerald-800";
  if (s === "Watch") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
};

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<CommunityData | null>(null);
  const [kpi, setKpi] = useState<KPIProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const load = useCallback(
    (from?: string, to?: string, period?: string) => {
      setLoading(true);
      const qs = new URLSearchParams();
      qs.set("community", decodeURIComponent(slug));
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      if (period) qs.set("period", period);
      fetch(`/api/community-pnl?${qs.toString()}`)
        .then((r) => r.json())
        .then((d) => setData(d))
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [slug]
  );

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      load(undefined, undefined, "ytd");
      // Fetch KPI data for this property
      fetch("/api/kpi-dashboard")
        .then((r) => r.json())
        .then((d) => {
          const match = (d.communities || []).find(
            (c: KPIProperty & { slug: string }) => c.slug === slug
          );
          if (match) setKpi(match);
        })
        .catch(console.error);
    }
  }, [load, slug]);

  function handleRangeChange(from: string, to: string, period: string) {
    load(from, to, period);
  }

  const incomeAccounts = (data?.accounts || []).filter((a) => a.type === "income");
  const expenseAccounts = (data?.accounts || []).filter((a) => a.type === "expense");

  // Revenue and expense breakdowns for pie-chart-style display
  const topIncome = incomeAccounts.sort((a, b) => b.amount - a.amount).slice(0, 6);
  const topExpenses = expenseAccounts.sort((a, b) => b.amount - a.amount).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header with status badge */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.communityName || decodeURIComponent(slug)}
            </h1>
            {kpi && (
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${statusColor(kpi.status)}`}>
                {kpi.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Financial Dashboard</p>
          {kpi && (
            <p className="text-sm text-gray-400 mt-0.5">
              Est. {kpi.occupancyRate}% Occupancy · {kpi.occupied}/{kpi.totalUnits} units
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {data && data.accounts.length > 0 && (
          <ExportButtons
            fileName={`${(data.communityName || slug).replace(/\s+/g, "_")}_Financial_Dashboard`}
            title={`${data.communityName} — Financial Dashboard`}
            headers={["Type", "Account", "Number", "Amount"]}
            rows={data.accounts.map((a) => [a.type, a.name, a.number, fmt(a.amount)])}
          />
        )}
        <div className="ml-auto">
          <DateRangePicker onRangeChange={handleRangeChange} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-500">No data available</div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Total Revenue" value={fmtK(data.totalIncome)} color="text-gray-900 dark:text-white" />
            <KpiCard label="NOI" value={fmtK(data.netIncome)} color={data.netIncome >= 0 ? "text-emerald-600" : "text-red-600"} />
            {kpi && <KpiCard label="Net After Debt Svc" value={fmtK(kpi.netAfterDebt)} color={kpi.netAfterDebt >= 0 ? "text-emerald-600" : "text-red-600"} />}
            <KpiCard label="Total Expenses" value={fmtK(data.totalExpenses)} color="text-red-600" />
          </div>

          {/* Financial Health Metrics */}
          {kpi && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MiniMetric label="NOI Margin" value={`${kpi.noiMargin}%`} target="25–35%" good={kpi.noiMargin >= 25} />
              <MiniMetric label="DSCR" value={kpi.dscr > 0 ? `${kpi.dscr}x` : "—"} target="≥1.25x" good={kpi.dscr >= 1.25 || kpi.dscr === 0} />
              <MiniMetric label="OER" value={`${kpi.oer}%`} target="65–70%" good={kpi.oer <= 70} />
              <MiniMetric label="Labor %" value={`${kpi.laborPercent}%`} target="45–50%" good={kpi.laborPercent <= 50} />
              <MiniMetric label="Vacancy Loss" value={fmtK(kpi.vacancyLoss)} target="Minimize" good={kpi.vacancyLoss < 50000} />
            </div>
          )}

          {/* Revenue & Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Breakdown</h3>
                <span className="font-mono text-sm font-bold text-emerald-600">{fmtK(data.totalIncome)}</span>
              </div>
              <div className="p-4">
                {topIncome.map((a) => {
                  const pct = data.totalIncome > 0 ? (a.amount / data.totalIncome) * 100 : 0;
                  return (
                    <div key={a.number} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 truncate mr-2">{a.name}</span>
                        <span className="font-mono text-gray-600 whitespace-nowrap">{fmtK(a.amount)} <span className="text-gray-400 text-xs">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Expense Breakdown</h3>
                <span className="font-mono text-sm font-bold text-red-600">{fmtK(data.totalExpenses)}</span>
              </div>
              <div className="p-4">
                {topExpenses.map((a) => {
                  const pct = data.totalExpenses > 0 ? (a.amount / data.totalExpenses) * 100 : 0;
                  return (
                    <div key={a.number} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 truncate mr-2">{a.name}</span>
                        <span className="font-mono text-gray-600 whitespace-nowrap">{fmtK(a.amount)} <span className="text-gray-400 text-xs">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Account Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">All Accounts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Account</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Number</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Type</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {[...incomeAccounts, ...expenseAccounts]
                    .sort((a, b) => b.amount - a.amount)
                    .map((a) => (
                      <tr key={a.number} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-4 py-2.5 text-gray-900 dark:text-white">{a.name}</td>
                        <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{a.number}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${a.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {a.type}
                          </span>
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono ${a.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                          {fmt(a.amount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value, target, good }: { label: string; value: string; target: string; good: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${good ? "text-emerald-600" : "text-amber-600"}`}>{value}</p>
      <p className="text-[10px] text-gray-400">Target: {target}</p>
    </div>
  );
}
