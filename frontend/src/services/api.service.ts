import { ExtractedReceipt } from '../types/receipt.types';

const API_BASE_URL = 'http://localhost:3000';

export const extractReceipt = async (file: File): Promise<ExtractedReceipt> => {
  const formData = new FormData();
  formData.append('receipt', file);

  const response = await fetch(`${API_BASE_URL}/receipts/extract`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'Failed to extract receipt data');
  }

  const data = await response.json();
  return data;
};
