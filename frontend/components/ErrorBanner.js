export default function ErrorBanner({ message }) {
  if (!message) return null;
  
  return (
    <div className="error-banner">
      <span className="error-icon">⚠️</span>
      <span className="error-message">{message}</span>
      
      <style jsx>{`
        .error-banner {
          background: #fee;
          border: 1px solid #fcc;
          color: #c00;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .error-icon {
          font-size: 1.2rem;
        }
        .error-message {
          flex: 1;
        }
      `}</style>
    </div>
  );
}