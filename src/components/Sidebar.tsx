"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const communityNav = [
  { href: "/communities", label: "All Communities", icon: "🏘️" },
  { href: "/kpi-dashboard", label: "KPI Dashboard", icon: "📈" },
  { href: "/financials", label: "Financial Reports", icon: "💰" },
  { href: "/aged-receivables", label: "Aged Receivables", icon: "⏰" },
  { href: "/lease-expirations", label: "Lease Expirations", icon: "📅" },
  { href: "/rent-roll", label: "Rent Roll", icon: "🏠" },
  { href: "/vendors", label: "Vendors", icon: "🔧" },
];

const financeNav = [
  { href: "/cash-flow", label: "Cash Flow", icon: "📊" },
  { href: "/budget-vs-actuals", label: "Budget vs Actuals", icon: "📋" },
  { href: "/banking", label: "Banking", icon: "🏦" },
];

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: { href: string; label: string; icon: string }[];
  pathname: string;
}) {
  return (
    <>
      <p className="text-xs font-semibold text-[#2E7D6F] uppercase tracking-wider px-4 mb-2">
        {label}
      </p>
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-[#2E7D6F] text-white"
                : "text-gray-300 hover:bg-[#2E7D6F]/20 hover:text-[#2E7D6F]"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white flex flex-col z-50">
      <div className="p-4 border-b border-slate-600">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors ${
            pathname === "/"
              ? "bg-[#2E7D6F] text-white"
              : "text-white hover:bg-[#2E7D6F]/20 hover:text-[#2E7D6F]"
          }`}
        >
          <Image
            src="/logo.png"
            alt="Park Vista Senior Housing Management"
            width={180}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <NavSection label="Communities" items={communityNav} pathname={pathname} />

        <div className="my-4 border-t border-slate-600" />

        <NavSection label="Finance" items={financeNav} pathname={pathname} />
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-gray-500">
        Data refreshes every 5 min
      </div>
    </aside>
  );
}
