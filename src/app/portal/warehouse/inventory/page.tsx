"use client";

import { useState } from "react";
import { MOCK_INVENTORY } from "@/lib/mock-data";
import { InventoryRoll } from "@/types";
import { formatNumber } from "@/lib/utils";
import { 
  Barcode, 
  Search, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Scan,
  RefreshCw
} from "lucide-react";

export default function WarehouseInventoryPage() {
  const [inventory, setInventory] = useState<InventoryRoll[]>(MOCK_INVENTORY);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [activeScanResult, setActiveScanResult] = useState<InventoryRoll | null>(null);

  const handleSimulateScan = (barcode: string) => {
    setScannedBarcode(barcode);
    const found = inventory.find(r => r.rollBarcode.toLowerCase() === barcode.trim().toLowerCase());
    if (found) {
      setActiveScanResult(found);
    } else {
      setActiveScanResult(null);
    }
  };

  const handleDeductMeters = (rollId: string, amount: number) => {
    setInventory(prev =>
      prev.map(r => {
        if (r.id !== rollId) return r;
        const newMeters = Math.max(0, r.currentMeters - amount);
        const updated = { ...r, currentMeters: newMeters };
        if (activeScanResult && activeScanResult.id === rollId) {
          setActiveScanResult(updated);
        }
        return updated;
      })
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-amber animate-pulse" />
            <span className="text-xs font-bold text-accent-amber uppercase tracking-wider">
              PRD Modul Gudang & Logistik Tekstil
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Kontrol Stok Roll Kain & Scanner Barcode
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen fisik gulungan bahan poliester per nomor lot batch, sisa meter lari, dan lokasi rak gudang.
          </p>
        </div>

        {/* Quick Simulator Barcode button */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Pilih Barcode Roll:</span>
          {inventory.slice(0, 3).map((r) => (
            <button
              key={r.id}
              onClick={() => handleSimulateScan(r.rollBarcode)}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-accent-cyan hover:border-accent-cyan"
            >
              {r.rollBarcode.split("-")[1]}-{r.rollBarcode.split("-")[2]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Barcode Scanner Terminal Widget */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scan className="w-4 h-4 text-accent-cyan animate-pulse" />
                <span>Simulasi Scanner Handheld</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                Input Barcode / Scan Gun:
              </label>
              <div className="relative">
                <Barcode className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Contoh: ROL-DFM-135-0981"
                  value={scannedBarcode}
                  onChange={(e) => handleSimulateScan(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-accent-cyan focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Scan Result Card */}
            {activeScanResult ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-brand-500/40 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-accent-cyan font-bold block">{activeScanResult.rollBarcode}</span>
                    <span className="text-white font-bold text-sm block mt-0.5">{activeScanResult.fabricName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold text-[10px]">
                    {activeScanResult.batchLot}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Sisa Panjang:</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {activeScanResult.currentMeters} m
                    </span>
                    <span className="text-slate-500 text-[10px]"> (Awal: {activeScanResult.initialMeters} m)</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Lokasi Rak:</span>
                    <span className="text-slate-200 font-medium block mt-1">
                      {activeScanResult.warehouseLocation}
                    </span>
                  </div>
                </div>

                {/* Operator Roll Cut Action */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Potong Bahan untuk SPK Sublimasi:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeductMeters(activeScanResult.id, 25)}
                      disabled={activeScanResult.currentMeters < 25}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 disabled:opacity-40 text-slate-200 hover:text-white font-mono font-bold text-[11px]"
                    >
                      Potong 25m
                    </button>
                    <button
                      onClick={() => handleDeductMeters(activeScanResult.id, 50)}
                      disabled={activeScanResult.currentMeters < 50}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 disabled:opacity-40 text-slate-200 hover:text-white font-mono font-bold text-[11px]"
                    >
                      Potong 50m
                    </button>
                  </div>
                </div>
              </div>
            ) : scannedBarcode ? (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300">
                Barcode tidak terdaftar dalam database gudang.
              </div>
            ) : null}

          </div>
        </div>

        {/* Right: Master Roll Inventory Table */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daftar Fisik Gulungan Kain di Gudang:
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Total Tersedia: {formatNumber(inventory.reduce((sum, r) => sum + r.currentMeters, 0))} Meter
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">No. Barcode & Lot</th>
                    <th className="py-3 px-4">Nama Kain</th>
                    <th className="py-3 px-4">Sisa Meter</th>
                    <th className="py-3 px-4">Lokasi Rak</th>
                    <th className="py-3 px-4 text-center">Aksi Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {inventory.map((roll) => {
                    const percentLeft = Math.round((roll.currentMeters / roll.initialMeters) * 100);

                    return (
                      <tr key={roll.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-accent-cyan">{roll.rollBarcode}</div>
                          <div className="text-slate-500 text-[10px]">{roll.batchLot}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{roll.fabricName}</div>
                          <div className="text-slate-400 text-[10px]">{roll.gsm} GSM</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-white">
                            {roll.currentMeters} / {roll.initialMeters} m
                          </div>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percentLeft > 50 ? "bg-emerald-400" : percentLeft > 25 ? "bg-amber-400" : "bg-red-400"
                              }`}
                              style={{ width: `${percentLeft}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                            <span>{roll.warehouseLocation}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSimulateScan(roll.rollBarcode)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white transition-colors text-[11px]"
                          >
                            Pilih Roll
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
