export default function LoadingState() {
  return (
    <div className="loading-state">
      <h1 className="title">Receipt Extractor</h1>

      <div className="loading-content">
        <p className="loading-text">Extracting receipt contents...</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  );
}
