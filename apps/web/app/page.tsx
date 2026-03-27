import styles from "./page.module.css";
import React from "react";

const features = [
  {
    title: "Method-Aware Probes",
    description:
      "Beyond simple pings. Monitor specific HTTP methods (GET, POST, PUT, DELETE) with custom payloads and headers.",
    icon: "■",
  },
  {
    title: "DNS Verification",
    description:
      "Secure domain ownership validation via TXT records ensures you only monitor what you control.",
    icon: "◆",
  },
  {
    title: "90-Day Retention",
    description:
      "Long-term historical data persistence. Analyze trends and degradation over quarters, not just days.",
    icon: "▲",
  },
  {
    title: "Global Edge Network",
    description:
      "Multi-region execution ensures your APIs are accessible from everywhere your users are.",
    icon: "●",
  },
];

const TerminalVisual = () => (
  <div className={styles.terminalWindow}>
    <div className={styles.terminalHeader}>
      <span className={styles.terminalTitle}>STATUSGUARD_CLI_V2.0</span>
      <div className={styles.terminalControls}>
        <span className={styles.control} />
        <span className={styles.control} />
        <span className={styles.control} />
      </div>
    </div>
    <div className={styles.terminalBody}>
      <div className={styles.line}>
        <span className={styles.lineNumber}>01</span>
        <span className={styles.code}>
          <span className={styles.keyword}>await</span> monitor.
          <span className={styles.success}>verifyDomain</span>(
          <span className={styles.string}>"api.production.shop"</span>);
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.lineNumber}>02</span>
        <span className={styles.code}>
          <span className={styles.string}>✓ DNS TXT record validated</span>
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.lineNumber}>03</span>
        <span className={styles.code}>
          <span className={styles.keyword}>const</span> probe = monitor.
          <span className={styles.success}>createProbe</span>({`{`}
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.lineNumber}>04</span>
        <span className={styles.code}>
          &nbsp;&nbsp;method: <span className={styles.string}>"POST"</span>,
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.lineNumber}>05</span>
        <span className={styles.code}>
          &nbsp;&nbsp;interval: <span className={styles.string}>"5m"</span>
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.lineNumber}>06</span>
        <span className={styles.code}>{`}`});</span>
      </div>
      <div className={styles.line}>
        <span className={styles.lineNumber}>07</span>
        <span className={styles.code}>
          <span className={styles.success}>✓ Probe active. Listening...</span>
          <span className={styles.cursor}></span>
        </span>
      </div>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>
              Precision <br />
              <span>Monitoring</span> <br />
              For Ops
            </h1>
            <p>
              The developer-first platform for verifying domain ownership and
              tracking API uptime. Deterministic checks, granular alerts, and
              long-term retention.
            </p>
            <div className={styles.ctaGroup}>
              <button className={styles.glitchButton}>Initialize System</button>
              <button className={styles.secondaryButton}>
                Read Documentation
              </button>
            </div>
          </div>
          <TerminalVisual />
        </section>

        {/* FEATURES */}
        <section className={styles.features}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </section>

        {/* WORKFLOW */}
        <section className={styles.workflow}>
          <div className={styles.heroContent}>
            <h2>Operational Workflow</h2>
            <div className={styles.steps}>
              <div className={`${styles.step} ${styles.activeStep}`}>
                <span className={styles.stepNumber}>01</span>
                <div className={styles.stepContent}>
                  <h4>Authenticate & Register</h4>
                  <p>
                    Secure OIDC login and DNS TXT record verification ensures
                    you own the infrastructure you monitor.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>02</span>
                <div className={styles.stepContent}>
                  <h4>Configure Probes</h4>
                  <p>
                    Define API endpoints with specific HTTP methods, headers,
                    and expected status codes.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>03</span>
                <div className={styles.stepContent}>
                  <h4>Analyze & Alert</h4>
                  <p>
                    Real-time dashboard updates with collected metrics and
                    immediate downtime notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.terminalWindow} style={{ opacity: 1 }}>
            {/* Network Traffic Analysis Visualization */}
            <div className={styles.terminalHeader}>
              <span>NETWORK_TRAFFIC_ANALYSIS</span>
            </div>
            <div className={styles.networkVisualization}>
              {/* Top traffic flow */}
              <div className={styles.trafficLine}>
                <div
                  className={styles.trafficPulse}
                  style={{ animationDelay: "0s" }}
                ></div>
              </div>
              {/* Middle traffic flows */}
              <div className={styles.trafficLine}>
                <div
                  className={styles.trafficPulse}
                  style={{ animationDelay: "0.5s", width: "45%" }}
                ></div>
              </div>
              <div className={styles.trafficLine}>
                <div
                  className={styles.trafficPulse}
                  style={{ animationDelay: "1s", width: "60%" }}
                ></div>
              </div>
              {/* Bottom traffic flow */}
              <div className={styles.trafficLine}>
                <div
                  className={styles.trafficPulse}
                  style={{ animationDelay: "1.5s", width: "35%" }}
                ></div>
              </div>

              {/* Status indicators */}
              <div className={styles.statusIndicators}>
                <div className={styles.indicator}>
                  <span
                    className={styles.indicatorDot}
                    style={{ background: "#4caf50" }}
                  ></span>
                  <span className={styles.indicatorLabel}>Healthy</span>
                  <span className={styles.indicatorValue}>12 domains</span>
                </div>
                <div className={styles.indicator}>
                  <span
                    className={styles.indicatorDot}
                    style={{ background: "#ffc107" }}
                  ></span>
                  <span className={styles.indicatorLabel}>Warning</span>
                  <span className={styles.indicatorValue}>2 domains</span>
                </div>
                <div className={styles.indicator}>
                  <span
                    className={styles.indicatorDot}
                    style={{ background: "#db1a1a" }}
                  ></span>
                  <span className={styles.indicatorLabel}>Critical</span>
                  <span className={styles.indicatorValue}>0 domains</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API SECTION */}
        <section className={styles.apiSection}>
          <div className={styles.terminalWindow}>
            <div className={styles.terminalHeader}>
              <span className={styles.terminalTitle}>API_RESOURCES.LOG</span>
              <div className={styles.terminalControls}>
                <span className={styles.control} />
                <span className={styles.control} />
              </div>
            </div>
            <div className={styles.terminalBody}>
              <div className={styles.line}>
                <span className={styles.code}>$ curl /v1/routes --summary</span>
              </div>
              <br />
              <div className={styles.line}>
                <span className={styles.success}>POST</span>&nbsp;
                <span className={styles.code}>/auth/google</span>
                <span className={styles.code} style={{ opacity: 0.5 }}>
                  {"      # OIDC Auth"}
                </span>
              </div>
              <div className={styles.line}>
                <span className={styles.success}>GET</span>&nbsp;&nbsp;
                <span className={styles.code}>/auth/google/callback</span>
              </div>
              <div className={styles.line}>
                <span className={styles.success}>POST</span>&nbsp;
                <span className={styles.code}>/domain/register-domain</span>
              </div>
              <div className={styles.line}>
                <span className={styles.success}>POST</span>&nbsp;
                <span className={styles.code}>/domain/verify-domain</span>
              </div>
              <div className={styles.line}>
                <span className={styles.success}>GET</span>&nbsp;&nbsp;
                <span className={styles.code}>/domain/verification-status</span>
              </div>
              <div className={styles.line}>
                <span className={styles.success}>POST</span>&nbsp;
                <span className={styles.code}>/api/add/:domainId</span>
                <span className={styles.cursor}></span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={styles.footer}>
          <h2>Ready to Deploy?</h2>
          <div className={styles.ctaGroup} style={{ justifyContent: "center" }}>
            <button className={styles.glitchButton}>Start Monitoring</button>
          </div>
        </footer>
      </main>
    </div>
  );
}
