import { useState } from "react";
import { useRouter } from "next/router"; // Add this for navigation
import Link from "next/link"; // Add this for navigation
import Layout from "../components/Layout";
import ErrorBanner from "../components/ErrorBanner";
import { api } from "../services/api"; // Change to use api object

export default function BulkUpload() {
  const router = useRouter(); // Add router for navigation
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  // Allowed values for validation
  const allowedCategories = ['IT', 'SAFETY', 'FACILITIES', 'OTHER'];
  const allowedSeverities = ['LOW', 'MEDIUM', 'HIGH'];
  const allowedStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED'];

  async function onUpload() {
    if (!file) {
      setErr("Please select a CSV file.");
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setErr("Please select a valid CSV file.");
      return;
    }

    try {
      setUploading(true);
      setErr("");
      setResult(null);
      
      // Change to api.bulkUpload()
      const data = await api.bulkUpload(file);
      setResult(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  // Function to download sample CSV
  const downloadSampleCSV = () => {
    const headers = ['title', 'description', 'category', 'severity', 'status', 'reportedBy', 'location'];
    const sampleRows = [
      ['Network Outage', 'Main office network is down', 'IT', 'HIGH', 'OPEN', 'John Doe', 'Building A'],
      ['Safety Hazard', 'Wet floor in corridor', 'SAFETY', 'MEDIUM', 'OPEN', 'Jane Smith', 'Floor 2'],
      ['Broken Light', 'Light fixture broken in bathroom', 'FACILITIES', 'LOW', 'INVESTIGATING', 'Bob Wilson', 'Floor 1']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_incidents.csv';
    a.click();
  };

  return (
    <Layout title="Bulk Upload">
      <ErrorBanner message={err} />

      {/* Navigation */}
      <div style={{ marginBottom: "1rem" }}>
        <Link 
          href="/incidents" 
          style={{
            color: "#0070f3",
            textDecoration: "none",
            marginRight: "1rem"
          }}
        >
          ← Back to Incidents
        </Link>
      </div>

      <div className="panel">
        <div className="panel-title">Bulk Upload Incidents</div>
        <div className="panel-body">
          {/* Instructions */}
          <div className="muted" style={{ marginBottom: "1rem" }}>
            <strong>Required headers:</strong> <span className="mono">title, description, category, severity</span>
            <br />
            <strong>Optional headers:</strong> <span className="mono">status, reportedBy, location</span>
          </div>

          {/* Allowed values */}
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "1rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            <div><strong>Allowed Categories:</strong> {allowedCategories.join(', ')}</div>
            <div><strong>Allowed Severities:</strong> {allowedSeverities.join(', ')}</div>
            <div><strong>Allowed Statuses:</strong> {allowedStatuses.join(', ')}</div>
          </div>

          {/* Sample CSV button */}
          <div style={{ marginBottom: "1rem" }}>
            <button 
              onClick={downloadSampleCSV}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Download Sample CSV
            </button>
          </div>

          {/* File upload */}
          <div className="row" style={{ gap: "1rem", alignItems: "center" }}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null); // Clear previous results
                setErr(""); // Clear errors
              }}
              style={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                flex: 1
              }}
            />
            <button 
              className="btn" 
              onClick={onUpload} 
              disabled={!file || uploading}
              style={{
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: !file || uploading ? "not-allowed" : "pointer",
                opacity: !file || uploading ? 0.7 : 1
              }}
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>

          {/* Show selected file name */}
          {file && (
            <div style={{ marginTop: "0.5rem", color: "#666", fontSize: "0.9rem" }}>
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}

          {/* Upload result */}
          {result && (
            <div className="section" style={{ marginTop: "2rem" }}>
              <div className="section-title">Upload Results</div>
              
              {/* Summary */}
              <div className="box" style={{ 
                backgroundColor: "#f8f9fa",
                padding: "1rem",
                borderRadius: "4px",
                marginBottom: "1rem"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0070f3" }}>
                      {result.totalRows || 0}
                    </div>
                    <div style={{ color: "#666" }}>Total Rows</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>
                      {result.created || 0}
                    </div>
                    <div style={{ color: "#666" }}>Created</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc3545" }}>
                      {result.skipped || 0}
                    </div>
                    <div style={{ color: "#666" }}>Skipped</div>
                  </div>
                </div>
              </div>

              {/* Show error details if any */}
              {result.details?.invalidRows && result.details.invalidRows.length > 0 && (
                <>
                  <div className="section-title" style={{ marginTop: "1rem" }}>
                    Error Details ({result.details.invalidRows.length} rows skipped)
                  </div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Row #</th>
                          <th>Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.details.invalidRows.map((error, idx) => (
                          <tr key={idx}>
                            <td className="mono" style={{ fontWeight: "bold" }}>{error.row}</td>
                            <td>
                              {Array.isArray(error.errors) ? (
                                <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                                  {error.errors.map((msg, i) => (
                                    <li key={i} style={{ color: "#dc3545" }}>{msg}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span style={{ color: "#dc3545" }}>{error.errors || "Unknown error"}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Success message if no errors */}
              {result.created > 0 && result.skipped === 0 && (
                <div style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "1rem",
                  borderRadius: "4px",
                  marginTop: "1rem"
                }}>
                  ✓ Successfully created {result.created} incident(s)!
                </div>
              )}

              {/* Navigation after upload */}
              {result.created > 0 && (
                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                  <Link 
                    href="/incidents"
                    style={{
                      backgroundColor: "#0070f3",
                      color: "white",
                      textDecoration: "none",
                      padding: "0.75rem 1.5rem",
                      borderRadius: "4px",
                      display: "inline-block"
                    }}
                  >
                    View All Incidents
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}