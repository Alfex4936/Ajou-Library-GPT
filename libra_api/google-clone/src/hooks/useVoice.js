import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const useVoice = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  
  // Stable references
  const speechRef = useRef(null);
  const isListeningRef = useRef(false);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef(null);

  // Initialize speech recognition once
  const speechRecognition = useMemo(() => {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      return null;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';
    recognition.maxAlternatives = 1;

    return recognition;
  }, []);

  // Update refs when state changes
  useEffect(() => {
    isListeningRef.current = isListening;
    speechRef.current = speechRecognition;
  }, [isListening, speechRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (speechRef.current && isListeningRef.current) {
        try {
          speechRef.current.stop();
        } catch (err) {
          console.warn("Error stopping speech recognition on cleanup:", err);
        }
      }
    };
  }, []);

  // Memoized event handlers
  const handleResult = useCallback((event) => {
    if (!isMountedRef.current || !isListeningRef.current) return;

    try {
      const results = event.results;
      if (results.length > 0) {
        const latestResult = results[results.length - 1];
        if (latestResult.isFinal && latestResult[0]) {
          const transcript = latestResult[0].transcript.trim();
          if (transcript) {
            setText(transcript);
            setError(null);
          }
        }
      }
    } catch (err) {
      console.error("Error processing speech result:", err);
      setError("Failed to process speech result");
    }
  }, []);

  const handleError = useCallback((event) => {
    if (!isMountedRef.current) return;

    console.error("Speech recognition error:", event.error);
    
    const errorMessages = {
      'no-speech': 'No speech detected. Please try again.',
      'audio-capture': 'Audio capture failed. Check your microphone.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error. Please check your connection.',
      'aborted': 'Speech recognition was cancelled.',
      'language-not-supported': 'Language not supported.',
      'service-not-allowed': 'Speech recognition service not available.'
    };

    const errorMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
    setError(errorMessage);
    setIsListening(false);
  }, []);

  const handleEnd = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsListening(false);
  }, []);

  const handleStart = useCallback(() => {
    if (!isMountedRef.current) return;
    setError(null);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const speech = speechRef.current;
    if (!speech) return;

    // Add event listeners
    speech.addEventListener('result', handleResult);
    speech.addEventListener('error', handleError);
    speech.addEventListener('end', handleEnd);
    speech.addEventListener('start', handleStart);

    // Cleanup event listeners
    return () => {
      speech.removeEventListener('result', handleResult);
      speech.removeEventListener('error', handleError);
      speech.removeEventListener('end', handleEnd);
      speech.removeEventListener('start', handleStart);
    };
  }, [handleResult, handleError, handleEnd, handleStart]);

  // Optimized listen function with better error handling
  const listen = useCallback(() => {
    if (!speechRef.current) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    if (!isMountedRef.current) return;

    try {
      if (isListeningRef.current) {
        // Stop listening
        speechRef.current.stop();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // Start listening
        setError(null);
        setIsListening(true);
        speechRef.current.start();

        // Auto-stop after 30 seconds to prevent hanging
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && isListeningRef.current) {
            try {
              speechRef.current.stop();
            } catch (err) {
              console.warn("Error stopping speech recognition after timeout:", err);
            }
          }
        }, 30000);
      }
    } catch (err) {
      console.error("Error toggling speech recognition:", err);
      setError("Failed to start speech recognition");
      setIsListening(false);
    }
  }, []);

  // Memoized stop function
  const stopListening = useCallback(() => {
    if (!speechRef.current || !isListeningRef.current) return;

    try {
      speechRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping speech recognition:", err);
    }
  }, []);

  // Memoized clear function
  const clearText = useCallback(() => {
    setText("");
    setError(null);
  }, []);

  // Memoized return object
  return useMemo(() => ({
    text,
    isListening,
    error,
    listen,
    stopListening,
    clearText,
    voiceSupported: speechRecognition !== null,
    isSupported: speechRecognition !== null, // Alternative naming
  }), [text, isListening, error, listen, stopListening, clearText, speechRecognition]);
};

export { useVoice };
