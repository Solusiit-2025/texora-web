import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth/session";
import {
  createBackup,
  pruneOldBackups,
  restoreBackup,
  BACKUP_DIR,
} from "@/lib/backup";

export async function handleBackupPost(
  req: NextRequest,
  defaultAction: "create" | "restore" = "create"
): Promise<NextResponse> {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMINISTRATOR") {
      return NextResponse.json(
        { success: false, error: "Hanya Administrator yang dapat mengakses backup." },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let body: any = null;
    let uploadedFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      uploadedFile = (form.get("file") || form.get("backup")) as File | null;
      body = {
        action: form.get("action") || defaultAction,
        filename: form.get("filename") ? String(form.get("filename")) : undefined,
        keep: form.get("keep") ? Number(form.get("keep")) : undefined,
      };
    } else {
      body = await req.json().catch(() => null);
    }

    const action = body?.action || (uploadedFile ? "restore" : defaultAction);

    if (action === "prune") {
      const removed = await pruneOldBackups(Number(body?.keep) || 7);
      return NextResponse.json({
        success: true,
        message: `${removed} file backup lama berhasil dihapus.`,
      });
    }

    if (action === "restore") {
      let payload: any = null;

      if (uploadedFile && typeof uploadedFile.text === "function") {
        const text = await uploadedFile.text();
        payload = JSON.parse(text);
      }

      if (!payload && body?.filename) {
        const safeName = path.basename(String(body.filename));
        const filepath = path.join(BACKUP_DIR, safeName);
        if (!fs.existsSync(filepath) || !safeName.endsWith(".json")) {
          return NextResponse.json(
            { success: false, error: "File backup tidak ditemukan." },
            { status: 404 }
          );
        }
        payload = JSON.parse(fs.readFileSync(filepath, "utf-8"));
      }

      if (!payload) {
        payload = body?.backup || body?.data || body?.payload || body;
        if (payload && (payload.action || payload.filename || payload.keep)) {
          const { action: _a, filename: _f, keep: _k, ...rest } = payload;
          if (rest && Object.keys(rest).length > 0 && (rest.data || rest.meta)) {
            payload = rest;
          }
        }
      }

      if (!payload || !payload.data) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Payload backup tidak ditemukan. Unggah file atau pilih file yang tersimpan.",
          },
          { status: 400 }
        );
      }

      const result = await restoreBackup(payload, { createdBy: user.id });

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          tables: result.tables,
          recordCount: result.recordCount,
        },
      });
    }

    const result = await createBackup({ trigger: "MANUAL", createdBy: user.id });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        filename: result.filename,
        sizeBytes: result.sizeBytes,
        recordCount: result.recordCount,
        tables: result.tables,
      },
    });
  } catch (error: any) {
    console.error("[backup-http] Gagal memproses permintaan backup:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Gagal memproses permintaan backup." },
      { status: 500 }
    );
  }
}
