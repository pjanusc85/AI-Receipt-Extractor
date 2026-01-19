import { IsString, IsNumber, Min } from 'class-validator';

export class ReceiptItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  cost: number;
}
