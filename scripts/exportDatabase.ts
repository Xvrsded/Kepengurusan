/**
 * Database Export Script
 * 
 * This script exports all data from Supabase tables to JSON and CSV formats.
 * It can be used for manual backups or data migration.
 * 
 * Usage:
 * ```bash
 * npx tsx scripts/exportDatabase.ts
 * ```
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { writeFile } from "fs/promises";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = ["citizens", "letters", "iuran", "iuran_types", "iuran_payments", "notifications"];

export async function exportTableToJson(tableName: string): Promise<any[]> {
  const { data, error } = await supabase.from(tableName).select("*");
  if (error) {
    console.error(`Error exporting ${tableName}:`, error.message);
    return [];
  }
  return data || [];
}

export async function exportTableToCSV(tableName: string, data: any[]): Promise<string> {
  if (!data.length) return "";
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",");
  
  const rows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string") {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",");
  });
  
  return [headerRow, ...rows].join("\n");
}

export async function exportDatabase() {
  console.log("Starting database export...");
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const exportDir = join(process.cwd(), "exports");
  const jsonFile = join(exportDir, `backup-${timestamp}.json`);
  
  const allData: Record<string, any[]> = {};
  
  for (const table of TABLES) {
    console.log(`Exporting ${table}...`);
    const data = await exportTableToJson(table);
    allData[table] = data;
    
    // Generate and write CSV
    const csv = await exportTableToCSV(table, data);
    if (csv) {
      const csvPath = join(exportDir, `${table}-${timestamp}.csv`);
      try {
        await writeFile(csvPath, csv);
        console.log(`CSV for ${table} saved to: ${csvPath}`);
      } catch (error) {
        console.error(`Error writing CSV for ${table}:`, error);
      }
    }
  }
  
  // Write JSON backup
  try {
    await writeFile(jsonFile, JSON.stringify(allData, null, 2));
    console.log(`JSON backup saved to: ${jsonFile}`);
  } catch (error) {
    console.error("Error writing JSON file:", error);
  }
  
  console.log("\nExport complete!");
  console.log(`Total records exported:`);
  for (const [table, data] of Object.entries(allData)) {
    console.log(`  ${table}: ${data.length} records`);
  }
}

// Run export if this file is executed directly
if (require.main === module) {
  exportDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Export failed:", error);
      process.exit(1);
    });
}
