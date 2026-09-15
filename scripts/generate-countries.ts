/**
 * Regenerates `data/countries.json`: every country the flag provider knows,
 * with its display name and one of the fixed geographic zones.
 *
 * Usage: pnpm countries:generate
 *
 * Names come from flagcdn (the same provider that serves the flags) and the
 * region of each country from FIRST.org; both are free and need no API key.
 * Regions are folded into the seven zones the app recognises. The generated
 * file is committed so the app never depends on these services at runtime
 * for zone information.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ZONES, type Zone } from "../shared/utils/zones";
import { COUNTRY_NAMES_URL, buildCountryList } from "../shared/utils/countries";

const OUTPUT = fileURLToPath(new URL("../data/countries.json", import.meta.url));

const REGIONS_URL = "https://api.first.org/data/v1/countries?limit=300";

/** FIRST.org region -> app zone. Regions missing here are left out (Antarctic). */
const REGION_ZONES: Record<string, Zone> = {
  "North America": "North America",
  "Central America": "Central America",
  "The Caribbean": "Central America",
  "South America": "South America",
  Africa: "Africa",
  Asia: "Asia",
  "Middle East": "Asia",
  Europe: "Europe",
  Oceania: "Australia",
};

/**
 * Per-country corrections. Mexico is grouped with Central America by FIRST.org
 * but the app (and its map) treat it as North America; the rest are codes the
 * flag provider has and FIRST.org lacks.
 */
const CODE_ZONES: Record<string, Zone> = {
  mx: "North America",
  xk: "Europe", // Kosovo
};

async function main() {
  const [names, regions] = await Promise.all([
    fetch(COUNTRY_NAMES_URL).then((r) => r.json()) as Promise<Record<string, string>>,
    fetch(REGIONS_URL)
      .then((r) => r.json())
      .then((json: { data: Record<string, { country: string; region: string }> }) => json.data),
  ]);

  const unmatched: string[] = [];
  const skipped: string[] = [];
  const zones = Object.fromEntries(Object.entries(names)
    .filter(([code]) => /^[a-z]{2}$/.test(code))
    .flatMap(([code, label]) => {
      const region = regions[code.toUpperCase()]?.region;
      const zone = CODE_ZONES[code] ?? (region ? REGION_ZONES[region] : undefined);
      if (!zone) {
        (region ? skipped : unmatched).push(`${code} (${label}${region ? `, ${region}` : ""})`);
        return [];
      }
      return [[code, zone]];
    }));
  const countries = buildCountryList(names, zones);

  writeFileSync(OUTPUT, `${JSON.stringify(countries, null, 2)}\n`);

  console.log(`Wrote ${countries.length} countries to data/countries.json`);
  for (const zone of ZONES) {
    console.log(`  ${zone.padEnd(16)} ${countries.filter((c) => c.zone === zone).length}`);
  }
  if (skipped.length) console.log(`Skipped (no zone): ${skipped.join(", ")}`);
  if (unmatched.length) console.log(`Unmatched by FIRST.org: ${unmatched.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
