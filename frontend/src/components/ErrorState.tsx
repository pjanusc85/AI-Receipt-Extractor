interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <h1 className="title">Receipt Extractor</h1>

      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Extraction Failed</h2>
        <p className="error-message">{message}</p>

        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}
