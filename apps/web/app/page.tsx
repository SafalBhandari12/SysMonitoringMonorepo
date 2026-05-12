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
      <Navbar />
      {/* HERO */}
      <div className="hero">
        <h1>
          Know when your APIs go down
          <br />
          <em>before your users do</em>
        </h1>
        <p className="hero-sub">
          Domain-first API monitoring with a published Express package for
          wiring monitored services into your setup. Verify ownership, add
          endpoints, and track health from the same dashboard.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn-hero btn-hero-dark">
            Start with Google{" "}
            <ArrowRight
              size={18}
              style={{ display: "inline", marginLeft: "6px" }}
            />
          </Link>
          <Link href="/dashboard" className="btn-hero btn-hero-light">
            View the dashboard
          </Link>
        </div>
        <p className="hero-note">
          Install the Express package, sign in, verify your domain, then create
          API groups, endpoints, and API keys.
        </p>

        {/* Terminal */}
        <div className="terminal-wrap">
          <div className="terminal-bar">
            <div className="t-dot" style={{ background: "#ff5f56" }}></div>
            <div className="t-dot" style={{ background: "#ffbd2e" }}></div>
            <div className="t-dot" style={{ background: "#27c93f" }}></div>
            <span className="t-bar-label">
              watchlayer / timed-function / region-IN
            </span>
          </div>
          <div className="terminal-body">
            <pre>
              <span className="c-dim">
                {"# running scheduled API probes\n\n"}
              </span>
              <span className="c-green">OK</span>{" "}
              <span className="c-blue">GET</span> /api/v1/users{" "}
              <span className="c-green">142ms</span> UP IN
              {"\n"}
              <span className="c-green">OK</span>{" "}
              <span className="c-blue">GET</span> /api/v1/products{" "}
              <span className="c-green">89ms</span> UP IN
              {"\n"}
              <span className="c-red">ERR</span>{" "}
              <span className="c-blue">POST</span> /api/v1/payments{" "}
              <span className="c-red">TIMEOUT</span> DOWN IN
              {"\n"}
              <span className="c-red">ERR</span>{" "}
              <span className="c-blue">POST</span> /api/v1/payments{" "}
              <span className="c-red">503</span> DOWN IN
              {"\n"}
              <span className="c-orange">!</span> failure window crossed -
              opening INC-0042
              {"\n"}
              <span className="c-dim">
                {"api: /api/v1/payments | region: IN\n\n"}
              </span>
              <span className="c-green">OK</span>{" "}
              <span className="c-blue">POST</span> /api/v1/payments{" "}
              <span className="c-green">201ms</span> UP IN
              {"\n"}
              <span className="c-green">OK</span> recovery confirmed - resolving
              INC-0042
            </pre>
          </div>
        </div>
      </div>

      {/* LOGOS */}
      <div className="logos-section">
        <div className="logos-label">
          Built around the workflow this app already supports
        </div>
        <div className="logos-row">
          <span className="logo-item">Google Auth</span>
          <span className="logo-item">Prisma</span>
          <span className="logo-item">PostgreSQL</span>
          <span className="logo-item">Redis</span>
          <span className="logo-item">sysmonitoringexpress</span>
          <span className="logo-item">Cloudflare Cron</span>
        </div>
      </div>

      {/* STATS */}
      <div className="section">
        <div className="section-tag">
          <Sparkles size={18} className="inline-icon" /> By the numbers
        </div>
        <h2 className="section-h2">Built for the monitoring flow in this repo</h2>
        <p className="section-desc">
          Current frontend, Prisma schema, scheduled workers, and dashboard
          work together: verify domains, register APIs, and collect responses.
        </p>

        <div className="stats-row">
          <div className="stat-cell">
            <div className="stat-num">5m</div>
            <div className="stat-label">Probe interval</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">p90</div>
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
              POST /api/v1/payments - last 30 days
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
          The pieces already wired into your product
        </h2>

        <div className="feat-table-wrap">
          <div className="feat-row">
            <div className="feat-left">
              <CheckSquare2 size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Domain Verification</div>
                <div className="feat-sub">DNS or meta ownership proof</div>
              </div>
            </div>
            <div className="feat-right">
              Users prove domain ownership with a generated token before
              monitoring begins. DNS TXT and meta-tag verification are both
              supported by the current setup.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <Globe size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Scheduled Monitoring</div>
                <div className="feat-sub">timer-based API probes</div>
              </div>
            </div>
            <div className="feat-right">
              The serverless API checker reads registered endpoints, sends
              HTTP probes, stores response data, and tags results with the
              configured region.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <TrendingUp size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">Latency Percentiles</div>
                <div className="feat-sub">p90 and p99 tracked</div>
              </div>
            </div>
            <div className="feat-right">
              Raw response rows, daily stats, API metrics, and digest data feed
              the dashboard cards and table views without recalculating every
              request.
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
              Redis-backed failure windows open ongoing incidents and mark them
              resolved when healthy checks recover below the configured
              threshold.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <Archive size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">90-Day Metrics</div>
                <div className="feat-sub">dashboard-friendly history</div>
              </div>
            </div>
            <div className="feat-right">
              Uptime, response history, incidents, and daily aggregates are
              stored in PostgreSQL so the dashboard can query them through
              Prisma with confidence.
            </div>
          </div>
          <div className="feat-row">
            <div className="feat-left">
              <Code size={20} className="feat-sym-icon" />
              <div>
                <div className="feat-name">API Keys</div>
                <div className="feat-sub">dashboard-managed access</div>
              </div>
            </div>
            <div className="feat-right">
              Users can create and manage API keys from the dashboard alongside
              API groups and monitored endpoints.
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
          A practical lifecycle connects onboarding, endpoint setup, scheduled
          checks, and dashboard reporting without changing screens or systems.
        </p>

        <div className="two-col">
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <div className="step-title">Register a domain</div>
                <div className="step-desc">
                  Register a domain without a protocol prefix, then verify it
                  with either the DNS TXT token or the supported meta tag.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <div className="step-title">Add APIs to monitor</div>
                <div className="step-desc">
                  Create API groups, then add endpoints with method, path,
                  headers, params, query values, and optional body data.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <div className="step-title">Monitor continuously</div>
                <div className="step-desc">
                  The Azure timer function checks saved APIs, writes response
                  rows, and updates Redis-backed incident state.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div>
                <div className="step-title">View results</div>
                <div className="step-desc">
                  Review uptime bars, p90 and p99 latency, API status rows,
                  and the most recent incidents from the dashboard.
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
                    PENDING {"->"} VERIFIED
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
                  Verification check
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
                    CREATE {"->"} READY
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
                  Scheduled probe
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
                    RUN {"->"} CONTINUOUS
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
                  The setup matches the app flow: authenticate, onboard a
                  domain, add APIs then let scheduled jobs collect data.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    OK Verify DNS or meta ownership
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    OK Create API groups and endpoints
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    OK Run timed HTTP probes
                  </div>
                  <div style={{ fontSize: "10px" }}>
                    OK Detect and resolve incidents
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
                    Per probe basis
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
                  Aggregation
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
                  PostgreSQL
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
                    p90 and p99
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
                  Prisma queries, Redis caching, daily stats, and TDigest
                  summaries keep overview screens responsive.
                </div>
                <div style={{ marginTop: "8px" }}>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    OK 14ms - Last 24h incidents
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    OK 8ms - 30d p99 latency
                  </div>
                  <div style={{ marginBottom: "6px", fontSize: "10px" }}>
                    OK 32ms - Daily uptime %
                  </div>
                  <div style={{ fontSize: "10px" }}>OK 21ms - 1h raw events</div>
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
          Successful probe windows can resolve them. Recent activity appears
          directly in the dashboard.
        </p>

        <div className="two-col">
          <div className="oss-grid" style={{ marginTop: "0" }}>
            <div className="oss-cell">
              <div className="oss-label">ONGOING</div>
              <div className="oss-desc">
                Multiple failures within threshold open an incident
                automatically. Alerts are triggered. No manual intervention
                required.
              </div>
            </div>
            <div className="oss-cell">
              <div className="oss-label">SUMMARY</div>
              <div className="oss-desc">
                Each incident stores the API, affected regions, status, start
                time, and optional end time for the dashboard timeline.
              </div>
            </div>
            <div className="oss-cell">
              <div className="oss-label">RECOVERY</div>
              <div className="oss-desc">
                Consecutive successful checks can auto-resolve incidents.
                All-clear signal is logged.
              </div>
            </div>
            <div className="oss-cell">
              <div className="oss-label">AUDIT</div>
              <div className="oss-desc">
                Incident rows stay linked to monitored APIs so reliability
                patterns can be reviewed alongside uptime and latency.
              </div>
            </div>
          </div>

          <div className="incident-block">
            <div className="inc-header">
              <div className="inc-title">
                <span>INC-0042</span>
                <span className="inc-pill pill-resolved">RESOLVED</span>
              </div>
              <span className="inc-id">POST /api/v1/payments - IN</span>
            </div>
            <div className="inc-row">
              <span className="inc-time">13:45:22</span>
              <span className="inc-msg">
                <strong>ONGOING</strong> - 3 failures in the lookback window
              </span>
            </div>
            <div className="inc-row">
              <span className="inc-time">13:46:01</span>
              <span className="inc-msg">
                <strong>Updated</strong> - threshold crossed again, duration
                extended
              </span>
            </div>
            <div className="inc-row">
              <span className="inc-time">13:47:15</span>
              <span className="inc-msg good">
                <strong>RESOLVED</strong> - recovery confirmed (5 consecutive
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
          Region values are part of the schema and probe results. Use them to
          separate India, US, EU, Singapore, and South America performance.
        </p>

        <div className="regions-grid">
          <div className="region-cell">
            <div className="region-name">India</div>
            <div className="region-code">IN</div>
            <div className="region-stat">87ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
          <div className="region-cell">
            <div className="region-name">United States</div>
            <div className="region-code">US</div>
            <div className="region-stat">142ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
          <div className="region-cell">
            <div className="region-name">Singapore</div>
            <div className="region-code">SG</div>
            <div className="region-stat">156ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
          <div className="region-cell" style={{ background: "var(--bg-off)" }}>
            <div className="region-name">Europe</div>
            <div className="region-code">EU</div>
            <div className="region-stat">189ms</div>
            <div className="region-unit">p99 latency</div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* OPEN SOURCE */}
      <div className="section">
        <div className="section-tag">
          <Code size={18} className="inline-icon" /> Current stack
        </div>
        <h2 className="section-h2">Built from the pieces in this monorepo</h2>
        <p className="section-desc">
          The monitoring stack in this workspace uses web routes, Prisma,
          scheduled functions, Redis, PostgreSQL, and shared packages.
        </p>

        <div className="oss-grid">
          <div className="oss-cell">
            <div className="oss-label">Next.js Web App</div>
            <div className="oss-desc">
              App Router frontend with NextAuth, onboarding routes, dashboard
              APIs, Prisma access, and reusable UI components.
            </div>
            <Link
              href="https://github.com/watchlayer/backend"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              apps/web{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
          <div className="oss-cell">
            <div className="oss-label">Azure Timer</div>
            <div className="oss-desc">
              Scheduled function that reads saved APIs, performs HTTP checks,
              stores responses, and manages incident transitions.
            </div>
            <Link
              href="https://github.com/watchlayer/workers"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              apps/serverless/hitApi{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
          <div className="oss-cell">
            <div className="oss-label">Cloudflare Cron</div>
            <div className="oss-desc">
              Scheduled worker for domain verification, API metrics, and daily
              stat aggregation through Hyperdrive/PostgreSQL.
            </div>
            <Link
              href="https://github.com/watchlayer/packages"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              apps/serverless/dailyworker{" "}
              <ArrowRight
                size={14}
                style={{ display: "inline", marginLeft: "4px" }}
              />
            </Link>
          </div>
          <div className="oss-cell">
            <div className="oss-label">Express Package</div>
            <div className="oss-desc">
              Published npm package for Express projects that want to connect
              monitored services to the platform.
            </div>
            <Link
              href="https://github.com/watchlayer/web"
              className="oss-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              npm i sysmonitoringexpress{" "}
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
        <h2 className="section-h2">What the product supports now</h2>

        <div className="updates-list">
          <div className="update-row">
            <span className="update-date">Now</span>
            <span className="update-title">Google sign-in</span>
            <span className="update-desc">
              Authentication is wired through NextAuth with the Prisma adapter
              and Google as the active provider.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">Now</span>
            <span className="update-title">Domain onboarding</span>
            <span className="update-desc">
              Users register one domain, receive a verification token, and
              complete ownership verification before moving to the dashboard.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">Now</span>
            <span className="update-title">API groups and endpoints</span>
            <span className="update-desc">
              Dashboard forms support grouped APIs with method, path, headers,
              params, query values, and optional request bodies.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">Now</span>
            <span className="update-title">Scheduled checks</span>
            <span className="update-desc">
              The serverless checker stores response status, response time,
              status code, and region for every monitored endpoint.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">Now</span>
            <span className="update-title">Dashboard metrics</span>
            <span className="update-desc">
              Overview cards show API groups, APIs, incidents, and aggregated
              p90 and p99 response times.
            </span>
          </div>
          <div className="update-row">
            <span className="update-date">Now</span>
            <span className="update-title">Published Express package</span>
            <span className="update-desc">
              The `sysmonitoringexpress` package is available on npm for
              Express app integrations.
            </span>
          </div>
        </div>
      </div>

      {/* QUICKSTART */}
      <div className="quickstart">
        <div className="quickstart-inner">
          <h2>Install the package, then connect the dashboard</h2>
          <p>
            Add the Express package to your service, then use Google sign-in to
            verify a domain, create API groups, and manage endpoints.
          </p>

          <div className="install-block">
            <span className="install-cmd">npm i sysmonitoringexpress</span>
            <span className="install-lang">npm</span>
          </div>
          <div className="install-block">
            <span className="install-cmd">Add domain, API group, and endpoint</span>
            <span className="install-lang">dashboard</span>
          </div>

          <div className="quickstart-actions">
            <Link href="/signup" className="btn-hero btn-hero-dark">
              Start with Google{" "}
              <ArrowRight
                size={18}
                style={{ display: "inline", marginLeft: "6px" }}
              />
            </Link>
            <Link href="/dashboard" className="btn-hero btn-hero-light">
              View dashboard
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
            Domain and API monitoring.
            <br />
            Built around the package and dashboard flow.
          </p>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--text-3)",
              marginTop: "12px",
            }}
          >
            Copyright 2026
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
