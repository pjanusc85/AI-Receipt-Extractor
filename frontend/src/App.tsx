import { useReducer } from 'react';
import { AppState, AppAction } from './types/receipt.types';
import { extractReceipt } from './services/api.service';

// Components
import LandingPage from './components/LandingPage';
import FilePreview from './components/FilePreview';
import LoadingState from './components/LoadingState';
import ExtractionResults from './components/ExtractionResults';
import ErrorState from './components/ErrorState';

// State reducer
const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SELECT_FILE':
      return { stage: 'preview', file: action.file };
    case 'CANCEL_FILE':
    case 'RESET':
      return { stage: 'landing' };
    case 'START_EXTRACTION':
      return { stage: 'loading' };
    case 'EXTRACTION_SUCCESS':
      return { stage: 'results', data: action.data };
    case 'EXTRACTION_ERROR':
      return { stage: 'error', message: action.message };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, { stage: 'landing' });

  const handleFileSelect = (file: File) => {
    dispatch({ type: 'SELECT_FILE', file });
  };

  const handleCancel = () => {
    dispatch({ type: 'CANCEL_FILE' });
  };

  const handleSubmit = async () => {
    if (state.stage !== 'preview') return;

    dispatch({ type: 'START_EXTRACTION' });

    try {
      const data = await extractReceipt(state.file);
      dispatch({ type: 'EXTRACTION_SUCCESS', data });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Failed to extract receipt data. Please try again.';
      dispatch({ type: 'EXTRACTION_ERROR', message });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  // Render appropriate component based on state
  switch (state.stage) {
    case 'landing':
      return <LandingPage onFileSelect={handleFileSelect} />;

    case 'preview':
      return (
        <FilePreview
          file={state.file}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      );

    case 'loading':
      return <LoadingState />;

    case 'results':
      return (
        <ExtractionResults
          data={state.data}
          onReset={handleReset}
        />
      );

    case 'error':
      return (
        <ErrorState
          message={state.message}
          onRetry={handleReset}
        />
      );

    default:
      return <LandingPage onFileSelect={handleFileSelect} />;
  }
}

export default App;
