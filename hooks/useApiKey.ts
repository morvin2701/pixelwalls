/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useCallback, useState } from 'react';

interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

export const useApiKey = (storedApiKey?: string | null) => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    // Check if we're running in AI Studio environment
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    
    // If running locally, check for stored API key first, then environment variable
    if (!aistudio) {
      // Check if API key is provided via props (from login)
      if (storedApiKey) {
        return true;
      }
      // Check if API key is set in environment variables
      if (process.env.GEMINI_API_KEY) {
        return true;
      }
      // Don't automatically show dialog - return false to indicate no key
      return false;
    }
    
    // If running in AI Studio, use their validation
    if (aistudio) {
      try {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // Don't automatically show dialog - return false to indicate no key
          return false;
        }
      } catch (error) {
        console.warn('API Key check failed', error);
        // Don't automatically show dialog - return false to indicate no key
        return false;
      }
    }
    return true;
  }, [storedApiKey]);

  const handleApiKeyDialogContinue = useCallback(async () => {
    setShowApiKeyDialog(false);
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    if (aistudio) {
      await aistudio.openSelectKey();
    }
  }, []);

  // New function to manually show the API key dialog
  const requestApiKey = useCallback(() => {
    setShowApiKeyDialog(true);
  }, []);

  return {
    showApiKeyDialog,
    setShowApiKeyDialog,
    validateApiKey,
    handleApiKeyDialogContinue,
    requestApiKey // Export the new function
  };
};
