interface FilePreviewProps {
  file: File;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function FilePreview({ file, onCancel, onSubmit }: FilePreviewProps) {
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="file-preview">
      <h1 className="title">Receipt Extractor</h1>

      <div className="file-card">
        <button className="cancel-icon" onClick={onCancel}>✕</button>

        <div className="file-icon">📄</div>

        <div className="file-info">
          <p className="file-name">{file.name}</p>
          <p className="file-meta">
            <span className="file-extension">{getFileExtension(file.name)}</span>
            {' • '}
            <span className="file-size">{getFileSize(file.size)}</span>
          </p>
          <p className="file-uploader">Uploaded by User</p>
          <p className="file-date">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <button className="submit-button" onClick={onSubmit}>
        Extract Receipts Contents
      </button>
    </div>
  );
}
