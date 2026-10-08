'use client';

import { useMemo, useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  ShoppingCart,
  Plus,
  Search,
  Printer,
  FileText,
  Truck,
  Factory,
  BadgeCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  PackageCheck,
  Wallet,
  Users,
  TrendingUp,
  ClipboardList,
  ChevronRight,
  X,
  Send,
  RotateCcw,
  ReceiptText,
} from 'lucide-react';

// ------------------------------------------------------------------
// TYPES (sample only, tanpa database)
// ------------------------------------------------------------------
type POStatus = 'DRAFT' | 'DIAJUKAN' | 'DISETUJUI' | 'DIPESAN' | 'SEBAGIAN' | 'DITERIMA' | 'BATAL';
type PRStatus = 'BARU' | 'DIPROSES' | 'SELESAI' | 'DITOLAK';
type GRNStatus = 'MENUNGGU' | 'SEBAGIAN' | 'SELESAI';

type POItem = { name: string; spec: string; qty: number; unit: string; price: number };
type PO = {
  id: string; number: string; supplier: string; category: string;
  date: string; eta: string; term: string; requester: string;
  status: POStatus; progress: number; notes: string; items: POItem[];
};
type PR = {
  id: string; number: string; requester: string; dept: string;
  date: string; needed: string; urgency: 'RENDAH' | 'NORMAL' | 'TINGGI' | 'MENDESAK';
  status: PRStatus; summary: string; estValue: number;
};
type Supplier = {
  id: string; name: string; category: string; city: string; pic: string;
  phone: string; rating: number; leadTime: number; totalPO: number;
  totalValue: number; outstanding: number; status: 'AKTIF' | 'BARU' | 'NONAKTIF';
};
type GRN = {
  id: string; number: string; po: string; supplier: string; date: string;
  item: string; ordered: number; received: number; unit: string;
  qc: 'LOLOS' | 'SEBAGIAN' | 'TOLAK'; status: GRNStatus; receiver: string;
};
type TrxStatus = 'LUNAS' | 'SEBAGIAN' | 'BELUM BAYAR' | 'JATUH TEMPO';
type PurchaseTrx = {
  id: string; number: string; date: string; due: string; supplier: string;
  poRef: string; item: string; qty: string; total: number; paid: number;
  method: 'Transfer' | 'COD' | 'Giro'; status: TrxStatus;
};

// ------------------------------------------------------------------
// SAMPLE DATA
// ------------------------------------------------------------------
const SUPPLIERS: Supplier[] = [
  { id: 'S-01', name: 'PT Sinar Polytex', category: 'Greige Polyester', city: 'Bandung', pic: 'H. Ahmad Yani', phone: '0812-2201-8899', rating: 4.8, leadTime: 7, totalPO: 24, totalValue: 2850000000, outstanding: 342000000, status: 'AKTIF' },
  { id: 'S-02', name: 'CV Tinta Warna Abadi', category: 'Tinta Sublimasi', city: 'Jakarta', pic: 'Sdr. Budi Hartono', phone: '0813-8899-1122', rating: 4.9, leadTime: 3, totalPO: 31, totalValue: 1240000000, outstanding: 86000000, status: 'AKTIF' },
  { id: 'S-03', name: 'PT Kertas Transferindo', category: 'Transfer Paper', city: 'Surabaya', pic: 'Sdri. Dewi Lestari', phone: '0821-4455-7788', rating: 4.6, leadTime: 5, totalPO: 18, totalValue: 960000000, outstanding: 124000000, status: 'AKTIF' },
  { id: 'S-04', name: 'UD Sparepart Mesin Jaya', category: 'Sparepart Heatpress', city: 'Bandung', pic: 'Sdr. Dedi Kurniawan', phone: '0817-3344-9900', rating: 4.4, leadTime: 4, totalPO: 11, totalValue: 410000000, outstanding: 0, status: 'AKTIF' },
  { id: 'S-05', name: 'PT Kemasan Nusantara', category: 'Packaging & Roll Core', city: 'Jakarta', pic: 'Sdri. Rina Marlina', phone: '0819-5566-3344', rating: 4.7, leadTime: 6, totalPO: 15, totalValue: 520000000, outstanding: 48000000, status: 'AKTIF' },
  { id: 'S-06', name: 'PT Kimia Tekstilindo', category: 'Chemical Coating', city: 'Tangerang', pic: 'Sdr. Andi Prasetyo', phone: '0812-7788-4521', rating: 4.2, leadTime: 8, totalPO: 7, totalValue: 380000000, outstanding: 95000000, status: 'BARU' },
  { id: 'S-07', name: 'CV Benang Rajut Sejahtera', category: 'Benang & Aksesoris', city: 'Majalaya', pic: 'H. Ujang Saepudin', phone: '0813-2211-9087', rating: 4.5, leadTime: 5, totalPO: 9, totalValue: 295000000, outstanding: 0, status: 'AKTIF' },
];

