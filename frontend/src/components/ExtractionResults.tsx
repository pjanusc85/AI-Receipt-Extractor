import { ExtractedReceipt } from '../types/receipt.types';

interface ExtractionResultsProps {
  data: ExtractedReceipt;
  onReset: () => void;
}

export default function ExtractionResults({ data, onReset }: ExtractionResultsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="extraction-results">
      <h1 className="title">Receipt Extractor</h1>

      <div className="results-container">
        <div className="results-left">
          <div className="receipt-image-container">
            <img src={data.imageUrl} alt="Receipt" className="receipt-image" />
          </div>
        </div>

        <div className="results-right">
          <div className="receipt-data">
            <h2 className="vendor-name">{data.vendorName}</h2>
            <p className="receipt-date">{formatDate(data.date)}</p>
            <p className="receipt-currency">{data.currency}</p>

            <hr className="divider" />

            <div className="items-section">
              <div className="items-list">
                {data.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-cost">
                      {formatCurrency(item.cost, data.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="divider" />

            <div className="totals-section">
              <div className="total-row">
                <span className="total-label">GST/Tax</span>
                <span className="total-value">
                  {formatCurrency(data.gst, data.currency)}
                </span>
              </div>

              <div className="total-row final-total">
                <span className="total-label">Total</span>
                <span className="total-value">
                  {formatCurrency(data.total, data.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="reset-button" onClick={onReset}>
        Extract Another Receipt
      </button>
    </div>
  );
}
