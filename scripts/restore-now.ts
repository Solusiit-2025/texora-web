import fs from "fs";
import path from "path";
import { restoreBackup } from "../src/lib/backup";

async function main() {
  const filename = "xoramateria-backup-2026-10-25T06-40-59.json";
  const filepath = path.join(process.cwd(), "backups", filename);
  const payload = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  console.log("Restoring", filename, "records:", payload?.meta?.totalRecords);
  const res = await restoreBackup(payload, { createdBy: payload?.meta?.generatedBy || null, skipSafetyBackup: true });
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.success ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});