const INITIAL_POS: PO[] = [
  { id: 'PO-1', number: 'PO-2026-10-0142', supplier: 'PT Sinar Polytex', category: 'Greige Polyester', date: '6 Okt 2026', eta: '13 Okt 2026', term: 'NET 30', requester: 'Bambang S. (Gudang)', status: 'DIPESAN', progress: 65, notes: 'Prioritas kejar target jersey 12.000 pcs PON.', items: [
    { name: 'Greige Dryfit Milano 135 GSM', spec: 'Lebar 60", optic white, lot A', qty: 8000, unit: 'meter', price: 26500 },
    { name: 'Greige Brazil Wave 130 GSM', spec: 'Lebar 60", pure white', qty: 4000, unit: 'meter', price: 27200 },
  ]},
  { id: 'PO-2', number: 'PO-2026-10-0141', supplier: 'CV Tinta Warna Abadi', category: 'Tinta Sublimasi', date: '5 Okt 2026', eta: '8 Okt 2026', term: 'COD', requester: 'Rian P. (Produksi)', status: 'SEBAGIAN', progress: 50, notes: 'Tinta magenta datang duluan, sisanya menyusul.', items: [
    { name: 'Tinta Sublim Epson i3200 – Magenta', spec: 'Kemasan 5L, ori', qty: 20, unit: 'jerigen', price: 1850000 },
    { name: 'Tinta Sublim Epson i3200 – Cyan', spec: 'Kemasan 5L, ori', qty: 20, unit: 'jerigen', price: 1850000 },
    { name: 'Cleaning Solution Head', spec: '1L / botol', qty: 12, unit: 'botol', price: 325000 },
  ]},
  { id: 'PO-3', number: 'PO-2026-10-0140', supplier: 'PT Kertas Transferindo', category: 'Transfer Paper', date: '3 Okt 2026', eta: '9 Okt 2026', term: 'NET 14', requester: 'Bambang S. (Gudang)', status: 'DIAJUKAN', progress: 15, notes: 'Menunggu approval Finance — pagu masih tersedia.', items: [
    { name: 'Transfer Paper 100 GSM Jumbo', spec: 'Roll 1.62m x 200m', qty: 120, unit: 'roll', price: 385000 },
  ]},
  { id: 'PO-4', number: 'PO-2026-09-0139', supplier: 'PT Sinar Polytex', category: 'Greige Polyester', date: '28 Sep 2026', eta: '5 Okt 2026', term: 'NET 30', requester: 'Hendra W. (PPIC)', status: 'DITERIMA', progress: 100, notes: 'QC lolos 100%, selisih susut 0,4% masih toleransi.', items: [
    { name: 'Greige Dryfit Milano 155 GSM Heavy', spec: 'Lebar 60", optic white', qty: 6000, unit: 'meter', price: 28900 },
  ]},
  { id: 'PO-5', number: 'PO-2026-09-0138', supplier: 'UD Sparepart Mesin Jaya', category: 'Sparepart Heatpress', date: '26 Sep 2026', eta: '30 Sep 2026', term: 'COD', requester: 'Dedi K. (Maintenance)', status: 'DISETUJUI', progress: 25, notes: 'Felt belt & teflon sheet mesin #3.', items: [
    { name: 'Felt Belt Heatpress 1.7m', spec: 'Nomex, endless', qty: 2, unit: 'pcs', price: 14500000 },
    { name: 'Teflon Sheet Anti Lengket', spec: '1.7m x 2m', qty: 6, unit: 'lembar', price: 850000 },
  ]},
  { id: 'PO-6', number: 'PO-2026-09-0137', supplier: 'PT Kemasan Nusantara', category: 'Packaging & Roll Core', date: '24 Sep 2026', eta: '1 Okt 2026', term: 'NET 14', requester: 'Bambang S. (Gudang)', status: 'DIPESAN', progress: 80, notes: 'Ekspedisi terkendala macet Cikampek, ETA +1 hari.', items: [
    { name: 'Kardus Double Wall 120x20x20', spec: 'Cetak logo Texora', qty: 3000, unit: 'pcs', price: 12500 },
    { name: 'Paper Core 3" x 1.7m', spec: 'Tebal 8mm', qty: 500, unit: 'pcs', price: 18000 },
  ]},
  { id: 'PO-7', number: 'PO-2026-09-0136', supplier: 'PT Kimia Tekstilindo', category: 'Chemical Coating', date: '20 Sep 2026', eta: '28 Sep 2026', term: 'NET 30', requester: 'Rian P. (Produksi)', status: 'DRAFT', progress: 5, notes: 'Draft — masih negosiasi diskon 5% untuk volume 2 ton.', items: [
    { name: 'Anti-UV Coating Agent', spec: 'Drum 200L', qty: 10, unit: 'drum', price: 6800000 },
  ]},
  { id: 'PO-8', number: 'PO-2026-09-0135', supplier: 'CV Benang Rajut Sejahtera', category: 'Benang & Aksesoris', date: '18 Sep 2026', eta: '23 Sep 2026', term: 'COD', requester: 'Hendra W. (PPIC)', status: 'DITERIMA', progress: 100, notes: 'Diterima penuh, nota sudah masuk Finance.', items: [
    { name: 'Benang Overdeck Poly 150D', spec: 'Cone 5kg, putih', qty: 200, unit: 'cone', price: 185000 },
  ]},
  { id: 'PO-9', number: 'PO-2026-09-0134', supplier: 'CV Tinta Warna Abadi', category: 'Tinta Sublimasi', date: '15 Sep 2026', eta: '18 Sep 2026', term: 'COD', requester: 'Rian P. (Produksi)', status: 'BATAL', progress: 0, notes: 'Dibatalkan — duplikat dengan PO-0131, supplier sudah dihubungi.', items: [
    { name: 'Tinta Sublim Epson i3200 – Black', spec: 'Kemasan 5L', qty: 10, unit: 'jerigen', price: 1850000 },
  ]},
  { id: 'PO-10', number: 'PO-2026-10-0143', supplier: 'PT Sinar Polytex', category: 'Greige Polyester', date: '8 Okt 2026', eta: '15 Okt 2026', term: 'NET 30', requester: 'Hendra W. (PPIC)', status: 'DIAJUKAN', progress: 10, notes: 'Pengajuan pagi ini untuk buffer stok November.', items: [
    { name: 'Greige Dryfit Milano 135 GSM', spec: 'Lebar 60", optic white', qty: 10000, unit: 'meter', price: 26200 },
  ]},
];

