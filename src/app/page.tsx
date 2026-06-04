"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface CommunitySnapshot {
  name: string;
  slug: string;
  location: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  totalUnits: number;
  occupied: number;
}

interface HQData {
  communities: CommunitySnapshot[];
  portfolio: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    totalUnits: number;
    occupied: number;
    occupancyRate: number;
    communityCount: number;
  };
  alerts: {
    leasesExpiring: number;
    agedReceivables: number;
  };
  period: {
    from: string;
    to: string;
    basis: string;
  };
}

const fmtK = (n: number) =>
  (n < 0 ? "-" : "") +
  "$" +
  Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });

function Sparkbar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.abs(value) / max, 1) * 100 : 0;
  const color = value >= 0 ? "bg-emerald-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function HeadquartersPage() {
  const [data, setData] = useState<HQData | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch("/api/headquarters")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading Headquarters...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Failed to load data</p>
      </div>
    );
  }

  const maxNet = Math.max(...data.communities.map((c) => Math.abs(c.netIncome)), 1);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Headquarters
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Park Vista Senior Housing Management — {data.portfolio.communityCount} communities
          </p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {data.period.basis} · {data.period.from} to {data.period.to}
        </span>
      </div>

      {/* Portfolio KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard label="Total Income" value={fmtK(data.portfolio.totalIncome)} color="text-emerald-600" icon="💰" />
        <KpiCard label="Total Expenses" value={fmtK(data.portfolio.totalExpenses)} color="text-red-600" icon="📉" />
        <KpiCard
          label="Net Income"
          value={fmtK(data.portfolio.netIncome)}
          color={data.portfolio.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}
          icon="📊"
        />
        <KpiCard
          label="Occupancy"
          value={`${data.portfolio.occupancyRate}%`}
          subtitle={`${data.portfolio.occupied} / ${data.portfolio.totalUnits} units`}
          color="text-[#2E7D6F]"
          icon="🏠"
        />
      </div>

      {/* Needs Attention Strip */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>🔔</span> Needs Attention
        </p>
        <div className="flex flex-wrap gap-2">
          {data.alerts.leasesExpiring > 0 ? (
            <Link href="/lease-expirations">
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer">
                {data.alerts.leasesExpiring} leases expiring &lt; 90d
              </span>
            </Link>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              No leases expiring &lt; 90d
            </span>
          )}
          {data.alerts.agedReceivables > 0 && (
            <Link href="/aged-receivables">
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer">
                {fmtK(data.alerts.agedReceivables)} outstanding receivables
              </span>
            </Link>
          )}
          {data.alerts.leasesExpiring === 0 && data.alerts.agedReceivables === 0 && (
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              All clear — no items need attention
            </span>
          )}
        </div>
      </div>

      {/* Community Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Community Performance</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Community</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">State</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Income</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Expenses</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Net</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Occupancy</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.communities
              .sort((a, b) => b.netIncome - a.netIncome)
              .map((c) => (
                <tr key={c.slug} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <Link href={`/communities/${c.slug}`} className="text-[#2E7D6F] hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-500 text-xs">{c.location}</td>
                  <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                    {fmtK(c.totalIncome)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                    {fmtK(c.totalExpenses)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono font-medium ${c.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {fmtK(c.netIncome)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-xs font-medium ${c.occupancyRate >= 90 ? "text-emerald-600" : c.occupancyRate >= 75 ? "text-amber-600" : "text-red-600"}`}>
                      {c.occupancyRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Sparkbar value={c.netIncome} max={maxNet} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  color,
  icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
