"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface Community {
  name: string;
  slug: string;
  location: string;
  netAmount: number;
  endingBalance: number;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetch("/api/account-totals")
        .then((r) => r.json())
        .then((data) => setCommunities(data.properties || []))
        .finally(() => setLoading(false));
    }
  }, []);

  const totalNet = communities.reduce((sum, c) => sum + c.netAmount, 0);
  const profitable = communities.filter((c) => c.netAmount > 0).length;
  const unprofitable = communities.filter((c) => c.netAmount < 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Communities
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {communities.length} communities · {profitable} profitable · {unprofitable} unprofitable
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard label="Total Net Amount" value={totalNet} />
            <SummaryCard label="Profitable" value={profitable} isCurrency={false} color="text-emerald-600" />
            <SummaryCard label="Unprofitable" value={unprofitable} isCurrency={false} color="text-red-600" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Community</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Net Amount</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Ending Balance</th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {communities
                  .sort((a, b) => b.netAmount - a.netAmount)
                  .map((c) => (
                    <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <Link
                          href={`/communities/${c.slug || encodeURIComponent(c.name)}`}
                          className="text-[#2E7D6F] hover:underline"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className={`px-6 py-4 text-right font-mono ${c.netAmount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {c.netAmount >= 0 ? "+" : ""}${Math.abs(c.netAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                        ${c.endingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${c.netAmount > 0 ? "bg-emerald-500" : c.netAmount === 0 ? "bg-yellow-500" : "bg-red-500"}`} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, isCurrency = true, color }: { label: string; value: number; isCurrency?: boolean; color?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || (value >= 0 ? "text-emerald-600" : "text-red-600")}`}>
        {isCurrency ? `$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : value}
      </p>
    </div>
  );
}