const INITIAL_PRS: PR[] = [
  { id: 'PR-1', number: 'PR-2026-089', requester: 'Rian Pratama', dept: 'Produksi', date: '7 Okt 2026', needed: '14 Okt 2026', urgency: 'MENDESAK', status: 'BARU', summary: 'Tinta Yellow & Black 30 jerigen + head damper 40 pcs (stok menipis, mesin #1-#4 jalan 3 shift)', estValue: 68500000 },
  { id: 'PR-2', number: 'PR-2026-088', requester: 'Bambang Santoso', dept: 'Gudang', date: '6 Okt 2026', needed: '16 Okt 2026', urgency: 'TINGGI', status: 'DIPROSES', summary: 'Transfer paper 150 roll + paper core 600 pcs (buffer event lari Bandung)', estValue: 66750000 },
  { id: 'PR-3', number: 'PR-2026-087', requester: 'Dedi Kurniawan', dept: 'Maintenance', date: '4 Okt 2026', needed: '20 Okt 2026', urgency: 'NORMAL', status: 'DIPROSES', summary: 'Roller bearing + silicon oil + kabel heater mesin calendar #2 (preventive Q4)', estValue: 22400000 },
  { id: 'PR-4', number: 'PR-2026-086', requester: 'Hendra Wijaya', dept: 'PPIC', date: '2 Okt 2026', needed: '12 Okt 2026', urgency: 'TINGGI', status: 'SELESAI', summary: 'Greige Milano 10.000 m (sudah jadi PO-0143, menunggu approval)', estValue: 262000000 },
  { id: 'PR-5', number: 'PR-2026-085', requester: 'Sinta Maharani', dept: 'QC & Packing', date: '29 Sep 2026', needed: '6 Okt 2026', urgency: 'NORMAL', status: 'SELESAI', summary: 'Stiker QC lolos + plastik OPP + silica gel (packing 40.000 pcs jersey)', estValue: 18900000 },
  { id: 'PR-6', number: 'PR-2026-084', requester: 'Rian Pratama', dept: 'Produksi', date: '27 Sep 2026', needed: '4 Okt 2026', urgency: 'RENDAH', status: 'DITOLAK', summary: 'Ditolak: pengajuan cutter manual — sudah ada budget cutter otomatis Q1 2027', estValue: 45000000 },
];

const INITIAL_GRNS: GRN[] = [
  { id: 'G-1', number: 'GRN-2026-0771', po: 'PO-2026-10-0142', supplier: 'PT Sinar Polytex', date: '8 Okt 2026', item: 'Greige Dryfit Milano 135 GSM', ordered: 8000, received: 5200, unit: 'meter', qc: 'LOLOS', status: 'SEBAGIAN', receiver: 'Agus (Gudang A)' },
  { id: 'G-2', number: 'GRN-2026-0770', po: 'PO-2026-10-0141', supplier: 'CV Tinta Warna Abadi', date: '7 Okt 2026', item: 'Tinta Magenta + Cyan', ordered: 40, received: 20, unit: 'jerigen', qc: 'LOLOS', status: 'SEBAGIAN', receiver: 'Agus (Gudang A)' },
  { id: 'G-3', number: 'GRN-2026-0769', po: 'PO-2026-09-0139', supplier: 'PT Sinar Polytex', date: '5 Okt 2026', item: 'Greige Milano 155 GSM Heavy', ordered: 6000, received: 6000, unit: 'meter', qc: 'LOLOS', status: 'SELESAI', receiver: 'Slamet (Gudang B)' },
  { id: 'G-4', number: 'GRN-2026-0768', po: 'PO-2026-09-0138', supplier: 'PT Kemasan Nusantara', date: '3 Okt 2026', item: 'Kardus Double Wall', ordered: 3000, received: 2400, unit: 'pcs', qc: 'SEBAGIAN', status: 'SEBAGIAN', receiver: 'Agus (Gudang A)' },
  { id: 'G-5', number: 'GRN-2026-0767', po: 'PO-2026-09-0135', supplier: 'CV Benang Rajut Sejahtera', date: '23 Sep 2026', item: 'Benang Overdeck 150D', ordered: 200, received: 200, unit: 'cone', qc: 'LOLOS', status: 'SELESAI', receiver: 'Slamet (Gudang B)' },
];

const INITIAL_TRX: PurchaseTrx[] = [
  { id: 'T-01', number: 'TRX-2026-10-0091', date: '8 Okt 2026', due: '7 Nov 2026', supplier: 'PT Sinar Polytex', poRef: 'PO-2026-10-0142', item: 'Greige Milano 135 GSM — 8.000 m', qty: '8.000 m', total: 212000000, paid: 0, method: 'Transfer', status: 'BELUM BAYAR' },
  { id: 'T-02', number: 'TRX-2026-10-0090', date: '7 Okt 2026', due: '7 Okt 2026', supplier: 'CV Tinta Warna Abadi', poRef: 'PO-2026-10-0141', item: 'Tinta Magenta/Cyan — 40 jrgn', qty: '40 jrgn', total: 77900000, paid: 38950000, method: 'Transfer', status: 'SEBAGIAN' },
  { id: 'T-03', number: 'TRX-2026-10-0089', date: '5 Okt 2026', due: '4 Nov 2026', supplier: 'PT Sinar Polytex', poRef: 'PO-2026-09-0139', item: 'Greige Milano 155 GSM — 6.000 m', qty: '6.000 m', total: 173400000, paid: 0, method: 'Transfer', status: 'BELUM BAYAR' },
  { id: 'T-04', number: 'TRX-2026-10-0088', date: '3 Okt 2026', due: '17 Okt 2026', supplier: 'PT Kemasan Nusantara', poRef: 'PO-2026-09-0137', item: 'Kardus + paper core', qty: '3.500 pcs', total: 46500000, paid: 46500000, method: 'Transfer', status: 'LUNAS' },
  { id: 'T-05', number: 'TRX-2026-09-0087', date: '28 Sep 2026', due: '28 Sep 2026', supplier: 'UD Sparepart Mesin Jaya', poRef: 'PO-2026-09-0138', item: 'Felt belt + teflon sheet', qty: '8 pcs', total: 34100000, paid: 34100000, method: 'COD', status: 'LUNAS' },
  { id: 'T-06', number: 'TRX-2026-09-0086', date: '24 Sep 2026', due: '8 Okt 2026', supplier: 'PT Kertas Transferindo', poRef: 'PO-2026-08-0129', item: 'Transfer paper — 150 roll', qty: '150 roll', total: 57750000, paid: 0, method: 'Transfer', status: 'JATUH TEMPO' },
  { id: 'T-07', number: 'TRX-2026-09-0085', date: '23 Sep 2026', due: '23 Sep 2026', supplier: 'CV Benang Rajut Sejahtera', poRef: 'PO-2026-09-0135', item: 'Benang Overdeck — 200 cone', qty: '200 cone', total: 37000000, paid: 37000000, method: 'COD', status: 'LUNAS' },
  { id: 'T-08', number: 'TRX-2026-09-0084', date: '18 Sep 2026', due: '18 Okt 2026', supplier: 'PT Kimia Tekstilindo', poRef: 'PO-2026-08-0124', item: 'Coating agent — 10 drum', qty: '10 drum', total: 68000000, paid: 20000000, method: 'Giro', status: 'SEBAGIAN' },
  { id: 'T-09', number: 'TRX-2026-09-0083', date: '12 Sep 2026', due: '12 Sep 2026', supplier: 'CV Tinta Warna Abadi', poRef: 'PO-2026-09-0131', item: 'Tinta Black/Yellow — 30 jrgn', qty: '30 jrgn', total: 55500000, paid: 55500000, method: 'Transfer', status: 'LUNAS' },
  { id: 'T-10', number: 'TRX-2026-09-0082', date: '5 Sep 2026', due: '5 Okt 2026', supplier: 'PT Sinar Polytex', poRef: 'PO-2026-08-0120', item: 'Greige Brazil Wave — 5.000 m', qty: '5.000 m', total: 136000000, paid: 136000000, method: 'Transfer', status: 'LUNAS' },
];

