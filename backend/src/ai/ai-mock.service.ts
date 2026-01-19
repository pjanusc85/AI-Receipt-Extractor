import { Injectable } from '@nestjs/common';
import { ExtractedData } from './ai.service';

@Injectable()
export class AIMockService {
  async extractReceiptData(imageBuffer: Buffer, mimeType?: string): Promise<ExtractedData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock receipt data
    const mockData: ExtractedData = {
      date: new Date().toISOString(),
      currency: 'USD',
      vendorName: 'Sample Market',
      items: [
        { name: 'Fresh Vegetables', cost: 12.99 },
        { name: 'Organic Milk', cost: 5.49 },
        { name: 'Whole Grain Bread', cost: 3.99 },
        { name: 'Free Range Eggs', cost: 6.99 },
        { name: 'Coffee Beans', cost: 14.99 },
      ],
      gst: 4.45,
      total: 48.90,
    };

    return mockData;
  }
}
