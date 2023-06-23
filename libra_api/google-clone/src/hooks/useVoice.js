import { useState, useEffect, useRef } from "react"; // import useRef

const useVoice = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(isListening); // new useRef

  // Update isListeningRef current value whenever isListening changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  let speech;
  if (window.webkitSpeechRecognition) {
    const SpeechRecognition = window.webkitSpeechRecognition;
    speech = new SpeechRecognition();
    speech.continuous = true;
  } else {
    speech = null;
  }

  const listen = () => {
    if (isListening) {
      try {
        speech?.stop();
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    } else {
      try {
        setIsListening(true);
        speech?.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  };

  useEffect(() => {
    if (!speech) {
      return;
    }
    speech.onresult = event => {
      if (isListeningRef.current) {
        // use isListeningRef here instead
        setText(event.results[event.results.length - 1][0].transcript);
        setIsListening(false);
      }
    };
  }, [speech]); // Remove isListening from dependency array

  return {
    text,
    isListening,
    listen,
    voiceSupported: speech !== null,
  };
};

export { useVoice };
