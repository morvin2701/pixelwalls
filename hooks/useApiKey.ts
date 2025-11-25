/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useCallback, useState } from 'react';

interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

export const useApiKey = () => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    // Check if we're running in AI Studio environment
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    
    // If running locally, bypass AI Studio validation and rely on environment variable
    if (!aistudio) {
      // Check if API key is set in environment variables
      if (process.env.GEMINI_API_KEY) {
        return true;
      }
      setShowApiKeyDialog(true);
      return false;
    }
    
    // If running in AI Studio, use their validation
    if (aistudio) {
      try {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setShowApiKeyDialog(true);
          return false;
        }
      } catch (error) {
        console.warn('API Key check failed', error);
        setShowApiKeyDialog(true);
        return false;
      }
    }
    return true;
  }, []);

  const handleApiKeyDialogContinue = useCallback(async () => {
    setShowApiKeyDialog(false);
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    if (aistudio) {
      await aistudio.openSelectKey();
    }
  }, []);

  return {
    showApiKeyDialog,
    setShowApiKeyDialog,
    validateApiKey,
    handleApiKeyDialogContinue,
  };
};
