import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ title, children }) {
  const router = useRouter();
  
  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <Link href="/dashboard">IncidentTracker</Link>
        </div>

        <nav className="nav">
          <Link 
            href="/dashboard" 
            className={isActive("/dashboard") ? "active" : ""}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/incidents" 
            className={isActive("/incidents") ? "active" : ""}
          >
            📋 All Incidents
          </Link>
          <Link 
            href="/incidents/create" 
            className={isActive("/incidents/create") ? "active" : ""}
          >
            ➕ Create Incident
          </Link>
          <Link 
            href="/bulk-upload" 
            className={isActive("/bulk-upload") ? "active" : ""}
          >
            📤 Bulk Upload CSV
          </Link>
        </nav>
      </aside>

      <main className="main">
        <div className="container">
          <h1 className="pageTitle">{title}</h1>
          {children}
        </div>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          background: #2c3e50;
          color: white;
          padding: 2rem 0;
        }
        .brand {
          font-size: 1.5rem;
          font-weight: bold;
          padding: 0 1.5rem;
          margin-bottom: 2rem;
        }
        .brand a {
          color: white;
          text-decoration: none;
        }
        .nav {
          display: flex;
          flex-direction: column;
        }
        .nav a {
          color: #ecf0f1;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          transition: all 0.3s;
          border-left: 3px solid transparent;
        }
        .nav a:hover {
          background: #34495e;
          border-left-color: #3498db;
        }
        .nav a.active {
          background: #34495e;
          border-left-color: #3498db;
          font-weight: bold;
        }
        .main {
          flex: 1;
          background: #f5f5f5;
          padding: 2rem;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .pageTitle {
          color: #333;
          margin-bottom: 2rem;
          font-size: 2rem;
        }
      `}</style>
    </div>
  );
}