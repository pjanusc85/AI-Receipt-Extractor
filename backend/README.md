# AI Receipt Extractor - Backend

NestJS-based backend service for AI-powered receipt data extraction. Supports multiple AI providers (Claude, Gemini, OpenAI) with PostgreSQL storage and S3 image hosting.

## Features

- 🤖 Multiple AI provider support with factory pattern
- 📸 Multi-format image processing (JPG, PNG, GIF, WebP)
- 💾 PostgreSQL database with Prisma ORM
- ☁️ AWS S3 / LocalStack storage integration
- ✅ Comprehensive data validation with class-validator
- 🧪 Full unit test coverage
- 🔄 CORS enabled for frontend communication
- 🚀 Production-ready error handling

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** AWS S3 SDK (LocalStack for local development)
- **AI Providers:**
  - Anthropic Claude SDK
  - Google Generative AI (Gemini)
  - OpenAI SDK
  - Mock service for testing
- **Validation:** class-validator, class-transformer
- **Testing:** Jest

## Prerequisites

- Node.js v18+ and npm v10+
- PostgreSQL (local installation or Docker)
- Docker (for LocalStack S3 emulation)
- API key for at least one AI provider

## Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

## Database Setup

### PostgreSQL Configuration

```bash
# Connect to PostgreSQL
psql postgres

# Create database user with necessary permissions
CREATE USER receipt_user WITH PASSWORD 'receipt123';
ALTER USER receipt_user CREATEDB;

# Create database
CREATE DATABASE receipts OWNER receipt_user;
\q

# Run Prisma migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

## Storage Setup

### LocalStack (Recommended for Development)

```bash
# Start LocalStack with Docker
docker run -d -p 4566:4566 -p 4571:4571 localstack/localstack

# Create S3 bucket
curl -X PUT http://localhost:4566/receipts
```

### AWS S3 (Production)

1. Create an S3 bucket in your AWS account
2. Configure AWS credentials in `.env`
3. Set `USE_LOCALSTACK="false"`

## Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://receipt_user:receipt123@localhost:5432/receipts?schema=public"

# AWS S3 / LocalStack
USE_LOCALSTACK="true"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_S3_BUCKET_NAME="receipts"

# AI Provider (options: mock, claude, gemini, openai)
AI_PROVIDER="claude"

# Anthropic Claude
ANTHROPIC_API_KEY="your-api-key-here"

# Google Gemini (FREE tier)
GEMINI_API_KEY="your-api-key-here"

# OpenAI
OPENAI_API_KEY="your-api-key-here"

# Server
PORT=3000
```

### AI Provider Setup

#### Anthropic Claude
- Get API key: https://console.anthropic.com/settings/keys
- Set `AI_PROVIDER="claude"`
- Model: claude-3-haiku-20240307

#### Google Gemini (FREE)
- Get API key: https://aistudio.google.com/app/apikey
- Set `AI_PROVIDER="gemini"`
- Model: gemini-1.5-flash

#### OpenAI
- Get API key: https://platform.openai.com/api-keys
- Set `AI_PROVIDER="openai"`
- Model: gpt-4o

#### Mock (No API Key)
- Set `AI_PROVIDER="mock"`
- Returns realistic test data

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

Server runs on http://localhost:3000

Test the server:
```bash
curl http://localhost:3000
# Returns: "Hello World!"
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

**Test Coverage:** 7/7 tests passing
- ✅ Service initialization
- ✅ Successful receipt processing
- ✅ File type validation
- ✅ AI response validation
- ✅ AI service failure handling
- ✅ Storage failure handling
- ✅ Database failure handling

## API Documentation

### Extract Receipt Data

**Endpoint:** `POST /receipts/extract`

**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:3000/receipts/extract \
  -F "receipt=@path/to/receipt.jpg"
```

**Success Response (200 OK):**
```json
{
  "id": "uuid",
  "date": "2021-03-26T00:00:00.000Z",
  "currency": "USD",
  "vendorName": "STOP&SHOP",
  "items": [
    {
      "name": "SB BGICE CB 10LB",
      "cost": 2.99
    }
  ],
  "gst": 0.42,
  "total": 17.17,
  "imageUrl": "http://localhost:4566/receipts/receipts/1234567890-receipt.jpg"
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Invalid file type. Only JPG, JPEG, PNG, GIF, and WebP images are allowed.",
  "error": "Bad Request"
}
```

**Error Response (500):**
```json
{
  "statusCode": 500,
  "message": "AI extraction failed",
  "error": "Internal Server Error"
}
```

## Project Structure

```
src/
├── ai/                         # AI service implementations
│   ├── ai.service.ts           # OpenAI GPT-4 Vision
│   ├── ai-claude.service.ts    # Anthropic Claude
│   ├── ai-gemini.service.ts    # Google Gemini
│   ├── ai-mock.service.ts      # Mock for testing
│   └── ai.module.ts            # Factory pattern provider
├── prisma/                     # Database service
│   └── prisma.service.ts
├── receipt/                    # Receipt module
│   ├── dto/
│   │   ├── extracted-data.dto.ts
│   │   └── receipt-item.dto.ts
│   ├── receipt.controller.ts
│   ├── receipt.service.ts
│   ├── receipt.service.spec.ts
│   └── receipt.module.ts
├── storage/                    # S3 storage service
│   └── storage.service.ts
├── app.module.ts
└── main.ts
```

## Architecture

### AI Provider Factory Pattern

The application uses a factory pattern to dynamically select AI providers:

```typescript
// src/ai/ai.module.ts
{
  provide: AIService,
  useFactory: (configService: ConfigService) => {
    const provider = configService.get('AI_PROVIDER');
    switch (provider) {
      case 'claude': return new AIClaudeService(configService);
      case 'gemini': return new AIGeminiService(configService);
      case 'openai': return new AIService(configService);
      default: return new AIMockService();
    }
  }
}
```

### Data Validation Pipeline

```
File Upload
    ↓
File Type Validation (JPG, PNG, GIF, WebP)
    ↓
Storage Upload (S3/LocalStack)
    ↓
AI Extraction (Claude/Gemini/OpenAI)
    ↓
Response Validation (class-validator)
    ↓
Database Storage (Prisma + PostgreSQL)
    ↓
Return Results (JSON)
```

## Troubleshooting

### Database Issues

**Permission denied to create database**
```bash
psql postgres
ALTER USER receipt_user CREATEDB;
```

**Database does not exist**
```bash
psql postgres
CREATE DATABASE receipts OWNER receipt_user;
```

### LocalStack Issues

**Cannot connect to LocalStack**
```bash
# Check Docker
docker ps

# Restart LocalStack
docker restart <container-id>
```

**Bucket does not exist**
```bash
curl -X PUT http://localhost:4566/receipts
```

### AI Provider Issues

**Claude: 404 model not found**
- Verify API credits at https://console.anthropic.com/
- Ensure using API key (not Claude Code subscription)
- Check model name: `claude-3-haiku-20240307`

**OpenAI: 429 quota exceeded**
- Add billing credits
- Switch to Gemini (free) or Mock provider

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Development Tips

### Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Seed database (if seed script exists)
npx prisma db seed
```

### Debugging

```bash
# Start in debug mode
npm run start:debug

# Then attach your debugger to port 9229
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

MIT
