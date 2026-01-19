import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';

@Controller('receipts')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}

  @Post('extract')
  @UseInterceptors(FileInterceptor('receipt'))
  async extractReceipt(@UploadedFile() file: Express.Multer.File) {
    return this.receiptService.processReceipt(file);
  }
}
