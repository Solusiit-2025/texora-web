import { NextRequest, NextResponse } from "next/server";
import { handleBackupPost } from "@/lib/backup-http";

export async function POST(req: NextRequest) {
  return handleBackupPost(req, "restore");
}

export async function GET(req: NextRequest) {
  // Alias: daftar file backup (sama seperti /api/backup)
  const { GET: backupGET } = await import("../backup/route");
  return backupGET(req);
}