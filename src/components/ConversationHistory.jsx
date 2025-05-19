import { useState } from "react";
import { useChat } from "../hooks/useChat";
import { downloadConversationHistory } from "../utils/conversationStorage";

export const ConversationHistory = () => {
  const { conversationHistory } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    await downloadConversationHistory();
  };

  // Format timestamp to readable date and time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="fixed bottom-20 right-4 z-20 pointer-events-auto">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg mb-2 ml-auto block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
      </button>

      {/* History panel */}
      {isOpen && (
        <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Conversation History</h3>
            <button
              onClick={handleDownload}
              className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-md text-sm"
            >
              Download JSON
            </button>
          </div>

          {conversationHistory.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No conversation history yet.</p>
          ) : (
            <div className="space-y-4">
              {conversationHistory.map((entry) => (
                <div key={entry.id} className="border-b border-gray-200 pb-3">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</p>
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <p className="text-sm font-semibold">You:</p>
                      <p className="text-sm">{entry.userMessage.content}</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <p className="text-sm font-semibold">Virtual GF:</p>
                      <p className="text-sm">{entry.responseMessage.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
