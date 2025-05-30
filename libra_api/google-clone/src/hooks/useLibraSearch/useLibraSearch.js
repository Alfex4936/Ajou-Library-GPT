import { useEffect, useState, useCallback, useRef, useMemo, useTransition } from "react";
import { useHistoryActions, useSettingsState, useUIActions } from "../../store";

// Cache for deduplicating requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to create cache key
const createCacheKey = (term, numResults, gptModel) => 
  `${term}-${numResults}-${gptModel}`;

// Helper function to check if cache entry is valid
const isCacheValid = (cacheEntry) => 
  cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;

export const useLibraSearch = term => {
  const { numResults, openAIKey, gptModel } = useSettingsState();
  const { addToHistory } = useHistoryActions();
  const { setError } = useUIActions();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isPending, startTransition] = useTransition();
  
  // Refs for cleanup and request management
  const abortControllerRef = useRef(null);
  const lastRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized cache key
  const cacheKey = useMemo(() => 
    createCacheKey(term, numResults, gptModel), 
    [term, numResults, gptModel]
  );

  // Memoized validation function
  const isValidRequest = useMemo(() => 
    Boolean(term?.trim() && openAIKey?.trim()), 
    [term, openAIKey]
  );

  // Optimized fetch function with retry logic
  const fetchData = useCallback(async (requestId, signal) => {
    const maxRetries = 3;
    const baseDelay = 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (signal.aborted) return null;

        const response = await fetch(process.env.REACT_APP_API_ADDRESS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            k: numResults,
            api: openAIKey,
            interest: term.trim(),
            model: gptModel,
          }),
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Cache the successful result
        requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        return result;
      } catch (error) {
        if (signal.aborted) return null;
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || 
            error.message.includes('401') || 
            error.message.includes('403')) {
          throw error;
        }

        // Retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }, [term, numResults, openAIKey, gptModel, cacheKey]);

  // Memoized error sync effect
  useEffect(() => {
    if (localError && isMountedRef.current) {
      setError(localError);
    }
  }, [localError, setError]);

  // Main search effect with optimizations
  useEffect(() => {
    if (!isValidRequest) {
      if (term && !openAIKey) {
        setLocalError("OpenAI API key is required");
      } else if (!term && openAIKey) {
        // Clear previous data when term is empty
        setData(null);
        setLocalError(null);
      }
      return;
    }

    // Check cache first
    const cachedResult = requestCache.get(cacheKey);
    if (isCacheValid(cachedResult)) {
      startTransition(() => {
        setData(cachedResult.data);
        setLocalError(null);
        setLoading(false);
      });
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    const currentRequestId = ++lastRequestIdRef.current;

    const performSearch = async () => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setLocalError(null);

      try {
        const result = await fetchData(currentRequestId, abortController.signal);
        
        // Only update if this is still the latest request and component is mounted
        if (currentRequestId === lastRequestIdRef.current && 
            isMountedRef.current && 
            !abortController.signal.aborted &&
            result) {
          
          startTransition(() => {
            setData(result);
            setLocalError(null);
          });
          
          // Add to history only on successful search
          addToHistory(term.trim());
        }
      } catch (error) {
        // Only handle error if this is still the latest request and component is mounted
        if (currentRequestId === lastRequestIdRef.current && 
            isMountedRef.current && 
            !abortController.signal.aborted) {
          
          const errorMessage = error.name === 'AbortError' 
            ? 'Search was cancelled' 
            : error.message || 'An unexpected error occurred';
            
          setLocalError(errorMessage);
        }
      } finally {
        // Only update loading state if this is still the latest request and component is mounted
        if (currentRequestId === lastRequestIdRef.current && 
            isMountedRef.current && 
            !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    performSearch();

    // Cleanup function
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [isValidRequest, cacheKey, fetchData, addToHistory, term, openAIKey]);

  // Return memoized result
  return useMemo(() => ({
    data,
    loading: loading || isPending,
    error: localError,
    isFromCache: Boolean(requestCache.get(cacheKey) && isCacheValid(requestCache.get(cacheKey))),
  }), [data, loading, isPending, localError, cacheKey]);
};

export default useLibraSearch;
