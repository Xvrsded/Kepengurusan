import { NextResponse } from "next/server";

/**
 * Health check endpoint untuk monitoring aplikasi
 * Digunakan oleh hook usePing untuk mengecek koneksi ke server
 * 
 * Response:
 * - status: 'ok' | 'error'
 * - timestamp: ISO string waktu server
 * - uptime: durasi server berjalan dalam detik
 */
export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PING API] Error in health check:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
