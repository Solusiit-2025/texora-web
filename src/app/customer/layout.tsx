import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { CustomerSubNav } from "@/components/customer/CustomerSubNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <CustomerSubNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
