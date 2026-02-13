import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { createIncident } from "../../services/api";

const CATEGORIES = ["IT", "SAFETY", "FACILITIES", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];

export default function CreateIncident() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [severity, setSeverity] = useState("LOW");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const validation = useMemo(() => {
    const errors = [];
    if (title.trim().length < 5) errors.push("Title must be at least 5 characters");
    if (description.trim().length < 10) errors.push("Description must be at least 10 characters");
    if (!CATEGORIES.includes(category)) errors.push("Invalid category");
    if (!SEVERITIES.includes(severity)) errors.push("Invalid severity");
    return { ok: errors.length === 0, errors };
  }, [title, description, category, severity]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!validation.ok) return;

    try {
      setSaving(true);
      setErr("");
      setSuccess("");
      
      const created = await createIncident({
        title: title.trim(),
        description: description.trim(),
        category,
        severity
      });
      
      setSuccess("Incident created successfully!");
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        router.push(`/incidents/${created.id}`);
      }, 1500);
      
    } catch (e2) {
      setErr(e2.details ? `${e2.message}: ${e2.details.join(", ")}` : e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Create Incident">
      <ErrorBanner message={err} />
      
      {success && (
        <div className="success-banner">
          ✓ {success}
        </div>
      )}

      {!validation.ok && (
        <div className="warn-box">
          <div className="warn-title">⚠️ Fix these issues before saving:</div>
          <ul>
            {validation.errors.map((x, idx) => <li key={idx}>{x}</li>)}
          </ul>
        </div>
      )}

      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <label className="label">
            Title <span className="required">*</span>
          </label>
          <input 
            className="input" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter incident title"
            disabled={saving}
          />
          <small className="hint">Minimum 5 characters</small>
        </div>

        <div className="form-group">
          <label className="label">
            Description <span className="required">*</span>
          </label>
          <textarea 
            className="textarea" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Enter detailed description"
            rows="5"
            disabled={saving}
          />
          <small className="hint">Minimum 10 characters</small>
        </div>

        <div className="grid2">
          <div className="form-group">
            <label className="label">
              Category <span className="required">*</span>
            </label>
            <select 
              className="select" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
            >
              {CATEGORIES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">
              Severity <span className="required">*</span>
            </label>
            <select 
              className="select" 
              value={severity} 
              onChange={(e) => setSeverity(e.target.value)}
              disabled={saving}
            >
              {SEVERITIES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={!validation.ok || saving}
          >
            {saving ? "Creating..." : "Create Incident"}
          </button>
          <button 
            className="btn btn-secondary" 
            type="button" 
            onClick={() => router.push("/incidents")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>

      <style jsx>{`
        .form {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #333;
        }
        .required {
          color: #e74c3c;
          margin-left: 0.25rem;
        }
        .input, .textarea, .select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        .input:focus, .textarea:focus, .select:focus {
          outline: none;
          border-color: #0070f3;
        }
        .input:disabled, .textarea:disabled, .select:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
        .hint {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #666;
        }
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary {
          background: #0070f3;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #0051b3;
        }
        .btn-secondary {
          background: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;
        }
        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .warn-box {
          background: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .warn-title {
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .warn-box ul {
          margin: 0;
          padding-left: 1.5rem;
        }
        .success-banner {
          background: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          text-align: center;
          font-weight: bold;
        }
      `}</style>
    </Layout>
  );
}