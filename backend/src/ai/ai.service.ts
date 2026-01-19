import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ExtractedData {
  date: string;
  currency: string;
  vendorName: string;
  items: Array<{
    name: string;
    cost: number;
  }>;
  gst: number;
  total: number;
}

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async extractReceiptData(imageBuffer: Buffer, mimeType?: string): Promise<ExtractedData> {
    try {
      const base64Image = imageBuffer.toString('base64');
      const mediaType = mimeType || 'image/jpeg';

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract the receipt information and return it in JSON format with the following structure:
{
  "date": "ISO 8601 date string",
  "currency": "3-letter currency code (USD, CAD, SGD, etc.)",
  "vendorName": "Name of the vendor/merchant",
  "items": [
    {
      "name": "Item name",
      "cost": 0.00
    }
  ],
  "gst": 0.00,
  "total": 0.00
}

Important:
- Extract all items from the receipt
- GST/tax should be a single number for the entire receipt
- All monetary values should be numbers (not strings)
- Date should be in ISO 8601 format
- If you cannot determine a field with certainty, make your best guess based on the receipt`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI model');
      }

      const parsedData = JSON.parse(content);
      return parsedData;
    } catch (error) {
      console.error('AI extraction error:', error);
      throw new InternalServerErrorException('AI extraction failed');
    }
  }
}
