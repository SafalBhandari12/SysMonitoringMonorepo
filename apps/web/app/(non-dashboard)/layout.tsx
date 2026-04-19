import { Navbar } from "@/components/navbar";

export default function NonDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
