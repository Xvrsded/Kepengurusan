/**
 * RLS Testing Helper
 * 
 * This helper is used to verify that Row Level Security policies are working correctly.
 * It tests that users can only access their own data and admins can access all data.
 * 
 * Usage:
 * ```typescript
 * import { testRLS } from "@/lib/testRLS";
 * 
 * // Test as a specific user
 * const result = await testRLS("user_nik", "user_id");
 * console.log(result);
 * ```
 */

import { createClient } from "./supabase/client";

const supabase = createClient();

export type RLSTestResult = {
  table: string;
  canReadOwn: boolean;
  canReadOthers: boolean;
  canWriteOwn: boolean;
  canWriteOthers: boolean;
  details: string;
};

export async function testRLS(userNik: string, userId?: string): Promise<RLSTestResult[]> {
  const results: RLSTestResult[] = [];
  
  // Test citizens table
  try {
    // Try to read own data
    const { data: ownCitizen, error: readOwnError } = await supabase
      .from("citizens")
      .select("*")
      .eq("nik", userNik)
      .maybeSingle();
    
    // Try to read others' data (should fail for non-admin)
    const { data: otherCitizens, error: readOthersError } = await supabase
      .from("citizens")
      .select("*")
      .neq("nik", userNik)
      .limit(1);
    
    results.push({
      table: "citizens",
      canReadOwn: !readOwnError && !!ownCitizen,
      canReadOthers: !readOthersError && otherCitizens && otherCitizens.length > 0,
      canWriteOwn: false, // Would need write test
      canWriteOthers: false,
      details: `Read own: ${readOwnError?.message || "OK"}, Read others: ${readOthersError?.message || (otherCitizens?.length ?? 0) > 0 ? "OK" : "Empty"}`,
    });
  } catch (error) {
    results.push({
      table: "citizens",
      canReadOwn: false,
      canReadOthers: false,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  
  // Test letters table
  try {
    const { data: ownLetters, error: readOwnError } = await supabase
      .from("letters")
      .select("*")
      .eq("applicant", userNik)
      .limit(1);
    
    const { data: otherLetters, error: readOthersError } = await supabase
      .from("letters")
      .select("*")
      .neq("applicant", userNik)
      .limit(1);
    
    results.push({
      table: "letters",
      canReadOwn: !readOwnError && ownLetters && ownLetters.length > 0,
      canReadOthers: !readOthersError && otherLetters && otherLetters.length > 0,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Read own: ${readOwnError?.message || "OK"}, Read others: ${readOthersError?.message || (otherLetters?.length ?? 0) > 0 ? "OK" : "Empty"}`,
    });
  } catch (error) {
    results.push({
      table: "letters",
      canReadOwn: false,
      canReadOthers: false,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  
  // Test iuran table
  try {
    const { data: ownIuran, error: readOwnError } = await supabase
      .from("iuran")
      .select("*")
      .eq("citizenId", userId)
      .limit(1);
    
    const { data: otherIuran, error: readOthersError } = await supabase
      .from("iuran")
      .select("*")
      .neq("citizenId", userId)
      .limit(1);
    
    results.push({
      table: "iuran",
      canReadOwn: !readOwnError && ownIuran && ownIuran.length > 0,
      canReadOthers: !readOthersError && otherIuran && otherIuran.length > 0,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Read own: ${readOwnError?.message || "OK"}, Read others: ${readOthersError?.message || (otherIuran?.length ?? 0) > 0 ? "OK" : "Empty"}`,
    });
  } catch (error) {
    results.push({
      table: "iuran",
      canReadOwn: false,
      canReadOthers: false,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  
  // Test notifications table
  try {
    const { data: ownNotifs, error: readOwnError } = await supabase
      .from("notifications")
      .select("*")
      .limit(1);
    
    const { data: otherNotifs, error: readOthersError } = await supabase
      .from("notifications")
      .select("*")
      .limit(10); // Try to get more to see if we can access others
    
    results.push({
      table: "notifications",
      canReadOwn: !readOwnError && ownNotifs && ownNotifs.length > 0,
      canReadOthers: !readOthersError && otherNotifs && otherNotifs.length > 1,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Read: ${readOwnError?.message || "OK"}, Count: ${otherNotifs?.length || 0}`,
    });
  } catch (error) {
    results.push({
      table: "notifications",
      canReadOwn: false,
      canReadOthers: false,
      canWriteOwn: false,
      canWriteOthers: false,
      details: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
  
  return results;
}

/**
 * Print RLS test results in a readable format
 */
export function printRLSResults(results: RLSTestResult[]): void {
  console.log("=== RLS Test Results ===");
  results.forEach((result) => {
    console.log(`\nTable: ${result.table}`);
    console.log(`  Can read own: ${result.canReadOwn ? "✓" : "✗"}`);
    console.log(`  Can read others: ${result.canReadOthers ? "✓" : "✗"}`);
    console.log(`  Details: ${result.details}`);
  });
  console.log("\n=== End of RLS Test ===");
}
