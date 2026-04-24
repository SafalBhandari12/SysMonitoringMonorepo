import SideBar from "@/components/dashboard/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SideBar />
        <main className="flex-1">{children}</main>
      </ThemeProvider>
    </div>
  );
}
