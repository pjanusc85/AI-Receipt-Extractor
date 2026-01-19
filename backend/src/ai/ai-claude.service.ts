import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ExtractedData } from './ai.service';

@Injectable()
export class AIClaudeService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async extractReceiptData(imageBuffer: Buffer, mimeType?: string): Promise<ExtractedData> {
    try {
      const base64Image = imageBuffer.toString('base64');

      // Map common MIME types to Claude-supported types
      const mediaType = mimeType || 'image/jpeg';

      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: base64Image,
                },
              },
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
- If you cannot determine a field with certainty, make your best guess based on the receipt
- Return ONLY the JSON object, no other text`,
              },
            ],
          },
        ],
      });

      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      let jsonText = textContent.text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsedData = JSON.parse(jsonText);
      return parsedData;
    } catch (error) {
      console.error('Claude extraction error:', error);
      throw new InternalServerErrorException('AI extraction failed');
    }
  }
}
