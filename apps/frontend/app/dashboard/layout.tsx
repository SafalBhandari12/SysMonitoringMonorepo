import { TooltipProvider } from "@/components/ui/tooltip"


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  )
}
