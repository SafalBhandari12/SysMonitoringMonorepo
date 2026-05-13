import "../landing.css";
import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code,
  Download,
  KeyRound,
  Lock,
  Package,
  ServerCog,
  Shield,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Documentation - Watchlayer",
  description: "Learn how to use the Watchlayer SDK for API monitoring",
};

const navItems = [
  ["Install", "#installation"],
  ["Setup", "#setup"],
  ["API Groups", "#groups"],
  ["Endpoints", "#endpoints"],
  ["API Keys", "#keys"],
  ["Monitoring", "#monitoring"],
] as const;

const groupSteps = [
  "Go to your dashboard and click Add API Group",
  "Give your API group a name, like Production APIs",
  "Verify your domain ownership",
  "Add the API endpoints you want to monitor",
  "Generate an API key for monitoring",
];

const endpointSteps = [
  "Select your API Group from the dashboard",
  "Click Add Endpoint",
  "Enter the endpoint path, like /api/users",
  "Select the HTTP method",
  "Set expected response time in milliseconds",
  "Add any required headers or authentication details",
];

const keySteps = [
  "Navigate to your API Group settings",
  "Click Generate New Key",
  "Give your key a meaningful name",
  "Copy the generated key and store it securely",
  "Add it to your environment variables",
];

const monitoringFeatures = [
  {
    icon: Shield,
    title: "Status Tracking",
    text: "Real-time status and response times for every registered endpoint.",
    color: "var(--landing-green)",
  },
  {
    icon: AlertCircle,
    title: "Instant Alerts",
    text: "Get notified when endpoints go down or performance degrades.",
    color: "var(--landing-accent)",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    text: "Track uptime, latency, incident history, and performance trends.",
    color: "var(--landing-accent2)",
  },
  {
    icon: Lock,
    title: "Secure by Default",
    text: "Keep monitoring data protected with encrypted transport and storage.",
    color: "var(--landing-green)",
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{
        background: "var(--landing-bg-dark)",
        borderColor: "var(--landing-border-dark)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--landing-border-dark)" }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <Terminal size={16} style={{ color: "#d0d0c8" }} />
      </div>
      <pre className="overflow-x-auto p-5 text-sm" style={{ color: "#f0f0e8" }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function SectionHeader({
  id,
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  id: string;
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} style={{ color: "var(--landing-accent)" }} />
        <span
          className="font-mono text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--landing-text-3)" }}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="mb-3 text-3xl font-bold" style={{ color: "var(--landing-text)" }}>
        {title}
      </h2>
      <p className="max-w-2xl leading-7" style={{ color: "var(--landing-text-2)" }}>
        {description}
      </p>
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-6 divide-y" style={{ borderColor: "var(--landing-border)" }}>
      {steps.map((step, index) => (
        <li key={step} className="flex gap-4 py-4">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold"
            style={{
              background: "rgba(232, 93, 4, 0.1)",
              color: "var(--landing-accent)",
            }}
          >
            {index + 1}
          </span>
          <span className="leading-7" style={{ color: "var(--landing-text-2)" }}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function DocsPage() {
  return (
    <div className="landing-scope min-h-screen">
      <Navbar />

      <main
        className="px-6 py-10 sm:px-10 lg:py-14"
        style={{
          background:
            "linear-gradient(135deg, rgba(250, 250, 248, 0.98) 0%, rgba(242, 242, 238, 0.92) 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <section className="grid gap-8 border-b pb-10 lg:grid-cols-[1fr_380px]" style={{ borderColor: "var(--landing-border)" }}>
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider"
                style={{
                  borderColor: "var(--landing-border)",
                  color: "var(--landing-text-3)",
                }}
              >
                <BookOpen size={14} />
                SDK Guide
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-tight" style={{ color: "var(--landing-text)" }}>
                Monitor Express APIs with a small SDK setup.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8" style={{ color: "var(--landing-text-2)" }}>
                Install Watchlayer, connect your API key, register the endpoints that matter, and keep a clean view of uptime, latency, incidents, and alerts.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#installation" className="btn-hero btn-hero-dark">
                  Start setup <ArrowRight size={18} />
                </Link>
                <Link href="https://sys-monitoring-monorepo-web.vercel.app/login" className="btn-hero btn-hero-light">
                  Open dashboard
                </Link>
              </div>
            </div>

            <div
              className="rounded-lg border p-5"
              style={{
                background: "rgba(250, 250, 248, 0.72)",
                borderColor: "var(--landing-border)",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--landing-text-3)" }}>
                  Quick path
                </span>
                <CheckCircle2 size={18} style={{ color: "var(--landing-green)" }} />
              </div>
              <div className="space-y-3">
                {["Install package", "Initialize SDK", "Create API group", "Add endpoints"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border px-3 py-3" style={{ borderColor: "var(--landing-border)" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--landing-green)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--landing-text)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--landing-text-3)" }}>
                  On this page
                </p>
                <nav className="flex flex-col items-stretch gap-1">
                  {navItems.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--landing-bg-off)]"
                      style={{ color: "var(--landing-text-2)" }}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="space-y-16">
              <section className="space-y-6">
                <SectionHeader
                  id="installation"
                  icon={Download}
                  eyebrow="Step 01"
                  title="Installation"
                  description="Add the SDK to your application with your preferred package manager."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <CodeBlock>npm install @watchlayer/sdk</CodeBlock>
                  <CodeBlock>yarn add @watchlayer/sdk</CodeBlock>
                </div>
              </section>

              <section className="space-y-6">
                <SectionHeader
                  id="setup"
                  icon={ServerCog}
                  eyebrow="Step 02"
                  title="Basic setup"
                  description="Initialize Watchlayer once near your Express app startup code, before your routes are registered."
                />
                <CodeBlock>{`import express from "express";
import { watchlayer } from "@watchlayer/sdk";

const app = express();

watchlayer({
  apiKey: process.env.WATCHLAYER_API_KEY,
  appName: "my-api",
  environment: "production",
});

app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});`}</CodeBlock>
                <div
                  className="flex gap-3 rounded-lg border p-4"
                  style={{
                    background: "rgba(37, 99, 235, 0.08)",
                    borderColor: "var(--landing-accent2)",
                  }}
                >
                  <AlertCircle size={20} style={{ color: "var(--landing-accent2)", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-sm leading-6" style={{ color: "var(--landing-text-2)" }}>
                    Replace <code className="rounded px-1.5 py-0.5" style={{ background: "rgba(0,0,0,0.08)" }}>WATCHLAYER_API_KEY</code> with an API key from your dashboard.
                  </p>
                </div>
              </section>

              <section>
                <SectionHeader
                  id="groups"
                  icon={Package}
                  eyebrow="Step 03"
                  title="Create API groups"
                  description="Groups keep related services organized, so production, staging, and internal APIs can have separate checks and alerts."
                />
                <StepList steps={groupSteps} />
              </section>

              <section>
                <SectionHeader
                  id="endpoints"
                  icon={Code}
                  eyebrow="Step 04"
                  title="Add endpoints"
                  description="Register each route you want Watchlayer to check, including method, expected response time, and optional headers."
                />
                <StepList steps={endpointSteps} />
                <div
                  className="mt-6 rounded-lg border p-4"
                  style={{
                    background: "rgba(22, 163, 74, 0.08)",
                    borderColor: "var(--landing-green)",
                  }}
                >
                  <p className="text-sm leading-6" style={{ color: "var(--landing-text-2)" }}>
                    <strong style={{ color: "var(--landing-text)" }}>Auto-monitoring:</strong> the SDK checks configured endpoints and alerts you when availability or latency drifts.
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <SectionHeader
                  id="keys"
                  icon={KeyRound}
                  eyebrow="Step 05"
                  title="Manage API keys"
                  description="Generate scoped keys from the dashboard, store them in your runtime environment, and rotate them when needed."
                />
                <StepList steps={keySteps} />
                <CodeBlock>WATCHLAYER_API_KEY=wl_xxxxxxxxxxxxxxxxxxxxxx</CodeBlock>
                <div
                  className="flex gap-3 rounded-lg border p-4"
                  style={{
                    background: "rgba(220, 38, 38, 0.08)",
                    borderColor: "var(--landing-red)",
                  }}
                >
                  <Lock size={20} style={{ color: "var(--landing-red)", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-sm leading-6" style={{ color: "var(--landing-text-2)" }}>
                    Never commit API keys to version control. Use environment variables or a secret manager.
                  </p>
                </div>
              </section>

              <section>
                <SectionHeader
                  id="monitoring"
                  icon={Activity}
                  eyebrow="Ongoing"
                  title="Real-time monitoring"
                  description="Once configured, Watchlayer gives you a clear operational view of your endpoints and the incidents around them."
                />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {monitoringFeatures.map(({ icon: Icon, title, text, color }) => (
                    <div
                      key={title}
                      className="rounded-lg border p-5"
                      style={{
                        background: "rgba(250, 250, 248, 0.72)",
                        borderColor: "var(--landing-border)",
                      }}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <Icon size={20} style={{ color }} />
                        <h3 className="font-semibold" style={{ color: "var(--landing-text)" }}>
                          {title}
                        </h3>
                      </div>
                      <p className="text-sm leading-6" style={{ color: "var(--landing-text-2)" }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="rounded-lg border p-8 text-center"
                style={{
                  background: "rgba(232, 93, 4, 0.08)",
                  borderColor: "var(--landing-accent)",
                }}
              >
                <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--landing-text)" }}>
                  Ready to connect your first API?
                </h2>
                <p className="mx-auto mb-6 max-w-xl leading-7" style={{ color: "var(--landing-text-2)" }}>
                  Open the dashboard, create a group, and add the key to your Express app.
                </p>
                <Link href="https://sys-monitoring-monorepo-web.vercel.app/login" className="btn-hero btn-hero-dark">
                  Start monitoring <ArrowRight size={18} />
                </Link>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
