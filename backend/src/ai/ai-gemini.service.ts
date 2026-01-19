import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedData } from './ai.service';

@Injectable()
export class AIGeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractReceiptData(imageBuffer: Buffer, mimeType?: string): Promise<ExtractedData> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Extract the receipt information and return it in JSON format with the following structure:
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
- If you cannot determine a field with certainty, make your best guess based on the receipt
- Return ONLY the JSON object, no other text`;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (Gemini sometimes wraps it in markdown)
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsedData = JSON.parse(jsonText);
      return parsedData;
    } catch (error) {
      console.error('Gemini extraction error:', error);
      throw new InternalServerErrorException('AI extraction failed');
    }
  }
}
