-- D1 replacement for the Redis sliding-window failure counter that used to back
-- incident detection in the Azure hitApi function. One row per failed (non-UP) ping.
CREATE TABLE IF NOT EXISTS failure_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_id TEXT NOT NULL,
  region TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_failure_events_lookup
  ON failure_events (api_id, region, created_at);
