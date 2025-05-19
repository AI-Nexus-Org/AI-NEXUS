/**
 * Utility functions for storing and retrieving conversation history
 */

// Default file path for conversation storage
const CONVERSATION_FILE_PATH = '/data/conversations.json';

/**
 * Save a conversation message to the JSON file
 * @param {Object} userMessage - The user's message object
 * @param {Object} responseMessage - The response message object
 * @returns {Promise<boolean>} - Success status
 */
export const saveConversation = async (userMessage, responseMessage) => {
  try {
    // Create a conversation entry with timestamp
    const conversationEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userMessage,
      responseMessage,
    };
    
    // Get existing conversations
    const conversations = await loadConversations();
    
    // Add new conversation
    conversations.push(conversationEntry);
    
    // Save to file
    const response = await fetch(CONVERSATION_FILE_PATH, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversations }, null, 2),
    }).catch(() => {
      // If fetch fails, try to save to localStorage as fallback
      localStorage.setItem('conversations', JSON.stringify({ conversations }));
      return { ok: true, localStorageFallback: true };
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving conversation:', error);
    // Try localStorage as fallback
    try {
      const conversations = JSON.parse(localStorage.getItem('conversations') || '{"conversations":[]}');
      const conversationEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        userMessage,
        responseMessage,
      };
      conversations.conversations.push(conversationEntry);
      localStorage.setItem('conversations', JSON.stringify(conversations));
      return true;
    } catch (e) {
      console.error('Fallback storage failed:', e);
      return false;
    }
  }
};

/**
 * Load all conversations from the JSON file
 * @returns {Promise<Array>} - Array of conversation objects
 */
export const loadConversations = async () => {
  try {
    // Try to fetch the file
    const response = await fetch(CONVERSATION_FILE_PATH).catch(() => ({ ok: false }));
    
    if (response.ok) {
      const data = await response.json();
      return data.conversations || [];
    }
    
    // If fetch fails, try localStorage
    const localData = localStorage.getItem('conversations');
    if (localData) {
      const parsed = JSON.parse(localData);
      return parsed.conversations || [];
    }
    
    // If no data is found, return empty array
    return [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};

/**
 * Download the conversation history as a JSON file
 */
export const downloadConversationHistory = async () => {
  try {
    const conversations = await loadConversations();
    
    // Create a blob with the conversation data
    const blob = new Blob(
      [JSON.stringify({ conversations }, null, 2)], 
      { type: 'application/json' }
    );
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-history-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading conversation history:', error);
    return false;
  }
};

/**
 * Create an empty conversations.json file if it doesn't exist
 */
export const initializeConversationStorage = async () => {
  try {
    // Check if file exists
    const response = await fetch(CONVERSATION_FILE_PATH).catch(() => ({ ok: false }));
    
    if (!response.ok) {
      // Create empty file
      await fetch(CONVERSATION_FILE_PATH, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversations: [] }, null, 2),
      }).catch(() => {
        // If fetch fails, initialize localStorage
        if (!localStorage.getItem('conversations')) {
          localStorage.setItem('conversations', JSON.stringify({ conversations: [] }));
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing conversation storage:', error);
    return false;
  }
};
