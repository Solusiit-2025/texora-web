"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Barcode, 
  QrCode, 
  Truck, 
  Scissors, 
  PackageCheck, 
  CheckCircle2, 
  Clock, 
  Search, 
  Sparkles, 
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Printer
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface FulfillmentTask {
  id: string;
  orderNumber: string;
  customerCompany: string;
  fabricName: string;
  gsm: number;
  lengthMeters: number;
  allocatedRollBatch: string;
  cuttingTable: string;
  packagingType: string;
  courier: string;
  trackingNo?: string;
  stage: "READY_TO_CUT" | "CUTTING_IN_PROGRESS" | "PACKED_WATERPROOF" | "DISPATCHED";
}

export default function WarehouseFulfillmentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const [tasks, setTasks] = useState<FulfillmentTask[]>([
    {
      id: "ful-1",
      orderNumber: "TEX-202610-001",
      customerCompany: "PT. Garment Kreatif Nusantara",
      fabricName: "Dryfit Milano Premium",
      gsm: 135,
      lengthMeters: 500,
      allocatedRollBatch: "BATCH-2610-MIL-01",
      cuttingTable: "Meja Potong Industri A-02",
      packagingType: "Plastic Shrink Wrapping Heavy Duty + Polypropylene Sack",
      courier: "Armada Texora Fleet #02",
      trackingNo: "TX-DELIV-BANDUNG-881",
      stage: "PACKED_WATERPROOF",
    },
    {
      id: "ful-2",
      orderNumber: "TEX-202610-002",
      customerCompany: "Alatas Scarves Signature",
      fabricName: "Voal Ultrafine Premium Hijab",
      gsm: 85,
      lengthMeters: 300,
      allocatedRollBatch: "BATCH-2610-VOA-04",
      cuttingTable: "Meja Potong B-01 (Laser Sensor)",
      packagingType: "Double Bubble Wrap + Kardus Silinder Tabung",
      courier: "JNE Trucking Cargo",
      trackingNo: "JNE-CARGO-99214",
      stage: "CUTTING_IN_PROGRESS",
    },
    {
      id: "ful-3",
      orderNumber: "TEX-202610-003",
      customerCompany: "Runners United Club",
      fabricName: "Dryfit Heavy Athletic",
      gsm: 155,
      lengthMeters: 120,
      allocatedRollBatch: "BATCH-2610-HVY-02",
      cuttingTable: "Meja Potong Manual C-01",
      packagingType: "Standard Roll Plastic Wrap",
      courier: "Indah Logistik Cargo",
      stage: "READY_TO_CUT",
    },
  ]);

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;

    const matched = tasks.find(
      (t) => t.allocatedRollBatch.toLowerCase() === scanInput.toLowerCase() || t.orderNumber.toLowerCase() === scanInput.toLowerCase()
    );

    if (matched) {
      setScanFeedback(`✓ Barcode [${scanInput}] Terverifikasi: ${matched.fabricName} (${matched.allocatedRollBatch})`);
      setScanInput("");
    } else {
      setScanFeedback(`⚠️ Barcode [${scanInput}] Tidak Cocok dengan Antrean SPK.`);
    }

    setTimeout(() => setScanFeedback(null), 4000);
  };

  const handleAdvanceStage = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      if (t.stage === "READY_TO_CUT") return { ...t, stage: "CUTTING_IN_PROGRESS" };
      if (t.stage === "CUTTING_IN_PROGRESS") return { ...t, stage: "PACKED_WATERPROOF" };
      if (t.stage === "PACKED_WATERPROOF") return { ...t, stage: "DISPATCHED", trackingNo: `EXP-${Date.now().toString().slice(-6)}` };
      return t;
    }));
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fulfillment & Pick-and-Pack (PRD §13)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Operasional Pemotongan Roll & Pengiriman Ekspedisi
          </h1>
          <p className="text-xs text-slate-400">
            Pemindaian barcode roll, alokasi meja potong, packing tahan air, dan pembuatan resi cargo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/warehouse/inventory"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-white transition-all"
          >
            Lihat Stok Gudang Roll
          </Link>
        </div>
      </div>

      {/* Barcode Scanner Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-brand-500/30 shadow-xl">
        <form onSubmit={handleSimulateScan} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
            <Barcode className="w-6 h-6" />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Pemindai QR / Barcode Roll Bahan
            </label>
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Arahkan scanner ke QR Code roll kain atau ketik: BATCH-2610-MIL-01..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-slate-950 font-bold text-xs shadow-lg transition-all shrink-0"
          >
            Verifikasi Barcode
          </button>
        </form>

        {scanFeedback && (
          <div className="mt-3 text-xs font-semibold text-brand-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{scanFeedback}</span>
          </div>
        )}
      </div>

      {/* Fulfillment Pipeline Tasks */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Scissors className="w-5 h-5 text-brand-400" />
          <span>Antrean Pemotongan Roll & Dispatch</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-white font-mono">{task.orderNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    task.stage === "DISPATCHED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : task.stage === "PACKED_WATERPROOF"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      : task.stage === "CUTTING_IN_PROGRESS"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {task.stage.replace("_", " ")}
                  </span>
                </div>

                <div className="text-xs font-bold text-brand-300">{task.customerCompany}</div>

                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                  <span>Kain: <strong>{task.fabricName} ({task.gsm} GSM)</strong></span>
                  <span>•</span>
                  <span>Volume: <strong className="text-white">{task.lengthMeters} Meter</strong></span>
                  <span>•</span>
                  <span className="font-mono text-brand-400">Batch: {task.allocatedRollBatch}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-4 pt-1">
                  <span>{task.cuttingTable}</span>
                  <span>•</span>
                  <span>Ekspedisi: {task.courier}</span>
                  {task.trackingNo && <span className="font-mono text-white">Resi: {task.trackingNo}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {task.stage !== "DISPATCHED" && (
                  <button
                    type="button"
                    onClick={() => handleAdvanceStage(task.id)}
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                  >
                    <span>Lanjutkan Tahap: {
                      task.stage === "READY_TO_CUT" 
                        ? "Mulai Potong" 
                        : task.stage === "CUTTING_IN_PROGRESS"
                        ? "Selesai Packing"
                        : "Kirim Ekspedisi"
                    }</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => alert(`Mencetak label pengiriman roll untuk ${task.orderNumber}...`)}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Label Resi</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