const SPEND_TREND = [
  { bulan: 'Mei', belanja: 412, target: 450 },
  { bulan: 'Jun', belanja: 388, target: 450 },
  { bulan: 'Jul', belanja: 465, target: 450 },
  { bulan: 'Agu', belanja: 521, target: 500 },
  { bulan: 'Sep', belanja: 487, target: 500 },
  { bulan: 'Okt', belanja: 396, target: 520 },
];

const SPEND_KATEGORI = [
  { kategori: 'Greige Polyester', nilai: 2850 },
  { kategori: 'Tinta Sublim', nilai: 1240 },
  { kategori: 'Transfer Paper', nilai: 960 },
  { kategori: 'Kemasan', nilai: 520 },
  { kategori: 'Sparepart', nilai: 410 },
  { kategori: 'Chemical', nilai: 380 },
];

const PO_COLORS: Record<string, string> = {
  DRAFT: '#64748b', DIAJUKAN: '#f59e0b', DISETUJUI: '#38bdf8',
  DIPESAN: '#818cf8', SEBAGIAN: '#c084fc', DITERIMA: '#10b981', BATAL: '#f43f5e',
};

const DARK_TIP = { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: '12px' };

function poTotal(po: PO) { return po.items.reduce((s, it) => s + it.qty * it.price, 0); }
function statusBadge(s: string) {
  const map: Record<string, string> = {
    DRAFT: 'bg-slate-800 text-slate-300 border-slate-700', DIAJUKAN: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    DISETUJUI: 'bg-sky-500/15 text-sky-300 border-sky-500/40', DIPESAN: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    SEBAGIAN: 'bg-violet-500/15 text-violet-300 border-violet-500/40', DITERIMA: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    BATAL: 'bg-rose-500/15 text-rose-300 border-rose-500/40', BARU: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    DIPROSES: 'bg-amber-500/15 text-amber-300 border-amber-500/40', SELESAI: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    DITOLAK: 'bg-rose-500/15 text-rose-300 border-rose-500/40',     MENUNGGU: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    LUNAS: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    'BELUM BAYAR': 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    'JATUH TEMPO': 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    LOLOS: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', TOLAK: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    MENDESAK: 'bg-rose-500/20 text-rose-300 border-rose-500/50', TINGGI: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    NORMAL: 'bg-sky-500/15 text-sky-300 border-sky-500/40', RENDAH: 'bg-slate-800 text-slate-300 border-slate-700',
    AKTIF: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', BARU2: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
  };
  return `px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block whitespace-nowrap ${map[s] ?? 'bg-slate-800 text-slate-300 border-slate-700'}`;
}

