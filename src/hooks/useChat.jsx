import { createContext, useContext, useEffect, useState } from "react";
import { saveConversation, loadConversations, initializeConversationStorage } from "../utils/conversationStorage";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Available background options
const BACKGROUNDS = {
  DEFAULT: "default",
  GREEN_SCREEN: "greenScreen",
  NIGHT: "night",
  STUDIO: "studio",
  WAREHOUSE: "warehouse",
  CITY: "city",
  CUSTOM: "custom"
};

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversationHistory, setConversationHistory] = useState([]);

  // Initialize conversation storage on component mount
  useEffect(() => {
    const initialize = async () => {
      await initializeConversationStorage();
      const history = await loadConversations();
      setConversationHistory(history);
    };
    initialize();
  }, []);

  const chat = async (message) => {
    setLoading(true);
    
    // Create user message object
    const userMessageObj = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    
    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      const resp = (await data.json()).messages;
      setMessages((messages) => [...messages, ...resp]);
      
      // Save conversation to storage if there's a response
      if (resp && resp.length > 0) {
        const responseMessageObj = {
          role: "assistant",
          content: resp[0].text || resp[0].content,
          timestamp: new Date().toISOString()
        };
        
        // Save to storage
        await saveConversation(userMessageObj, responseMessageObj);
        
        // Update conversation history
        setConversationHistory(prevHistory => [
          ...prevHistory,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            userMessage: userMessageObj,
            responseMessage: responseMessageObj
          }
        ]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setLoading(false);
    }
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [background, setBackground] = useState(BACKGROUNDS.DEFAULT);
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const [activeCustomBackground, setActiveCustomBackground] = useState(null);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        background,
        setBackground,
        BACKGROUNDS,
        customBackgrounds,
        setCustomBackgrounds,
        activeCustomBackground,
        setActiveCustomBackground,
        conversationHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
