import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ErrorBanner from "../components/ErrorBanner";
import { listIncidents } from "../services/api";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await listIncidents();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const open = items.filter(x => x.status === "OPEN").length;
    const investigating = items.filter(x => x.status === "INVESTIGATING").length;
    const resolved = items.filter(x => x.status === "RESOLVED").length;
    const high = items.filter(x => x.severity === "HIGH").length;
    return { total, open, investigating, resolved, high };
  }, [items]);

  return (
    <Layout title="Dashboard">
      <ErrorBanner message={err} />

      <div className="kpis">
        <div className="kpi"><div className="kpi-label">Total</div><div className="kpi-value">{stats.total}</div></div>
        <div className="kpi"><div className="kpi-label">Open</div><div className="kpi-value">{stats.open}</div></div>
        <div className="kpi"><div className="kpi-label">Investigating</div><div className="kpi-value">{stats.investigating}</div></div>
        <div className="kpi"><div className="kpi-label">Resolved</div><div className="kpi-value">{stats.resolved}</div></div>
        <div className="kpi"><div className="kpi-label">High Severity</div><div className="kpi-value">{stats.high}</div></div>
      </div>

      <div className="grid3">
        <StatusColumn title="OPEN" items={items.filter(x => x.status === "OPEN")} />
        <StatusColumn title="INVESTIGATING" items={items.filter(x => x.status === "INVESTIGATING")} />
        <StatusColumn title="RESOLVED" items={items.filter(x => x.status === "RESOLVED")} />
      </div>
    </Layout>
  );
}

function StatusColumn({ title, items }) {
  return (
    <div className="panel">
      <div className="panel-title">{title} ({items.length})</div>
      <div className="panel-body">
        {items.length === 0 ? (
          <div className="muted">No incidents</div>
        ) : (
          items.map(x => (
            <div key={x.id} className="card">
              <div className="card-title">{x.title}</div>
              <div className="card-meta">
                <span className="tag">{x.category}</span>
                <span className={`tag ${x.severity === "HIGH" ? "tag-danger" : x.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                  {x.severity}
                </span>
              </div>
              <a className="link" href={`/incidents/${x.id}`}>Open</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
