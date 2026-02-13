import { useEffect, useState } from "react";
import Link from "next/link"; // Add this import
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { api } from "../../services/api"; // Change this import

export default function IncidentsList() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state

  async function load() {
    try {
      setErr("");
      setLoading(true); // Set loading true
      const data = await api.getIncidents(); // Change to api.getIncidents()
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
      setItems([]);
    } finally {
      setLoading(false); // Set loading false
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString.slice(0, 19).replace("T", " ") || "Invalid date";
    }
  };

  // Helper function to get severity class
  const getSeverityClass = (severity) => {
    switch(severity) {
      case "HIGH": return "tag-danger";
      case "MEDIUM": return "tag-warn";
      default: return "";
    }
  };

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch(status) {
      case "OPEN": return "tag-open";
      case "INVESTIGATING": return "tag-investigating";
      case "RESOLVED": return "tag-resolved";
      default: return "";
    }
  };

  if (loading) {
    return (
      <Layout title="Incidents">
        <div className="loading">Loading incidents...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Incidents">
      <ErrorBanner message={err} />

      <div className="row" style={{ marginBottom: "1rem" }}>
        <button className="btn" onClick={load}>Refresh</button>
        <Link href="/incidents/create" className="btn btn-primary" style={{ marginLeft: "1rem" }}>
          Report New Incident
        </Link>
        <Link href="/bulk-upload" className="btn" style={{ marginLeft: "1rem" }}>
          Bulk Upload CSV
        </Link>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" className="muted">No incidents found</td></tr>
            ) : (
              items.map(i => (
                <tr key={i.id}>
                  <td className="mono">{i.id?.slice ? i.id.slice(0, 8) : i.id}</td>
                  <td>{i.title}</td>
                  <td><span className="tag">{i.category}</span></td>
                  <td>
                    <span className={`tag ${getSeverityClass(i.severity)}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${getStatusClass(i.status)}`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="mono">{formatDate(i.reportedAt)}</td>
                  <td>
                    <Link href={`/incidents/${i.id}`} className="link">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add these styles to match the lab requirements */}
      <style jsx>{`
        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        .btn-primary {
          background: #0070f3;
          color: white;
          border: none;
        }
        .btn-primary:hover {
          background: #0051b3;
        }
        .tag-open {
          background: #f39c12;
          color: white;
        }
        .tag-investigating {
          background: #3498db;
          color: white;
        }
        .tag-resolved {
          background: #27ae60;
          color: white;
        }
        .tag-danger {
          background: #e74c3c;
          color: white;
        }
        .tag-warn {
          background: #f39c12;
          color: white;
        }
      `}</style>
    </Layout>
  );
}