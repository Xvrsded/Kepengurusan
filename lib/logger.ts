/**
 * Logging Utility
 * 
 * This utility provides structured logging for critical actions in the application.
 * Logs can be sent to a monitoring service or stored in Supabase for audit purposes.
 * 
 * Usage:
 * ```typescript
 * import { logAction } from "@/lib/logger";
 * 
 * logAction("payment", "iuran_payment", { amount: 50000, citizenId: 1 });
 * ```
 */

export type LogLevel = "info" | "warn" | "error";

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  action: string;
  context: string;
  details: Record<string, any>;
  userId?: string;
  userRole?: string;
};

// Store logs in memory (in production, send to monitoring service)
const logs: LogEntry[] = [];

export function logAction(
  action: string,
  context: string,
  details: Record<string, any>,
  level: LogLevel = "info",
  userId?: string,
  userRole?: string
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    action,
    context,
    details,
    userId,
    userRole,
  };
  
  logs.push(entry);
  
  // Log to console for development
  const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
  console.log(prefix, action, context, details);
  
  // In production, send to monitoring service (e.g., Sentry, LogRocket)
  // or store in Supabase audit_logs table
}

export function getLogs(): LogEntry[] {
  return [...logs];
}

export function clearLogs(): void {
  logs.length = 0;
}

// Specific logging helpers
export function logPayment(details: {
  citizenId: number;
  amount: number;
  iuranTypeId: number;
  status: string;
}, userId?: string, userRole?: string): void {
  logAction("payment", "iuran_payment", details, "info", userId, userRole);
}

export function logLetterRequest(details: {
  type: string;
  applicant: string;
  status: string;
}, userId?: string, userRole?: string): void {
  logAction("letter_request", "letters", details, "info", userId, userRole);
}

export function logStatusChange(details: {
  table: string;
  recordId: number;
  oldStatus: string;
  newStatus: string;
}, userId?: string, userRole?: string): void {
  logAction("status_change", details.table, details, "info", userId, userRole);
}

export function logError(error: Error, context: string, details?: Record<string, any>): void {
  logAction("error", context, {
    message: error.message,
    stack: error.stack,
    ...details,
  }, "error");
}

export function logAuthEvent(details: {
  event: "login" | "logout" | "signup" | "session_refresh";
  userId?: string;
  userRole?: string;
}): void {
  logAction("auth", details.event, details, "info", details.userId, details.userRole);
}
