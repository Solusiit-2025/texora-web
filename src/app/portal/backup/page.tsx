"use client";

import { DatabaseBackup } from "lucide-react";
import { BackupPanel } from "@/components/common/BackupPanel";

export default function PortalBackupPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30">
          <DatabaseBackup className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Backup &amp; Restore Database</h1>
          <p className="text-xs text-slate-400">
            Kelola backup database dan pulihkan data dari file backup.
          </p>
        </div>
      </div>
      <BackupPanel />
    </div>
  );
}