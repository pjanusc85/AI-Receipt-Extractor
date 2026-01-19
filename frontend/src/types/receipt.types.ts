export interface ReceiptItem {
  name: string;
  cost: number;
}

export interface ExtractedReceipt {
  id: string;
  date: string;
  currency: string;
  vendorName: string;
  items: ReceiptItem[];
  gst: number;
  total: number;
  imageUrl: string;
}

export type AppState =
  | { stage: 'landing' }
  | { stage: 'preview'; file: File }
  | { stage: 'loading' }
  | { stage: 'results'; data: ExtractedReceipt }
  | { stage: 'error'; message: string };

export type AppAction =
  | { type: 'SELECT_FILE'; file: File }
  | { type: 'CANCEL_FILE' }
  | { type: 'START_EXTRACTION' }
  | { type: 'EXTRACTION_SUCCESS'; data: ExtractedReceipt }
  | { type: 'EXTRACTION_ERROR'; message: string }
  | { type: 'RESET' };
