import "../landing.css";
import Link from "next/link";
import { Check, ArrowRight, MessageSquare } from "lucide-react";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Pricing - Watchlayer",
  description: "Simple, transparent pricing for API monitoring",
};

export default function PricingPage() {
  const features = [
    {
      category: "Monitoring",
      items: [
        { name: "API Groups", free: "2", enterprise: "Unlimited" },
        { name: "Endpoints per Group", free: "5", enterprise: "Unlimited" },
        { name: "Check Frequency", free: "30 min", enterprise: "1 min" },
        { name: "Data Retention", free: "7 days", enterprise: "1 year" },
      ],
    },
    {
      category: "Alerts & Notifications",
      items: [
        { name: "Email Alerts", free: "Yes", enterprise: "Yes" },
        { name: "SMS Alerts", free: "No", enterprise: "Yes" },
        { name: "Slack Integration", free: "No", enterprise: "Yes" },
        { name: "Webhook Support", free: "No", enterprise: "Yes" },
      ],
    },
    {
      category: "Access & Control",
      items: [
        { name: "Team Members", free: "1", enterprise: "Unlimited" },
        { name: "API Keys", free: "2", enterprise: "Unlimited" },
        { name: "Role-based Access", free: "No", enterprise: "Yes" },
        { name: "SSO Support", free: "No", enterprise: "Yes" },
      ],
    },
    {
      category: "Analytics",
      items: [
        { name: "Performance Charts", free: "Yes", enterprise: "Yes" },
        { name: "Uptime Reports", free: "Basic", enterprise: "Custom" },
        { name: "Incident History", free: "7 days", enterprise: "1 year" },
        { name: "Custom Dashboards", free: "No", enterprise: "Yes" },
      ],
    },
  ];

  return (
    <div className="landing-scope min-h-screen flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <div
        className="px-10 py-16"
        style={{
          background: "linear-gradient(135deg, rgba(250, 250, 248, 0.95) 0%, rgba(242, 242, 238, 0.95) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--landing-text)" }}>
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl" style={{ color: "var(--landing-text-2)" }}>
              Choose the plan that fits your API monitoring needs
            </p>
          </div>

          {/* PRICING CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
            {/* FREE TIER */}
            <div
              className="rounded-lg p-8 flex flex-col h-full"
              style={{
                background: "rgba(250, 250, 248, 0.7)",
                border: "2px solid var(--landing-border)",
              }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--landing-text)" }}>
                  Free
                </h3>
                <p style={{ color: "var(--landing-text-2)" }}>
                  Perfect for getting started
                </p>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold" style={{ color: "var(--landing-text)" }}>
                  $0
                </div>
                <p style={{ color: "var(--landing-text-3)", fontSize: "14px" }} className="mt-2">
                  forever free
                </p>
              </div>

              <Link
                href="https://sys-monitoring-monorepo-web.vercel.app/login"
                className="btn-hero btn-hero-light w-full justify-center mb-8"
              >
                Get Started <ArrowRight size={18} />
              </Link>

              <div className="flex-1 space-y-3">
                <p className="font-semibold text-sm mb-4" style={{ color: "var(--landing-text)" }}>
                  What&apos;s included:
                </p>
                <div className="space-y-3">
                  {[
                    "2 API Groups",
                    "5 endpoints per group",
                    "30 minute checks",
                    "7 day data retention",
                    "Email alerts",
                    "Basic uptime reports",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={16} style={{ color: "var(--landing-green)", marginTop: "4px", flexShrink: 0 }} />
                      <span style={{ color: "var(--landing-text-2)", fontSize: "14px" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ENTERPRISE TIER */}
            <div
              className="rounded-lg p-8 flex flex-col h-full"
              style={{
                background: "rgba(250, 250, 248, 0.7)",
                border: "2px solid var(--landing-border)",
              }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--landing-text)" }}>
                  Enterprise
                </h3>
                <p style={{ color: "var(--landing-text-2)" }}>
                  For large organizations
                </p>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold" style={{ color: "var(--landing-text)" }}>
                  Custom
                </div>
                <p style={{ color: "var(--landing-text-3)", fontSize: "14px" }} className="mt-2">
                  tailored to your needs
                </p>
              </div>

              <Link
                href="mailto:contact@watchlayer.com?subject=Enterprise Plan Inquiry"
                className="btn-hero btn-hero-light w-full justify-center mb-8 disabled:opacity-75"
              >
                Contact Us <MessageSquare size={18} />
              </Link>

              <div className="flex-1 space-y-3">
                <p className="font-semibold text-sm mb-4" style={{ color: "var(--landing-text)" }}>
                  Everything in Free, plus:
                </p>
                <div className="space-y-3">
                  {[
                    "Unlimited API Groups",
                    "Unlimited endpoints",
                    "1 minute checks",
                    "1 year data retention",
                    "Unlimited team members",
                    "SSO support",
                    "Custom integrations",
                    "Dedicated support",
                    "SLA guarantee",
                    "Advanced security",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check size={16} style={{ color: "var(--landing-green)", marginTop: "4px", flexShrink: 0 }} />
                      <span style={{ color: "var(--landing-text-2)", fontSize: "14px" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--landing-text)" }}>
              Detailed Feature Comparison
            </h2>

            {features.map((section, sectionIdx) => (
              <div key={sectionIdx} className="mb-12">
                <h3 className="text-lg font-semibold mb-4 px-4" style={{ color: "var(--landing-text)" }}>
                  {section.category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        style={{
                          borderBottom: "2px solid var(--landing-border)",
                        }}
                      >
                        <th
                          className="text-left py-4 px-4 font-semibold"
                          style={{ color: "var(--landing-text)" }}
                        >
                          Feature
                        </th>
                        <th
                          className="text-center py-4 px-4 font-semibold"
                          style={{ color: "var(--landing-text)" }}
                        >
                          Free
                        </th>
                        <th
                          className="text-center py-4 px-4 font-semibold"
                          style={{ color: "var(--landing-text)" }}
                        >
                          Enterprise
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item, itemIdx) => (
                        <tr
                          key={itemIdx}
                          style={{
                            borderBottom: "1px solid var(--landing-border)",
                          }}
                        >
                          <td className="py-3 px-4" style={{ color: "var(--landing-text)" }}>
                            {item.name}
                          </td>
                          <td
                            className="text-center py-3 px-4"
                            style={{ color: "var(--landing-text-2)" }}
                          >
                            {item.free}
                          </td>
                          <td
                            className="text-center py-3 px-4"
                            style={{ color: "var(--landing-text-2)" }}
                          >
                            {item.enterprise}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--landing-text)" }}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-6 max-w-3xl mx-auto">
              {[
                {
                  question: "Can I upgrade or downgrade my plan anytime?",
                  answer: "Yes, you can change your plan at any time. Changes take effect immediately.",
                },
                {
                  question: "What happens if I exceed my plan limits?",
                  answer: "Your API groups will continue to function. We'll notify you to upgrade when you approach limits.",
                },
                {
                  question: "Do you offer annual billing discounts?",
                  answer: "Yes! Annual plans get 2 months free compared to paying monthly.",
                },
                {
                  question: "Is there a money-back guarantee?",
                  answer: "Yes, 30-day money-back guarantee if you're not satisfied with our service.",
                },
                {
                  question: "How do I contact support?",
                  answer: "All plans include email support. Enterprise includes priority support.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-lg"
                  style={{
                    background: "rgba(250, 250, 248, 0.7)",
                    border: "1px solid var(--landing-border)",
                  }}
                >
                  <h4 className="font-semibold mb-2" style={{ color: "var(--landing-text)" }}>
                    {faq.question}
                  </h4>
                  <p style={{ color: "var(--landing-text-2)" }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA SECTION */}
          <div
            className="rounded-lg p-12 text-center"
            style={{
              background: "rgba(232, 93, 4, 0.08)",
              border: "2px solid var(--landing-accent)",
            }}
          >
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--landing-text)" }}>
              Ready to monitor your APIs?
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--landing-text-2)" }}>
              Start with our free plan or talk with us about a custom Enterprise setup. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://sys-monitoring-monorepo-web.vercel.app/login"
                className="btn-hero btn-hero-dark"
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link
                href="mailto:contact@watchlayer.com?subject=Pricing Inquiry"
                className="btn-hero btn-hero-light"
              >
                Contact Sales <MessageSquare size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
