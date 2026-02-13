import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link"; // Add this for better navigation
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { api } from "../../services/api"; // Change to use api object

const STATUS_FLOW = {
  OPEN: ["INVESTIGATING"],
  INVESTIGATING: ["RESOLVED"],
  RESOLVED: []
};

// Status color mapping
const STATUS_COLORS = {
  OPEN: "#f39c12",
  INVESTIGATING: "#3498db",
  RESOLVED: "#27ae60"
};

// Severity color mapping
const SEVERITY_COLORS = {
  LOW: "#27ae60",
  MEDIUM: "#f39c12",
  HIGH: "#e74c3c"
};

export default function IncidentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(""); // Add success state

  const [nextStatus, setNextStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // Safe date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString.slice(0, 19).replace("T", " ") || "Invalid date";
    }
  };

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      setErr("");
      setSuccess(""); // Clear success message
      const data = await api.getIncident(id); // Change to api.getIncident()
      setItem(data);

      const allowed = STATUS_FLOW[data.status] || [];
      setNextStatus(allowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allowedNext = useMemo(() => {
    if (!item) return [];
    return STATUS_FLOW[item.status] || [];
  }, [item]);

  async function onUpdateStatus() {
    if (!item || !nextStatus) return;
    try {
      setUpdating(true);
      setErr("");
      setSuccess(""); // Clear previous success
      
      const updated = await api.updateStatus(item.id, nextStatus); // Change to api.updateStatus()
      
      setItem(updated);
      const newAllowed = STATUS_FLOW[updated.status] || [];
      setNextStatus(newAllowed[0] || "");
      
      setSuccess(`Status updated to ${nextStatus} successfully!`); // Show success message
    } catch (e) {
      setErr(e.message);
    } finally {
      setUpdating(false);
    }
  }

  // Get status style
  const getStatusStyle = (status) => {
    return {
      backgroundColor: STATUS_COLORS[status] || "#95a5a6",
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      fontWeight: "bold"
    };
  };

  // Get severity style
  const getSeverityStyle = (severity) => {
    return {
      backgroundColor: SEVERITY_COLORS[severity] || "#95a5a6",
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "4px",
      fontWeight: "bold"
    };
  };

  return (
    <Layout title="Incident Details">
      <ErrorBanner message={err} />
      
      {/* Add success message banner */}
      {success && (
        <div style={{ 
          backgroundColor: "#d4edda", 
          color: "#155724", 
          padding: "1rem", 
          borderRadius: "4px",
          marginBottom: "1rem",
          border: "1px solid #c3e6cb"
        }}>
          {success}
        </div>
      )}

      {loading && <div className="muted">Loading...</div>}

      {!loading && item && (
        <div className="panel">
          <div className="panel-title">{item.title}</div>
          <div className="panel-body">
            <div className="meta">
              <div><strong>ID:</strong> <span className="mono">{item.id}</span></div>
              <div><strong>Category:</strong> <span className="tag">{item.category}</span></div>
              <div><strong>Severity:</strong> <span style={getSeverityStyle(item.severity)}>{item.severity}</span></div>
              <div><strong>Status:</strong> <span style={getStatusStyle(item.status)}>{item.status}</span></div>
              <div><strong>Reported:</strong> <span className="mono">{formatDate(item.reportedAt)}</span></div>
            </div>

            <div className="section">
              <div className="section-title">Description</div>
              <div className="box">{item.description}</div>
            </div>

            <div className="section">
              <div className="section-title">Update Status</div>

              {allowedNext.length === 0 ? (
                <div className="muted">No further transitions available. This incident is resolved.</div>
              ) : (
                <div className="row" style={{ gap: "1rem", alignItems: "center" }}>
                  <select 
                    className="select" 
                    value={nextStatus} 
                    onChange={(e) => setNextStatus(e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    {allowedNext.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button 
                    className="btn" 
                    onClick={onUpdateStatus} 
                    disabled={!nextStatus || updating}
                    style={{
                      backgroundColor: "#0070f3",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1
                    }}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              )}
            </div>

            <div className="row" style={{ marginTop: "2rem", gap: "1rem" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => router.push("/incidents")}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                ← Back to list
              </button>
              
              <Link 
                href="/incidents/create" 
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  display: "inline-block"
                }}
              >
                Report New Incident
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && !item && !err && (
        <div className="muted">No incident selected.</div>
      )}
    </Layout>
  );
}