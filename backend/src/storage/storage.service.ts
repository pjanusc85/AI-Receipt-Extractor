import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private isLocalStack: boolean;

  constructor(private configService: ConfigService) {
    this.isLocalStack = this.configService.get('USE_LOCALSTACK') === 'true';

    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || 'test',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || 'test',
      },
      ...(this.isLocalStack && {
        endpoint: 'http://localhost:4566',
        forcePathStyle: true,
      }),
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || 'receipts';
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const key = `receipts/${Date.now()}-${file.originalname}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Return the public URL
      if (this.isLocalStack) {
        return `http://localhost:4566/${this.bucketName}/${key}`;
      }
      return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image to storage');
    }
  }
}
