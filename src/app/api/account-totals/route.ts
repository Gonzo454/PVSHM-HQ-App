import { fetchReport, parseAmount, cachedJson } from "@/lib/appfolio";
import { getCommunityByName } from "@/lib/communities";

interface AccountTotalRow {
  property_name?: string;
  net_amount?: string;
  ending_balance?: string;
}

export async function GET() {
  try {
    const rows = await fetchReport<AccountTotalRow>("account_totals");

    const properties = rows
      .filter((r) => r.property_name && r.property_name.trim())
      .map((r) => {
        const name = r.property_name!.trim();
        const community = getCommunityByName(name);
        return {
          name,
          slug: community?.slug || encodeURIComponent(name),
          location: community?.location || "",
          netAmount: parseAmount(r.net_amount),
          endingBalance: parseAmount(r.ending_balance),
        };
      });

    return cachedJson({ properties });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
