import { NextRequest } from "next/server";
import { handleBackupPost } from "@/lib/backup-http";

export async function POST(req: NextRequest) {
  return handleBackupPost(req, "restore");
}