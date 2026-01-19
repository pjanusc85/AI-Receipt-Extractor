import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { StorageService } from '../storage/storage.service';

describe('ReceiptService', () => {
  let service: ReceiptService;
  let prismaService: PrismaService;
  let aiService: AIService;
  let storageService: StorageService;

  const mockFile: Express.Multer.File = {
    fieldname: 'receipt',
    originalname: 'test-receipt.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake image'),
    size: 1024,
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  const mockExtractedData = {
    date: '2024-01-15T10:00:00.000Z',
    currency: 'CAD',
    vendorName: 'Test Store',
    items: [
      { name: 'Item 1', cost: 10.99 },
      { name: 'Item 2', cost: 5.49 },
    ],
    gst: 1.64,
    total: 18.12,
  };

  const mockReceipt = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    date: new Date('2024-01-15T10:00:00.000Z'),
    currency: 'CAD',
    vendorName: 'Test Store',
    gst: 1.64,
    total: 18.12,
    imageUrl: 'https://s3.amazonaws.com/bucket/receipts/test.jpg',
    items: [
      { id: '1', name: 'Item 1', cost: 10.99, receiptId: '123' },
      { id: '2', name: 'Item 2', cost: 5.49, receiptId: '123' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptService,
        {
          provide: PrismaService,
          useValue: {
            receipt: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: AIService,
          useValue: {
            extractReceiptData: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReceiptService>(ReceiptService);
    prismaService = module.get<PrismaService>(PrismaService);
    aiService = module.get<AIService>(AIService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processReceipt', () => {
    // Test 1: Successful extraction from valid image
    it('should successfully process a valid receipt image', async () => {
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue(mockReceipt.imageUrl);
      jest.spyOn(aiService, 'extractReceiptData').mockResolvedValue(mockExtractedData);
      jest.spyOn(prismaService.receipt, 'create').mockResolvedValue(mockReceipt);

      const result = await service.processReceipt(mockFile);

      expect(storageService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(aiService.extractReceiptData).toHaveBeenCalledWith(mockFile.buffer, mockFile.mimetype);
      expect(prismaService.receipt.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockReceipt.id,
        date: mockReceipt.date.toISOString(),
        currency: mockReceipt.currency,
        vendorName: mockReceipt.vendorName,
        gst: mockReceipt.gst,
        total: mockReceipt.total,
        imageUrl: mockReceipt.imageUrl,
        items: [
          { name: 'Item 1', cost: 10.99 },
          { name: 'Item 2', cost: 5.49 },
        ],
      });
    });

    // Test 2: Incorrect file type
    it('should throw BadRequestException for incorrect file type', async () => {
      const pdfFile = {
        ...mockFile,
        mimetype: 'application/pdf',
        originalname: 'test.pdf',
      };

      await expect(service.processReceipt(pdfFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.processReceipt(pdfFile)).rejects.toThrow(
        'Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP images are allowed.',
      );
    });

    // Test 3: Invalid response from AI model
    it('should throw BadRequestException for invalid AI response', async () => {
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue(mockReceipt.imageUrl);

      // Mock invalid response (missing required fields)
      const invalidData = {
        date: '2024-01-15',
        currency: 'INVALID_CURRENCY', // Invalid: too long
        vendorName: 'Test Store',
        items: [], // Invalid: empty items
        gst: -1, // Invalid: negative number
        total: 18.12,
      };

      jest.spyOn(aiService, 'extractReceiptData').mockResolvedValue(invalidData);

      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    // Test 4: 500 status response (InternalServerErrorException)
    it('should throw InternalServerErrorException when AI service fails', async () => {
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue(mockReceipt.imageUrl);
      jest.spyOn(aiService, 'extractReceiptData').mockRejectedValue(
        new Error('AI service unavailable'),
      );

      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        'Failed to extract receipt data. Please try again.',
      );
    });

    // Additional test: Storage upload failure
    it('should throw InternalServerErrorException when storage upload fails', async () => {
      jest.spyOn(storageService, 'uploadImage').mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        'Failed to upload image',
      );
    });

    // Additional test: Database save failure
    it('should throw InternalServerErrorException when database save fails', async () => {
      jest.spyOn(storageService, 'uploadImage').mockResolvedValue(mockReceipt.imageUrl);
      jest.spyOn(aiService, 'extractReceiptData').mockResolvedValue(mockExtractedData);
      jest.spyOn(prismaService.receipt, 'create').mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.processReceipt(mockFile)).rejects.toThrow(
        'Failed to save receipt data',
      );
    });
  });
});
