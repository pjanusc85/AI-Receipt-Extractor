import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { StorageService } from '../storage/storage.service';
import { ExtractedDataDto } from './dto/extracted-data.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private storageService: StorageService,
  ) {}

  async processReceipt(file: Express.Multer.File) {
    // 1. Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!file || !allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP images are allowed.',
      );
    }

    // 2. Upload image to S3
    let imageUrl: string;
    try {
      imageUrl = await this.storageService.uploadImage(file);
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }

    // 3. Extract data using AI
    let extractedData: any;
    try {
      extractedData = await this.aiService.extractReceiptData(file.buffer, file.mimetype);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to extract receipt data. Please try again.',
      );
    }

    // 4. Validate extracted data
    const dto = plainToClass(ExtractedDataDto, extractedData);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new BadRequestException(
        `Invalid data extracted from receipt: ${errorMessages}`,
      );
    }

    // 5. Save to database
    try {
      const receipt = await this.prisma.receipt.create({
        data: {
          date: new Date(dto.date),
          currency: dto.currency,
          vendorName: dto.vendorName,
          gst: dto.gst,
          total: dto.total,
          imageUrl,
          items: {
            create: dto.items.map((item) => ({
              name: item.name,
              cost: item.cost,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        id: receipt.id,
        date: receipt.date.toISOString(),
        currency: receipt.currency,
        vendorName: receipt.vendorName,
        gst: receipt.gst,
        total: receipt.total,
        imageUrl: receipt.imageUrl,
        items: receipt.items.map((item) => ({
          name: item.name,
          cost: item.cost,
        })),
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException('Failed to save receipt data');
    }
  }
}
