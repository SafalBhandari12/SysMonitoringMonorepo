import "./landing.css";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  CheckSquare2,
  Globe,
  TrendingUp,
  AlertCircle,
  Archive,
  Code,
  Play,
  AlertTriangle,
  MapPin,
  List,
  Network,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
export default function Home() {
  return (
    <>
      {/* HERO */}
      <div className="hero">
        <h1>
          Know when your APIs go down
          <br />
          <em>before your users do</em>
        </h1>
        <p className="hero-sub">
          Fast, regional API and domain monitoring. Checks run every 10 seconds
          from multiple locations worldwide. Incidents open automatically. You
          get alerted before anyone notices.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn-hero btn-hero-dark">
            Start monitoring free{" "}
            <ArrowRight
              size={18}
              style={{ display: "inline", marginLeft: "6px" }}
            />
          </Link>
          <Link href="/docs" className="btn-hero btn-hero-light">
            Read the docs
          </Link>
        </div>
        <p className="hero-note">
          Or, <Link href="/open-source">run it yourself</Link> with the
          open-source version.
        </p>

        {/* Terminal */}
        <div className="terminal-wrap">
          <div className="terminal-bar">
            <div className="t-dot" style={{ background: "#ff5f56" }}></div>
            <div className="t-dot" style={{ background: "#ffbd2e" }}></div>
            <div className="t-dot" style={{ background: "#27c93f" }}></div>
            <span className="t-bar-label">
              watchlayer / worker / api-monitoring-us-east
            </span>
          </div>
          <div className="terminal-body">
            <pre>
              <span className="c-dim">
                {"# consuming api-monitoring-us-east queue\n\n"}
              </span>
              <span className="c-green">✓</span>{" "}
              <span className="c-blue">GET</span> /api/v1/users{" "}
              <span className="c-green">142ms</span> UP us-east
              {"\n"}
              <span className="c-green">✓</span>{" "}
              <span className="c-blue">GET</span> /api/v1/products{" "}
              <span className="c-green">89ms</span> UP us-east
              {"\n"}
              <span className="c-red">✗</span>{" "}
              <span className="c-blue">POST</span> /api/v1/payments{" "}
              <span className="c-red">TIMEOUT</span> DOWN us-east
              {"\n"}
              <span className="c-red">✗</span>{" "}
              <span className="c-blue">POST</span> /api/v1/payments{" "}
              <span className="c-red">503</span> DOWN us-east
              {"\n"}
              <span className="c-orange">!</span> threshold crossed (3/60s) —
              opening INC-0042
              {"\n"}
              <span className="c-dim">
                {"api: /api/v1/payments | region: us-east\n\n"}
              </span>
              <span className="c-green">✓</span>{" "}
              <span className="c-blue">POST</span> /api/v1/payments{" "}
              <span className="c-green">201ms</span> UP us-east
              {"\n"}
              <span className="c-green">✓</span> recovery confirmed — resolving
              INC-0042
            </pre>
          </div>
        </div>
      </div>

      {/* LOGOS */}
      <div className="logos-section">
        <div className="logos-label">
          Trusted by teams monitoring production APIs
        </div>
        <div className="logos-row">
          <span className="logo-item">Acme Corp</span>
          <span className="logo-item">DevStack</span>
          <span className="logo-item">Northforge</span>
          <span className="logo-item">Meridian</span>
          <span className="logo-item">Openloop</span>
          <span className="logo-item">Axiom Labs</span>
        </div>
      </div>

      {/* STATS */}
      <div className="section">
        <div className="section-tag">
          <Sparkles size={18} className="inline-icon" /> By the numbers
        </div>
        <h2 className="section-h2">Built for reliability at any scale</h2>
        <p className="section-desc">
          No moving parts to manage. Configure your endpoints and let Watchlayer
          handle the rest — continuously, across every region, 24/7.
        </p>

        <div className="stats-row">
          <div className="stat-cell">
            <div className="stat-num">10s</div>
            <div className="stat-label">Check interval</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">p99</div>
            <div className="stat-label">Latency tracked</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">90d</div>
            <div className="stat-label">History retained</div>
          </div>
        </div>

        <div style={{ marginTop: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "12px",
                color: "var(--text-3)",
              }}
            >
              POST /api/v1/payments — last 30 days
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "12px",
                color: "var(--green)",
              }}
            >
              99.3% uptime
            </span>
          </div>
          <div className="uptime-row">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`up-seg ${i === 13 ? "down" : i === 22 ? "warn" : ""}`}
              ></div>
            ))}
          </div>
          <div className="uptime-meta">
            <span>30 days ago</span>
            <span>today</span>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* FEATURES */}
      <div className="section" id="features">
        <div className="section-tag">
          <Zap size={18} className="inline-icon" /> Features
        </div>
        <h2 className="section-h2">
          Everything you need to monitor with confidence
        </h2>

        <div className="feat-table-wrap">
          <div className="feat-row">
            <div className="feat-left">
              <CheckSquare2 size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">DNS Verification</div>
                <div className="feat-sub">automated ownership proof</div>
              </div>
            </div>
            <div className="feat-right">
              Prove domain ownership via a DNS TXT record before monitoring
              begins. The system resolves nameservers and validates the token
              automatically — no manual review, no delays.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <Globe size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Regional Monitoring</div>
                <div className="feat-sub">parallel checks worldwide</div>
              </div>
            </div>
            <div className="feat-right">
              Same API checked from different regions simultaneously. Compare
              latency, catch geo-specific issues, and get a complete global
              picture without extra configuration.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <TrendingUp size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Latency Percentiles</div>
                <div className="feat-sub">p50, p90, p99 tracked</div>
              </div>
            </div>
            <div className="feat-right">
              Raw events are aggregated into daily stats and rolling percentile
              buckets. Fast queries, deep insights, no bloat.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <AlertCircle size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Auto Incidents</div>
                <div className="feat-sub">threshold-based detection</div>
              </div>
            </div>
            <div className="feat-right">
              Failures above your threshold automatically open incidents. No
              manual triage, no missing issues. Recovery confirmed before
              auto-close.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <Archive size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">90-Day History</div>
                <div className="feat-sub">complete audit trail</div>
              </div>
            </div>
            <div className="feat-right">
              Every check, every incident, every recovery. Backed up to
              PostgreSQL. Query by date range, region, status code—run reports
              with confidence.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <Code size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Open Source</div>
                <div className="feat-sub">run locally or cloud</div>
              </div>
            </div>
            <div className="feat-right">
              Full source on GitHub. Deploy to your own infrastructure, or use
              Watchlayer Cloud for managed monitoring without DevOps overhead.
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <div className="section" id="how">
        <div className="section-tag">
          <Play size={18} className="inline-icon" /> How it works
        </div>
        <h2 className="section-h2">From setup to insight in minutes</h2>
        <p className="section-desc">
          A three-phase lifecycle — domain verification, API registration,
          continuous monitoring — gets you running fast and keeps results
          accurate.
        </p>

        <div className="two-col">
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <div className="step-title">Register a domain</div>
                <div className="step-desc">
                  Create a domain in Watchlayer and add a DNS TXT record. We'll
                  automatically verify ownership and mark it VERIFIED.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <div className="step-title">Add APIs to monitor</div>
                <div className="step-desc">
                  For each API, specify method (GET/POST/etc), path, and
                  expected status. Watchlayer queues a regional monitoring job
                  for each one.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <div className="step-title">Monitor continuously</div>
                <div className="step-desc">
                  Every 10 seconds, remote workers execute HTTP probes across
                  your chosen regions. Results are stored, incidents are
                  tracked, data is aggregated.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div>
                <div className="step-title">View results</div>
                <div className="step-desc">
                  See raw events, daily stats, and percentile breakdowns. Drill
                  into incidents, compare regions, export historical data for
                  analysis.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              marginTop: "2rem",
              fontFamily: "monospace",
              fontSize: "11px",
              lineHeight: "1.4",
              color: "#1a1a1a",
              backgroundColor: "#f5f5f5",
              padding: "0",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                backgroundColor: "#000",
                color: "#fff",
                padding: "8px 12px",
                fontWeight: "bold",
                fontSize: "11px",
                letterSpacing: "0.5px",
              }}
            >
              MONITORING LIFECYCLE
            </div>
            <div style={{ display: "flex", padding: "12px" }}>
              <div style={{ width: "40%", paddingRight: "12px" }}>
                <div
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "10px",
                    }}
                  >
                    Phase 1: Domain
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    PENDING → VERIFIED
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    margin: "6px 0",
                    fontSize: "10px",
                  }}
                >
                  ↓ Enqueue Job
                </div>
                <div
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "10px",
                    }}
                  >
                    Phase 2: API
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    CREATE → READY
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    margin: "6px 0",
                    fontSize: "10px",
                  }}
                >
                  ↓ Enqueue Job
                </div>
                <div style={{ border: "1px solid #333", padding: "8px" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "10px",
                    }}
                  >
                    Phase 3: Monitor
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    RUN → CONTINUOUS
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "60%",
                  paddingLeft: "12px",
                  borderLeft: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "11px",
                    lineHeight: "1.5",
                    color: "#333",
                  }}
                >
                  Three-phase automated setup gets you monitoring in minutes
                  with zero manual overhead.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    ✓ Verify DNS ownership automatically
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    ✓ Enqueue regional monitoring jobs
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    ✓ Run HTTP probes every 10s
                  </div>
                  <div style={{ fontSize: "10px" }}>
                    ✓ Detect and resolve incidents
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* PERFORMANCE */}
      <div className="section">
        <div className="section-tag">
          <Zap size={18} className="inline-icon" /> Performance
        </div>
        <h2 className="section-h2">
          Fast queries across all your monitoring data
        </h2>
        <p className="section-desc">
          Raw events, daily aggregates, and latency percentiles are stored
          separately so dashboards stay fast even across 90 days of history.
        </p>

        <div className="two-col">
          <div>
            <table className="latency-table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Last 24h incidents</td>
                  <td className="latency-good">14ms</td>
                </tr>
                <tr>
                  <td>30d latency p99</td>
                  <td className="latency-good">8ms</td>
                </tr>
                <tr>
                  <td>Daily uptime %</td>
                  <td className="latency-ok">32ms</td>
                </tr>
                <tr>
                  <td>Raw events (1h window)</td>
                  <td className="latency-good">21ms</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              overflowX: "auto",
              marginTop: "2rem",
              fontFamily: "monospace",
              fontSize: "11px",
              lineHeight: "1.4",
              color: "#1a1a1a",
              backgroundColor: "#f5f5f5",
              padding: "0",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                backgroundColor: "#000",
                color: "#fff",
                padding: "8px 12px",
                fontWeight: "bold",
                fontSize: "11px",
                letterSpacing: "0.5px",
              }}
            >
              DATA PIPELINE & QUERIES
            </div>
            <div style={{ display: "flex", padding: "12px" }}>
              <div style={{ width: "40%", paddingRight: "12px" }}>
                <div
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "10px",
                    }}
                  >
                    Raw Events
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    Per request basis
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    margin: "6px 0",
                    fontSize: "10px",
                  }}
                >
                  ↓ Aggregation
                </div>
                <div
                  style={{
                    border: "1px solid #333",
                    padding: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "10px",
                    }}
                  >
                    Daily Stats
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    Count + Uptime %
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    margin: "6px 0",
                    fontSize: "10px",
                  }}
                >
                  ↓PostgreSQL
                </div>
                <div style={{ border: "1px solid #333", padding: "8px" }}>
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "4px",
                      fontSize: "10px",
                    }}
                  >
                    API Metrics
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    p50, p90, p99
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "60%",
                  paddingLeft: "12px",
                  borderLeft: "1px solid #ddd",
                }}
              >
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "11px",
                    lineHeight: "1.5",
                    color: "#333",
                  }}
                >
                  Separate storage strategies for different query patterns
                  optimize both speed and cost.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    ✓ 14ms - Last 24h incidents
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    ✓ 8ms - 30d p99 latency
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    ✓ 32ms - Daily uptime %
                  </div>
                  <div style={{ fontSize: "10px" }}>✓ 21ms - 1h raw events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* INCIDENTS */}
      <div className="section" id="incidents">
        <div className="section-tag">
          <AlertTriangle size={18} className="inline-icon" /> Incident
          management
        </div>
        <h2 className="section-h2">
          Automatic incident tracking, start to finish
        </h2>
        <p className="section-desc">
          No manual triage. Threshold-based failure windows open incidents.
          Recovery windows close them. Region-aware throughout — no separate
          daemon needed.
        </p>

        <div className="two-col">
          <div className="oss-grid" style={{ marginTop: "0" }}>
            <div className="oss-cell">
              <div className="oss-label">ONGOING</div>
              <div className="oss-desc">
                Multiple failures within threshold → incident opens
                automatically. Alerts are triggered. No manual intervention
                required.
              </div>
            </div>
            <div className="oss-cell">
              <div className="oss-label">SUMMARY</div>
              <div className="oss-desc">
                Region, API, threshold, start time, and recovery time. Query by
                date range or status.
              </div>
            </div>
            <div className="oss-cell">
              <div className="oss-label">RECOVERY</div>
              <div className="oss-desc">
                Consecutive successful checks → incident auto-resolves.
                All-clear signal is logged.
              </div>
            </div>
            <div className="oss-cell">
              <div className="oss-label">AUDIT</div>
              <div className="oss-desc">
                90 days of incident history. Correlate with deploy logs, analyze
                patterns, run postmortems.
              </div>
            </div>
          </div>

          <div className="incident-block">
            <div className="inc-header">
              <div className="inc-title">
                <span>INC-0042</span>
                <span className="inc-pill pill-resolved">RESOLVED</span>
              </div>
              <span className="inc-id">POST /api/v1/payments · us-east</span>
            </div>
            <div className="inc-row">
              <span className="inc-time">13:45:22</span>
              <span className="inc-msg">
                <strong>ONGOING</strong> · 3 failures in 60s window
              </span>
            </div>
            <div className="inc-row">
              <span className="inc-time">13:46:01</span>
              <span className="inc-msg">
                <strong>Updated</strong> · threshold crossed again, duration
                extended
              </span>
            </div>
            <div className="inc-row">
              <span className="inc-time">13:47:15</span>
              <span className="inc-msg good">
                <strong>RESOLVED</strong> · recovery confirmed (5 consecutive
                UP)
              </span>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* REGIONS */}
      <div className="section" id="regions">
        <div className="section-tag">
          <MapPin size={18} className="inline-icon" /> Global regions
        </div>
        <h2 className="section-h2">Monitor from where your users are</h2>
        <p className="section-desc">
          Regional monitoring reveals the real user experience. A timeout in
          Singapore looks very different from a timeout in Frankfurt.
        </p>

        <div className="regions-grid">
          <div className="region-cell">
            <div className="region-name">US East</div>
            <div className="region-code">us-east-1</div>
            <div className="region-stat">87ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
          <div className="region-cell">
            <div className="region-name">EU Frankfurt</div>
            <div className="region-code">eu-west-1</div>
            <div className="region-stat">142ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
          <div className="region-cell">
            <div className="region-name">Asia Singapore</div>
            <div className="region-code">ap-southeast-1</div>
            <div className="region-stat">156ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
          <div className="region-cell" style={{ background: "var(--bg-off)" }}>
            <div className="region-name">+ 1 more</div>
            <div className="region-code">australia</div>
            <div className="region-stat">189ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* OPEN SOURCE */}
      <div className="section">
        <div className="section-tag">
          <Code size={18} className="inline-icon" /> Open source
        </div>
        <h2 className="section-h2">Built in the open</h2>
        <p className="section-desc">
          The full monitoring stack — workers, schema, queue architecture — is
          open source. Run it yourself or use Watchlayer Cloud.
        </p>

        <div className="oss-grid">
          <div className="oss-cell">
            <div className="oss-label">Backend API</div>
            <div className="oss-desc">
              Express.js server with Prisma ORM. Handle domain registration, API
              setup, and queue jobs.
            </div>
            <Link
              href="https://github.com/watchlayer/backend"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/watchlayer/backend{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
          <div className="oss-cell">
            <div className="oss-label">Worker Queue</div>
            <div className="oss-desc">
              BullMQ-powered workers for DNS verification and HTTP monitoring.
              Deploy to any Node.js container.
            </div>
            <Link
              href="https://github.com/watchlayer/workers"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/watchlayer/workers{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
          <div className="oss-cell">
            <div className="oss-label">Schema & Types</div>
            <div className="oss-desc">
              Prisma schema, TypeScript types, and shared utilities. Unified
              across all apps in the monorepo.
            </div>
            <Link
              href="https://github.com/watchlayer/packages"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/watchlayer/packages{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
          <div className="oss-cell">
            <div className="oss-label">Web Dashboard</div>
            <div className="oss-desc">
              Next.js frontend for viewing incidents, metrics, and historical
              data. Self-hosted or Watchlayer Cloud.
            </div>
            <Link
              href="https://github.com/watchlayer/web"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/watchlayer/web{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* UPDATES */}
      <div className="section">
        <div className="section-tag">
          <List size={18} className="inline-icon" /> Updates
        </div>
        <h2 className="section-h2">Recent changes</h2>

        <div className="updates-list">
          <div className="update-row">
            <span className="update-date">2025-04-10</span>
            <span className="update-title">Regional latency heatmaps</span>
            <span className="update-desc">
              Visualize p99 latency across all regions for any API. Spot
              geographic hotspots instantly.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">2025-04-05</span>
            <span className="update-title">Incident API endpoints</span>
            <span className="update-desc">
              Query incidents programmatically. Integrate with incident
              management platforms like PagerDuty and Slack.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">2025-03-28</span>
            <span className="update-title">Custom thresholds</span>
            <span className="update-desc">
              Define failure thresholds per API. Set stricter rules for critical
              endpoints, looser for non-critical.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">2025-03-15</span>
            <span className="update-title">Export to CSV</span>
            <span className="update-desc">
              Download raw events, daily stats, and incident summaries. Build
              custom reports in Google Sheets or Excel.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">2025-03-01</span>
            <span className="update-title">API docs updated</span>
            <span className="update-desc">
              Added TypeScript examples, webhook payload samples, and
              authentication best practices.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">2025-02-20</span>
            <span className="update-title">Open source launch</span>
            <span className="update-desc">
              Full monitoring stack now available on GitHub. Deploy to your own
              infrastructure.
            </span>
          </div>
        </div>
      </div>

      {/* QUICKSTART */}
      <div className="quickstart">
        <div className="quickstart-inner">
          <h2>Get up and running in 30 seconds</h2>
          <p>
            No credit card needed. Start with the open-source version or connect
            to Watchlayer Cloud.
          </p>

          <div className="install-block">
            <span className="install-cmd">npm install @watchlayer/cli</span>
            <span className="install-lang">npm</span>
          </div>
          <div className="install-block">
            <span className="install-cmd">pip install watchlayer-sdk</span>
            <span className="install-lang">python</span>
          </div>

          <div className="quickstart-actions">
            <Link href="/signup" className="btn-hero btn-hero-dark">
              Start monitoring free{" "}
              <ArrowRight
                size={18}
                style={{ display: "inline", marginLeft: "6px" }}
              />
            </Link>
            <Link href="/docs" className="btn-hero btn-hero-light">
              View documentation
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div>
          <Link href="/" className="nav-logo" style={{ marginBottom: "8px" }}>
            <span className="nav-logo-mark"></span>
            Watchlayer
          </Link>
          <p
            style={{
              fontSize: "12.5px",
              color: "var(--text-3)",
              fontWeight: "300",
            }}
          >
            API and domain monitoring.
            <br />
            Open source. Built for reliability.
          </p>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--text-3)",
              marginTop: "12px",
            }}
          >
            © 2025
          </p>
        </div>

        <div>
          <div className="footer-col-label">Product</div>
          <ul className="footer-links">
            <li>
              <Link href="#features">Features</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/docs">Documentation</Link>
            </li>
            <li>
              <Link href="/status">Status</Link>
            </li>
            <li>
              <Link href="#">Open Source</Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="footer-col-label">Community</div>
          <ul className="footer-links">
            <li>
              <Link
                href="https://github.com/watchlayer"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link
                href="https://discord.gg/watchlayer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </Link>
            </li>
            <li>
              <Link
                href="https://twitter.com/watchlayer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="footer-col-label">Company</div>
          <ul className="footer-links">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
}