export default function PurchasingPage() {
  const [tab, setTab] = useState<'overview' | 'po' | 'trx' | 'pr' | 'supplier' | 'grn'>('overview');
  const [pos, setPos] = useState<PO[]>(INITIAL_POS);
  const [prs, setPrs] = useState<PR[]>(INITIAL_PRS);
  const [grns, setGrns] = useState<GRN[]>(INITIAL_GRNS);
  const [trxs] = useState<PurchaseTrx[]>(INITIAL_TRX);
  const [trxStatus, setTrxStatus] = useState('ALL');
  const [trxq, setTrxq] = useState('');
  const [poStatus, setPoStatus] = useState('ALL');
  const [q, setQ] = useState('');
  const [qi, setQi] = useState('');
  const [detail, setDetail] = useState<PO | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState('');
  const [newPO, setNewPO] = useState({ supplier: SUPPLIERS[0].name, category: SUPPLIERS[0].category, eta: '2026-10-20', term: 'NET 30', item: 'Greige Dryfit Milano 135 GSM', qty: 5000, price: 26500 });

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  const kpi = useMemo(() => {
    const active = pos.filter((p) => !['DITERIMA', 'BATAL'].includes(p.status));
    const valueMonth = pos.filter((p) => p.status !== 'BATAL').reduce((s, p) => s + poTotal(p), 0);
    const needApproval = pos.filter((p) => p.status === 'DIAJUKAN').length;
    const overdue = grns.filter((g) => g.status !== 'SELESAI').length;
    const outstanding = SUPPLIERS.reduce((s, x) => s + x.outstanding, 0);
    return { active: active.length, valueMonth, needApproval, overdue, outstanding };
  }, [pos, grns]);

  const statusPie = useMemo(() => {
    const c: Record<string, number> = {};
    pos.forEach((p) => { c[p.status] = (c[p.status] ?? 0) + 1; });
    return Object.entries(c).map(([name, value]) => ({ name, value }));
  }, [pos]);

  const filteredPO = useMemo(() => {
    const key = q.toLowerCase();
    return pos.filter((p) => {
      if (poStatus !== 'ALL' && p.status !== poStatus) return false;
      if (key && !(p.number.toLowerCase().includes(key) || p.supplier.toLowerCase().includes(key) || p.category.toLowerCase().includes(key))) return false;
      return true;
    });
  }, [pos, poStatus, q]);

  const filteredTrx = useMemo(() => {
    const key = trxq.toLowerCase();
    return trxs.filter((t) => {
      if (trxStatus !== 'ALL' && t.status !== trxStatus) return false;
      if (key && !(t.number.toLowerCase().includes(key) || t.supplier.toLowerCase().includes(key) || t.poRef.toLowerCase().includes(key))) return false;
      return true;
    });
  }, [trxs, trxStatus, trxq]);

  // Rekap pembelian per supplier — murni tabel, dihitung dari data transaksi sample
  const supplierSummary = useMemo(() => {
    return SUPPLIERS.map((s) => {
      const rows = trxs.filter((t) => t.supplier === s.name);
      const paid = s.totalValue - s.outstanding;
      return { ...s, trxCount: rows.length, paid, lastTrx: rows[0]?.date ?? '-' };
    });
  }, [trxs]);

  const approvePO = (id: string, ok: boolean) => {
    setPos((prev) => prev.map((p) => (p.id === id ? { ...p, status: ok ? 'DISETUJUI' : 'BATAL', progress: ok ? 25 : 0 } : p)));
    setDetail((d) => (d && d.id === id ? { ...d, status: ok ? 'DISETUJUI' : 'BATAL', progress: ok ? 25 : 0 } : d));
    flash(ok ? 'PO disetujui — diteruskan ke supplier' : 'PO dibatalkan');
  };

  const createPO = () => {
    const n = pos.length + 144;
    const po: PO = {
      id: `PO-${Date.now()}`, number: `PO-2026-10-0${n}`, supplier: newPO.supplier,
      category: newPO.category, date: '8 Okt 2026', eta: newPO.eta, term: newPO.term,
      requester: 'Purchasing (Demo)', status: 'DIAJUKAN', progress: 10,
      notes: 'Dibuat dari mockup meeting — menunggu approval.',
      items: [{ name: newPO.item, spec: 'Sesuai spesifikasi standar', qty: newPO.qty, unit: 'meter', price: newPO.price }],
    };
    setPos((prev) => [po, ...prev]);
    setShowCreate(false);
    setTab('po');
    flash(`Draf ${po.number} dibuat — masuk antrean approval`);
  };

  const prToPO = (pr: PR) => {
    const po: PO = {
      id: `PO-${Date.now()}`, number: `PO-2026-10-0${pos.length + 144}`, supplier: '— Pilih Supplier —',
      category: pr.summary.slice(0, 28), date: '8 Okt 2026', eta: pr.needed, term: 'NET 14',
      requester: `${pr.requester} (${pr.dept})`, status: 'DRAFT', progress: 5,
      notes: `Konversi dari ${pr.number}: ${pr.summary}`,
      items: [{ name: pr.summary.slice(0, 42), spec: 'Rincian menyusul dari PR', qty: 1, unit: 'lot', price: pr.estValue }],
    };
    setPos((prev) => [po, ...prev]);
    setPrs((prev) => prev.map((x) => (x.id === pr.id ? { ...x, status: 'DIPROSES' } : x)));
    flash(`${pr.number} dikonversi menjadi draf PO`);
  };

  const receiveGRN = (id: string) => {
    setGrns((prev) => prev.map((g) => {
      if (g.id !== id) return g;
      const add = Math.min(g.ordered - g.received, Math.ceil(g.ordered * 0.3));
      const received = g.received + add;
      return { ...g, received, status: received >= g.ordered ? 'SELESAI' : 'SEBAGIAN', qc: 'LOLOS' };
    }));
    flash('Penerimaan barang dicatat + stok gudang bertambah (simulasi)');
  };

  return (
    <div className="space-y-8 pb-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <ShoppingCart className="w-3 h-3" /> Purchasing • Pengadaan & Supplier
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">Mockup v1.0 — Data Sample</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/40 font-mono">Tanpa Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">Purchasing & Pengadaan Bahan Baku</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Kelola permintaan pembelian (PR), purchase order (PO), evaluasi supplier, dan penerimaan barang (GRN) — dari pengajuan sampai barang masuk gudang &amp; tagihan finance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Buat PO
          </button>
          <button onClick={() => { setTab('pr'); }} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5" /> PR Masuk ({prs.filter((p) => p.status === 'BARU').length})
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2">
            <Printer className="w-3.5 h-3.5" /> Cetak
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nilai PO (Okt 2026)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Wallet className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-white">{formatRupiah(kpi.valueMonth)}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400 font-bold">+8,2%</span> vs Sep 2026</div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full" style={{ width: '76%' }} /></div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PO Aktif Berjalan</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><ShoppingCart className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black font-mono text-white">{kpi.active} <span className="text-xs text-slate-400 font-sans font-normal">dokumen</span></div>
          <div className="mt-2 text-[11px] text-slate-400"><span className="text-amber-400 font-bold">{kpi.needApproval} menunggu approval</span> manager & finance</div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-indigo-500 h-full" style={{ width: `${(kpi.active / Math.max(pos.length, 1)) * 100}%` }} />
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hutang Supplier (Outstanding)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-300">{formatRupiah(kpi.outstanding)}</div>
          <div className="mt-2 text-[11px] text-slate-400">Jatuh tempo ≤ 14 hari: <b className="text-white font-mono">Rp 210 jt</b> (3 invoice)</div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full rounded-full" style={{ width: '34%' }} /></div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Penerimaan Tertunda</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><PackageCheck className="w-4 h-4" /></div>
          </div>
          <div className="text-3xl font-black font-mono text-white">{kpi.overdue} <span className="text-xs text-slate-400 font-sans font-normal">pengiriman</span></div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1"><Truck className="w-3 h-3" /> 2 armada on-road, ETA besok pagi</div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} /></div>
        </div>
      </div>

      {/* EXECUTIVE BRIEF */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-1.5"><BadgeCheck className="w-4 h-4" /> 1. Alur Approval Terkendali</div>
            <p className="text-xs text-slate-300 leading-relaxed">Setiap PO di atas <b className="text-white">Rp 50 jt</b> wajib approval Manager + Finance. {kpi.needApproval} PO sedang antre — tertua <b className="text-white">PO-0140</b> (5 hari, kertas transfer).</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-1.5"><Factory className="w-4 h-4" /> 2. Fokus Produksi Minggu Ini</div>
            <p className="text-xs text-slate-300 leading-relaxed">Greige <b className="text-white">12.000 m</b> (PO-0142) progres 65% — cukup untuk 3 shift sampai 18 Okt. Kritis: tinta Yellow tinggal <b className="text-white">2 hari</b> (PR-089).</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 mb-1.5"><Users className="w-4 h-4" /> 3. Supplier Terbaik Q3</div>
            <p className="text-xs text-slate-300 leading-relaxed"><b className="text-white">CV Tinta Warna Abadi</b> rating 4.9, lead time 3 hari, 0 keterlambatan dalam 31 PO. Direkomendasikan kontrak tahunan.</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
        {([
          { k: 'overview', label: 'Executive Overview', icon: TrendingUp },
          { k: 'po', label: 'Daftar Purchase Order', icon: ShoppingCart },
          { k: 'trx', label: 'Transaksi Purchasing', icon: ReceiptText },
          { k: 'pr', label: 'Permintaan (PR)', icon: ClipboardList },
          { k: 'supplier', label: 'Pembelian per Supplier', icon: Users },
          { k: 'grn', label: 'Penerimaan (GRN)', icon: PackageCheck },
        ] as const).map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-5 py-3 text-xs font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${tab === t.k ? 'border-amber-500 text-white bg-amber-500/10 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-t-xl'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.k === 'pr' && <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-sky-500 text-white font-mono">{prs.filter((p) => p.status === 'BARU').length}</span>}
            {t.k === 'po' && kpi.needApproval > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-mono">{kpi.needApproval}</span>}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Status PO Berjalan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribusi 10 PO terakhir</p>
              <div className="h-[240px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4} strokeWidth={0}>
                      {statusPie.map((d) => (<Cell key={d.name} fill={PO_COLORS[d.name] ?? '#64748b'} />))}
                    </Pie>
                    <Tooltip contentStyle={DARK_TIP} />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-8 p-6 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Belanja per Kategori (Rp jt)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Greige mendominasi 45% — wajar untuk pabrik sublimasi</p>
              <div className="h-[240px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SPEND_KATEGORI} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="kategori" fontSize={10} tick={{ fill: '#94a3b8' }} interval={0} angle={-12} dy={8} height={52} />
                    <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={DARK_TIP} formatter={(v: any) => [`Rp ${v} jt`, 'Belanja']} />
                    <Bar dataKey="nilai" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Tren Belanja vs Budget (Rp jt)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Oktober berjalan 76% dari budget — masih on-track</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Mei — Okt 2026</span>
            </div>
            <div className="h-[260px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPEND_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBelanja" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="bulan" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={DARK_TIP} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                  <Area type="monotone" dataKey="belanja" name="Realisasi" stroke="#f59e0b" fill="url(#gBelanja)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="target" name="Budget" stroke="#38bdf8" fill="transparent" strokeDasharray="6 4" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* PO LIST */}
      {tab === 'po' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'DIAJUKAN', 'DISETUJUI', 'DIPESAN', 'SEBAGIAN', 'DITERIMA', 'DRAFT', 'BATAL'].map((s) => (
                <button key={s} onClick={() => setPoStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${poStatus === s ? 'bg-amber-500 text-white shadow' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}>
                  {s === 'ALL' ? 'Semua' : s}
                </button>
              ))}
            </div>
            <form className="flex gap-2 flex-1" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={qi} onChange={(e) => setQi(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setQ(qi); }}
                  placeholder="Cari no. PO / supplier / kategori..." className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500" />
              </div>
              <button type="button" onClick={() => setQ(qi)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold border border-slate-700">Cari</button>
              {(q || poStatus !== 'ALL') && (
                <button type="button" onClick={() => { setQ(''); setQi(''); setPoStatus('ALL'); }} className="px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-400 flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
              )}
            </form>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-amber-400" /> Daftar Purchase Order</span>
              <span className="text-xs text-slate-400 font-mono">{filteredPO.length} dokumen • Total {formatRupiah(filteredPO.reduce((s, p) => s + poTotal(p), 0))}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="p-4">No. PO / Supplier</th>
                    <th className="p-4">Isi & Nilai</th>
                    <th className="p-4">Jadwal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Progres</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredPO.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">Tidak ada PO yang cocok.</td></tr>)}
                  {filteredPO.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-mono font-bold text-white">{p.number}</div>
                        <div className="text-slate-300 font-semibold mt-0.5">{p.supplier}</div>
                        <div className="text-[10px] text-slate-500">{p.category} • {p.requester}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="text-slate-300">{p.items.length} item • {p.items[0]?.name}</div>
                        <div className="font-mono font-bold text-amber-300 mt-0.5">{formatRupiah(poTotal(p))}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.term}</div>
                      </td>
                      <td className="p-4 align-top text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> {p.date}</div>
                        <div className="flex items-center gap-1 mt-1 text-[11px]"><Truck className="w-3 h-3 text-slate-500" /> ETA {p.eta}</div>
                      </td>
                      <td className="p-4 align-top"><span className={statusBadge(p.status)}>{p.status}</span></td>
                      <td className="p-4 align-top min-w-[120px]">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${p.progress}%` }} /></div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">{p.progress}%</div>
                      </td>
                      <td className="p-4 align-top text-right whitespace-nowrap">
                        <button onClick={() => setDetail(p)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-600 text-xs font-bold border border-slate-700 inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRANSAKSI PURCHASING */}
      {tab === 'trx' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'LUNAS', 'SEBAGIAN', 'BELUM BAYAR', 'JATUH TEMPO'].map((s) => (
                <button key={s} onClick={() => setTrxStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${trxStatus === s ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}>
                  {s === 'ALL' ? 'Semua' : s}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={trxq} onChange={(e) => setTrxq(e.target.value)}
                placeholder="Cari no. transaksi / supplier / no. PO..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2"><ReceiptText className="w-4 h-4 text-emerald-400" /> Transaksi Pembelian (Invoice Supplier)</span>
              <span className="text-xs text-slate-400 font-mono">{filteredTrx.length} transaksi • Total {formatRupiah(filteredTrx.reduce((s, t) => s + t.total, 0))}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="p-4">No. Transaksi / Tgl</th>
                    <th className="p-4">Supplier / Ref PO</th>
                    <th className="p-4">Rincian Barang</th>
                    <th className="p-4 text-right">Total Tagihan</th>
                    <th className="p-4 text-right">Sudah Dibayar</th>
                    <th className="p-4">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredTrx.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">Tidak ada transaksi yang cocok.</td></tr>)}
                  {filteredTrx.map((t) => {
                    const sisa = t.total - t.paid;
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 align-top">
                          <div className="font-mono font-bold text-white">{t.number}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Tgl: {t.date} • J.tempo: {t.due}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{t.method}</div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-semibold text-slate-200">{t.supplier}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.poRef}</div>
                        </td>
                        <td className="p-4 align-top text-slate-300">{t.item}</td>
                        <td className="p-4 align-top text-right font-mono font-bold text-white whitespace-nowrap">{formatRupiah(t.total)}</td>
                        <td className="p-4 align-top text-right">
                          <div className="font-mono font-bold text-emerald-300 whitespace-nowrap">{formatRupiah(t.paid)}</div>
                          {sisa > 0 && <div className="text-[10px] font-mono text-rose-300 mt-0.5">Sisa {formatRupiah(sisa)}</div>}
                        </td>
                        <td className="p-4 align-top"><span className={statusBadge(t.status)}>{t.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">Total dibayar: <b className="font-mono text-emerald-300">{formatRupiah(filteredTrx.reduce((s, t) => s + t.paid, 0))}</b></span>
              <span className="text-slate-400">Sisa hutang: <b className="font-mono text-rose-300">{formatRupiah(filteredTrx.reduce((s, t) => s + (t.total - t.paid), 0))}</b></span>
            </div>
          </div>
        </div>
      )}

      {/* PR */}
      {tab === 'pr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {prs.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono font-bold text-white">{r.number}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{r.requester} • {r.dept} • {r.date} → butuh {r.needed}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={statusBadge(r.status)}>{r.status}</span>
                  <span className={statusBadge(r.urgency)}>{r.urgency}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{r.summary}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/70">
                <span className="text-xs text-slate-400">Estimasi <b className="font-mono text-white">{formatRupiah(r.estValue)}</b></span>
                {r.status === 'BARU' ? (
                  <button onClick={() => prToPO(r)} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Buatkan PO <ChevronRight className="w-3.5 h-3.5" /></button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">{r.status === 'DITOLAK' ? 'Ditolak dengan catatan' : 'Sudah diproses purchasing'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PEMBELIAN PER SUPPLIER — TABEL SAJA */}
      {tab === 'supplier' && (
        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
          <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" /> Rekap Pembelian per Supplier</span>
            <span className="text-xs text-slate-400 font-mono">{supplierSummary.length} supplier • Total {formatRupiah(supplierSummary.reduce((s, x) => s + x.totalValue, 0))}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Kategori / Kota</th>
                  <th className="p-4 text-center">Jml PO</th>
                  <th className="p-4 text-center">Jml Trx</th>
                  <th className="p-4 text-right">Total Pembelian</th>
                  <th className="p-4 text-right">Sudah Dibayar</th>
                  <th className="p-4 text-right">Sisa Hutang</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {supplierSummary.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{s.pic} • <span className="font-mono">{s.phone}</span></div>
                    </td>
                    <td className="p-4 text-slate-300 whitespace-nowrap">{s.category}<div className="text-[11px] text-slate-500">{s.city} • Lead {s.leadTime} hr • ★ {s.rating.toFixed(1)}</div></td>
                    <td className="p-4 text-center font-mono font-bold text-white">{s.totalPO}</td>
                    <td className="p-4 text-center font-mono font-bold text-white">{s.trxCount}</td>
                    <td className="p-4 text-right font-mono font-bold text-white whitespace-nowrap">{formatRupiah(s.totalValue)}</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-300 whitespace-nowrap">{formatRupiah(s.paid)}</td>
                    <td className="p-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={s.outstanding > 0 ? 'text-rose-300' : 'text-slate-500'}>{s.outstanding > 0 ? formatRupiah(s.outstanding) : '—'}</span>
                    </td>
                    <td className="p-4"><span className={statusBadge(s.status)}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Terakhir transaksi: <b className="text-white">{supplierSummary[0]?.lastTrx}</b> ({supplierSummary[0]?.name})</span>
            <span className="text-slate-400">Total hutang semua supplier: <b className="font-mono text-rose-300">{formatRupiah(supplierSummary.reduce((s, x) => s + x.outstanding, 0))}</b></span>
          </div>
        </div>
      )}

      {/* GRN */}
      {tab === 'grn' && (
        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
          <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2"><PackageCheck className="w-4 h-4 text-emerald-400" /> Penerimaan Barang (GRN) & QC</span>
            <span className="text-xs text-slate-400 font-mono">{grns.filter((g) => g.status !== 'SELESAI').length} belum selesai</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <th className="p-4">No. GRN / PO</th>
                  <th className="p-4">Barang</th>
                  <th className="p-4">Terima vs Pesan</th>
                  <th className="p-4">QC</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {grns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/40">
                    <td className="p-4"><div className="font-mono font-bold text-white">{g.number}</div><div className="text-[11px] text-slate-400 font-mono">{g.po}</div><div className="text-[11px] text-slate-500">{g.supplier} • {g.date}</div></td>
                    <td className="p-4 text-slate-200">{g.item}<div className="text-[11px] text-slate-500">Penerima: {g.receiver}</div></td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-white">{g.received.toLocaleString('id-ID')} / {g.ordered.toLocaleString('id-ID')} {g.unit}</div>
                      <div className="w-36 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5"><div className="bg-emerald-500 h-full" style={{ width: `${(g.received / g.ordered) * 100}%` }} /></div>
                    </td>
                    <td className="p-4"><span className={statusBadge(g.qc)}>{g.qc}</span></td>
                    <td className="p-4"><span className={statusBadge(g.status)}>{g.status}</span></td>
                    <td className="p-4 text-right">
                      {g.status !== 'SELESAI' ? (
                        <button onClick={() => receiveGRN(g.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Catat Kedatangan</button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PO */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Tutup" onClick={() => setDetail(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono font-black text-white text-lg">{detail.number}</div>
                <div className="text-xs text-slate-400 mt-0.5">{detail.supplier} • {detail.category} • {detail.term}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={statusBadge(detail.status)}>{detail.status}</span>
                <button onClick={() => setDetail(null)} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {[['Tanggal PO', detail.date], ['ETA', detail.eta], ['Pemohon', detail.requester.split(' (')[0]], ['Progres', `${detail.progress}%`]].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-950 border border-slate-800 p-2.5"><div className="text-[10px] text-slate-500 uppercase font-bold">{l}</div><div className="text-xs font-bold text-white mt-0.5">{v}</div></div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-950 text-slate-400 text-[11px] uppercase"><th className="p-3 text-left">Item</th><th className="p-3 text-right">Qty</th><th className="p-3 text-right">Harga</th><th className="p-3 text-right">Subtotal</th></tr></thead>
                <tbody className="divide-y divide-slate-800/70">
                  {detail.items.map((it, i) => (
                    <tr key={i}><td className="p-3"><div className="font-bold text-white">{it.name}</div><div className="text-[11px] text-slate-500">{it.spec}</div></td>
                      <td className="p-3 text-right font-mono">{it.qty.toLocaleString('id-ID')} {it.unit}</td>
                      <td className="p-3 text-right font-mono">{formatRupiah(it.price)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-300">{formatRupiah(it.qty * it.price)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800">
                <span className="text-xs text-slate-400 italic max-w-[60%]">Catatan: {detail.notes}</span>
                <span className="font-mono font-black text-white">Total <span className="text-amber-300">{formatRupiah(poTotal(detail))}</span></span>
              </div>
            </div>
            {/* Approval workflow */}
            <div className="flex items-center gap-2 text-xs">
              {['Diajukan', 'Manager', 'Finance', 'Kirim Supplier'].map((s, i) => {
                const step = detail.progress >= [10, 25, 50, 65][i];
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-1.5 ${step ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {step ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span className="font-bold text-[11px]">{s}</span>
                    </div>
                    {i < 3 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 justify-end pt-1">
              <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold border border-slate-700 flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" /> Cetak PO</button>
              {detail.status === 'DIAJUKAN' && (
                <>
                  <button onClick={() => approvePO(detail.id, false)} className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/40 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Tolak</button>
                  <button onClick={() => approvePO(detail.id, true)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" /> Setujui PO</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT PO */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Tutup" onClick={() => setShowCreate(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-amber-400" /> Buat Purchase Order (Sample)</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <label className="block text-xs text-slate-300">Supplier
              <select value={newPO.supplier} onChange={(e) => { const s = SUPPLIERS.find((x) => x.name === e.target.value)!; setNewPO({ ...newPO, supplier: s.name, category: s.category }); }}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none">
                {SUPPLIERS.map((s) => (<option key={s.id} value={s.name}>{s.name} — {s.category}</option>))}
              </select>
            </label>
            <label className="block text-xs text-slate-300">Nama Barang
              <input value={newPO.item} onChange={(e) => setNewPO({ ...newPO, item: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none" />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-xs text-slate-300">Qty
                <input type="number" value={newPO.qty} onChange={(e) => setNewPO({ ...newPO, qty: Number(e.target.value) })}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none" />
              </label>
              <label className="block text-xs text-slate-300">Harga (Rp)
                <input type="number" value={newPO.price} onChange={(e) => setNewPO({ ...newPO, price: Number(e.target.value) })}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none" />
              </label>
              <label className="block text-xs text-slate-300">Termin
                <select value={newPO.term} onChange={(e) => setNewPO({ ...newPO, term: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none">
                  {['COD', 'NET 7', 'NET 14', 'NET 30'].map((t) => (<option key={t}>{t}</option>))}
                </select>
              </label>
            </div>
            <div className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimasi total</span>
              <span className="font-mono font-black text-amber-300 text-sm">{formatRupiah(newPO.qty * newPO.price)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold border border-slate-700">Batal</button>
              <button onClick={createPO} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Simpan Draf PO</button>
            </div>
            <p className="text-[10px] text-slate-500 italic flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Mode mockup: data hanya tersimpan di memori browser, hilang saat refresh.</p>
          </div>
        </div>
      )}

      {/* FOOTNOTE */}
      <div className="rounded-2xl border border-dashed border-slate-700 p-4 text-[11px] text-slate-500 leading-relaxed">
        <b className="text-slate-300">Catatan mockup meeting:</b> seluruh angka supplier, PO, PR & GRN di halaman ini adalah <b className="text-slate-300">data sample statis</b> (tanpa database) untuk kebutuhan demo alur <i>PR → Approval → PO → Transaksi → GRN → Hutang</i>. Alur yang bisa diklik live: filter & cari PO, buka detail, setujui/tolak PO, buat PO baru, konversi PR→PO, dan catat kedatangan GRN.
      </div>
    </div>
  );
}
