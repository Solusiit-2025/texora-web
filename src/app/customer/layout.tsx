import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={2} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
