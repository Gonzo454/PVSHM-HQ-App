import { fetchReport, firstOfYear, today, parseAmount } from "@/lib/appfolio";
import { COMMUNITIES } from "@/lib/communities";

interface RentRollRow {
  status?: string;
  lease_to?: string;
  property_name?: string;
}

interface ArRow {
  total_amount?: string;
}

interface AccountTotalsRow {
  property_name?: string;
  net_amount?: string;
  ending_balance?: string;
}

export async function GET() {
  try {
    const ytdFrom = firstOfYear();
    const ytdTo = today();

    const [rentRows, arRows, accountRows] = await Promise.all([
      fetchReport<RentRollRow>("rent_roll"),
      fetchReport<ArRow>("aged_receivables_detail", { as_of_date: ytdTo }),
      fetchReport<AccountTotalsRow>("account_totals", {
        posted_on_from: ytdFrom,
        posted_on_to: ytdTo,
      }),
    ]);

    // Build per-community snapshots from account_totals
    const communityMap = new Map<string, { income: number; expenses: number }>();
    for (const row of accountRows) {
      const name = row.property_name || "";
      if (!communityMap.has(name)) {
        communityMap.set(name, { income: 0, expenses: 0 });
      }
      const net = parseAmount(row.net_amount);
      const entry = communityMap.get(name)!;
      if (net > 0) entry.income += net;
      else entry.expenses += Math.abs(net);
    }

    // Occupancy per community from rent roll
    const rentByProperty = new Map<string, { total: number; occupied: number }>();
    for (const r of rentRows) {
      const prop = r.property_name || "Unknown";
      if (!rentByProperty.has(prop)) {
        rentByProperty.set(prop, { total: 0, occupied: 0 });
      }
      const entry = rentByProperty.get(prop)!;
      entry.total++;
      const s = (r.status || "").toLowerCase();
      if (s.includes("current") || s.includes("occupied")) {
        entry.occupied++;
      }
    }

    // Map communities with financial data
    const communities = COMMUNITIES.map((c) => {
      const fin = communityMap.get(c.name) || { income: 0, expenses: 0 };
      const occ = rentByProperty.get(c.name) || { total: 0, occupied: 0 };
      return {
        name: c.name,
        slug: c.slug,
        location: c.location,
        totalIncome: Math.round(fin.income),
        totalExpenses: Math.round(fin.expenses),
        netIncome: Math.round(fin.income - fin.expenses),
        totalUnits: occ.total,
        occupied: occ.occupied,
        occupancyRate: occ.total > 0 ? Math.round((occ.occupied / occ.total) * 100) : 0,
      };
    });

    // Portfolio totals
    const totalIncome = communities.reduce((s, c) => s + c.totalIncome, 0);
    const totalExpenses = communities.reduce((s, c) => s + c.totalExpenses, 0);
    const totalUnits = rentRows.length;
    const occupied = rentRows.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return s.includes("current") || s.includes("occupied");
    }).length;

    // Lease expirations < 90 days
    const now = new Date();
    const ninetyDays = new Date(now.getTime() + 90 * 86400000);
    const leasesExpiring = rentRows.filter((r) => {
      if (!r.lease_to) return false;
      const d = new Date(r.lease_to);
      return d >= now && d <= ninetyDays;
    }).length;

    // Aged receivables total
    const agedReceivables = arRows.reduce((sum, r) => sum + parseAmount(r.total_amount), 0);

    return Response.json({
      communities,
      portfolio: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        totalUnits,
        occupied,
        occupancyRate: totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0,
        communityCount: COMMUNITIES.length,
      },
      alerts: {
        leasesExpiring,
        agedReceivables: Math.round(agedReceivables),
      },
      period: {
        from: ytdFrom,
        to: ytdTo,
        basis: "YTD",
      },
    });
  } catch (err) {
    console.error("Headquarters error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
