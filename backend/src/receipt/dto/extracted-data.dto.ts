import {
  IsString,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReceiptItemDto } from './receipt-item.dto';

export class ExtractedDataDto {
  @IsDateString()
  date: string;

  @IsString()
  @Length(3, 3, { message: 'Currency must be a 3-character code' })
  currency: string;

  @IsString()
  vendorName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @IsNumber()
  @Min(0)
  gst: number;

  @IsNumber()
  @Min(0)
  total: number;
}
