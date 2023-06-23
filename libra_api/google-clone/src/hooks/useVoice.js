// useVoice.js
import { useState, useEffect } from "react";

const useVoice = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

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
        setIsListening(false);
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
      if (isListening) {
        setText(event.results[event.results.length - 1][0].transcript);
        setIsListening(false);
      }
    };
  }, [isListening, speech]);

  return {
    text,
    isListening,
    listen,
    voiceSupported: speech !== null,
  };
};

export { useVoice };
