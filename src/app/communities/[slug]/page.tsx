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

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<CommunityData | null>(null);
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
    }
  }, [load]);

  function handleRangeChange(from: string, to: string, period: string) {
    load(from, to, period);
  }

  const incomeAccounts = (data?.accounts || []).filter((a) => a.type === "income");
  const expenseAccounts = (data?.accounts || []).filter((a) => a.type === "expense");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {data?.communityName || decodeURIComponent(slug)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Community P&L Detail</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {data && data.accounts.length > 0 && (
          <ExportButtons
            fileName={`${(data.communityName || slug).replace(/\s+/g, "_")}_PnL`}
            title={`${data.communityName} — P&L`}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard label="Total Income" value={fmtK(data.totalIncome)} color="text-emerald-600" />
            <KpiCard label="Total Expenses" value={fmtK(data.totalExpenses)} color="text-red-600" />
            <KpiCard
              label="Net Income"
              value={fmtK(data.netIncome)}
              color={data.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AccountPanel title="Income" accounts={incomeAccounts} total={data.totalIncome} />
            <AccountPanel title="Expenses" accounts={expenseAccounts} total={data.totalExpenses} />
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

function AccountPanel({
  title,
  accounts,
  total,
}: {
  title: string;
  accounts: Account[];
  total: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className={`font-mono text-sm font-bold ${title === "Income" ? "text-emerald-600" : "text-red-600"}`}>
          {fmtK(total)}
        </span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {accounts
          .sort((a, b) => b.amount - a.amount)
          .map((a) => (
            <div key={a.number} className="px-6 py-3 flex justify-between text-sm">
              <div>
                <span className="text-gray-900 dark:text-white">{a.name}</span>
                <span className="text-gray-400 ml-2 text-xs">{a.number}</span>
              </div>
              <span className="font-mono text-gray-600 dark:text-gray-400">{fmt(a.amount)}</span>
            </div>
          ))}
        {accounts.length === 0 && (
          <div className="px-6 py-4 text-sm text-gray-400">No accounts</div>
        )}
      </div>
    </div>
  );
}
