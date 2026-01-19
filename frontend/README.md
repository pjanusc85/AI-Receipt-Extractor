# AI Receipt Extractor - Frontend

Modern React application for uploading receipt images and viewing AI-extracted data. Features drag-and-drop upload, real-time progress tracking, and clean results visualization.

## Features

- 📤 Drag-and-drop file upload with validation
- 🖼️ Multi-format support (JPG, PNG, GIF, WebP)
- ⏳ Real-time extraction progress indicator
- 📊 Clean, organized results display
- 🔄 Comprehensive error handling with retry
- 📱 Responsive design
- 🎨 Modern, polished UI
- ⚡ Fast hot-reload development with Vite

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** useReducer
- **Styling:** CSS
- **API Client:** Fetch API

## Prerequisites

- Node.js v18+ and npm v10+
- Backend service running on http://localhost:3000

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Development Mode
```bash
npm run dev
```

Application starts on http://localhost:5173

### Production Build
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## User Guide

### 1. Landing Page
- Click "Choose file to Upload" or drag and drop an image
- Supported formats: JPG, JPEG, PNG, GIF, WebP
- File type validation occurs before submission

### 2. File Preview
- Review selected file details (name, type, size)
- Click "Cancel" to select a different file
- Click "Submit" to start extraction

### 3. Loading State
- Animated progress bar during AI extraction
- Typical processing time: 2-5 seconds
- Time varies by AI provider and image complexity

### 4. Results Display
View extracted receipt data:
- Receipt image (left side)
- Vendor name and date
- Currency code
- Itemized list with prices (scrollable)
- Tax/GST amount
- Total amount
- "Extract Another Receipt" button to restart

### 5. Error Handling
- Clear error messages if extraction fails
- "Try Again" button to retry same file
- "Upload New File" to start fresh

## Configuration

### API Endpoint

```typescript
// src/services/api.service.ts
const API_BASE_URL = 'http://localhost:3000';
```

To change the backend URL, update this constant.

### Production Deployment

For production, update the API URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.com';
```

Then create `.env.production`:
```env
VITE_API_URL=https://your-backend.com
```

## Project Structure

```
src/
├── components/
│   ├── LandingPage.tsx         # File upload interface
│   ├── FilePreview.tsx         # Selected file preview
│   ├── LoadingState.tsx        # Extraction progress
│   ├── ExtractionResults.tsx   # Results display
│   └── ErrorState.tsx          # Error handling
├── services/
│   └── api.service.ts          # Backend API client
├── types/
│   └── receipt.types.ts        # TypeScript interfaces
├── App.tsx                     # Main app with state management
├── App.css                     # Global styles
└── main.tsx                    # Application entry point
```

## State Management

The application uses React's `useReducer` hook with 5 distinct states:

```typescript
type AppState =
  | { stage: 'landing' }                  // Initial upload screen
  | { stage: 'preview'; file: File }      // File preview
  | { stage: 'loading' }                  // Processing
  | { stage: 'results'; data: Receipt }   // Results display
  | { stage: 'error'; message: string }   // Error handling
```

### State Transitions

```
    landing
       ↓
    preview
       ↓
    loading
       ↓
  results / error
       ↓
    landing
```

## API Integration

### Extract Receipt Endpoint

```typescript
POST http://localhost:3000/receipts/extract
Content-Type: multipart/form-data
Body: FormData with 'receipt' file field
```

### Request Example

```typescript
const formData = new FormData();
formData.append('receipt', file);

const response = await fetch('http://localhost:3000/receipts/extract', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

### Response Interface

```typescript
interface ExtractedReceipt {
  id: string;
  date: string;
  currency: string;
  vendorName: string;
  items: Array<{
    name: string;
    cost: number;
  }>;
  gst: number;
  total: number;
  imageUrl: string;
}
```

## Available Scripts

### `npm run dev`
Starts development server with hot reload (port 5173)

### `npm run build`
Creates optimized production build in `dist/` folder

### `npm run preview`
Previews production build locally

### `npm run lint`
Runs ESLint for code quality checks

## Styling

The application uses vanilla CSS with:
- CSS variables for theming
- Flexbox for layouts
- Animations for smooth transitions
- Responsive breakpoints

### Key Style Files

```css
/* src/App.css */
.landing-page { /* ... */ }
.file-preview { /* ... */ }
.loading-state { /* ... */ }
.extraction-results { /* ... */ }
.error-state { /* ... */ }
```

## Troubleshooting

### Frontend Won't Start

**Port 5173 already in use**
```bash
lsof -ti:5173 | xargs kill -9
```

### Cannot Connect to Backend

**CORS or network error**
- Verify backend is running: `curl http://localhost:3000`
- Check backend CORS configuration
- Ensure backend allows `http://localhost:5173`

### File Upload Fails

**Invalid file type**
- Verify file is JPG, PNG, GIF, or WebP
- Check file is not corrupted
- Recommended size: < 10MB

**500 Internal Server Error**
- Check backend logs for specific error
- Verify backend services are running (database, LocalStack, AI)
- Ensure AI provider has valid API key and credits

### Image Doesn't Display

**Broken image in results**
- Verify LocalStack is running (if using local storage)
- Check backend storage service configuration
- Open `imageUrl` in browser to test accessibility

### Blank Screen

**Application doesn't load**
- Check browser console for errors
- Verify all dependencies: `npm install`
- Clear browser cache
- Verify Node version is v18+

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes reflect immediately without full page reload.

### Type Safety

All receipt data structures are defined in `src/types/receipt.types.ts`:

```typescript
export interface ReceiptItem {
  name: string;
  cost: number;
}

export interface ExtractedReceipt {
  id: string;
  date: string;
  currency: string;
  vendorName: string;
  items: ReceiptItem[];
  gst: number;
  total: number;
  imageUrl: string;
}
```

### Debugging

- **React DevTools:** Inspect component tree and state
- **Console:** Check for errors and network requests
- **Network Tab:** Inspect API calls and responses

### Code Quality

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance Optimization

The application includes:
- Code splitting (automatic with Vite)
- Lazy loading of components
- Optimized bundle size
- Fast refresh during development

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder via Netlify CLI or dashboard
```

### Manual Deployment

```bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
```

## Environment Variables

Create `.env.production` for production builds:

```env
VITE_API_URL=https://your-backend.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit changes (`git commit -m 'Add AmazingFeature'`)
6. Push to branch (`git push origin feature/AmazingFeature`)
7. Open Pull Request

## License

MIT
