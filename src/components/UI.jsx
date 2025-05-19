import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

// Background option labels for display
const backgroundLabels = {
  default: "Default",
  greenScreen: "Green Screen",
  night: "Night",
  studio: "Studio",
  warehouse: "Warehouse",
  city: "City",
  custom: "Custom"
};

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const fileInputRef = useRef();
  const [uploadingImage, setUploadingImage] = useState(false);
  const { 
    chat, 
    loading, 
    cameraZoomed, 
    setCameraZoomed, 
    message, 
    background, 
    setBackground, 
    BACKGROUNDS,
    customBackgrounds,
    setCustomBackgrounds,
    activeCustomBackground,
    setActiveCustomBackground
  } = useChat();
  
  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Only accept image files
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Create a copy of the file with a unique name
      const fileName = `${Date.now()}-${file.name}`;
      
      // Create a URL for the image
      const imageUrl = URL.createObjectURL(file);
      
      // Save the image URL to the custom backgrounds list with its name
      const newBackground = { name: fileName, url: imageUrl };
      setCustomBackgrounds([...customBackgrounds, newBackground]);
      setActiveCustomBackground(newBackground);
      setBackground(BACKGROUNDS.CUSTOM);
      
      // Apply the background image to the body
      const body = document.querySelector("body");
      body.classList.remove("greenScreen");
      body.classList.add("customBackground");
      body.style.backgroundImage = `url(${imageUrl})`;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };
  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">Virtual GF</h1>
          <p>My virtual girlfriend</p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <div className="pointer-events-auto bg-white bg-opacity-50 backdrop-blur-md p-2 rounded-md flex flex-col gap-2">
            <label htmlFor="background-select" className="text-sm font-semibold text-gray-700 px-2">
              Background
            </label>
            <select
              id="background-select"
              value={background}
              onChange={(e) => {
                const newBackground = e.target.value;
                setBackground(newBackground);
                
                const body = document.querySelector("body");
                
                body.classList.remove("greenScreen");
                body.classList.remove("customBackground");
                
                body.style.backgroundImage = '';
                
                // Apply appropriate class based on selection
                if (newBackground === BACKGROUNDS.GREEN_SCREEN) {
                  body.classList.add("greenScreen");
                } else if (newBackground === BACKGROUNDS.CUSTOM && activeCustomBackground) {
                  body.classList.add("customBackground");
                  body.style.backgroundImage = `url(${activeCustomBackground.url})`;
                }
              }}
              className="bg-white bg-opacity-70 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {Object.entries(BACKGROUNDS).map(([key, value]) => (
                <option key={key} value={value}>
                  {backgroundLabels[value]}
                </option>
              ))}
            </select>
            
            {background === BACKGROUNDS.CUSTOM && customBackgrounds.length > 0 && (
              <div className="mt-2">
                <label htmlFor="custom-background-select" className="text-sm font-semibold text-gray-700 px-2">
                  Custom Background
                </label>
                <select
                  id="custom-background-select"
                  value={activeCustomBackground ? activeCustomBackground.name : ''}
                  onChange={(e) => {
                    const selected = customBackgrounds.find(bg => bg.name === e.target.value);
                    if (selected) {
                      setActiveCustomBackground(selected);
                      
                      const body = document.querySelector("body");
                      body.classList.add("customBackground");
                      body.style.backgroundImage = `url(${selected.url})`;
                    }
                  }}
                  className="w-full bg-white bg-opacity-70 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 mt-1"
                >
                  {customBackgrounds.map((bg) => (
                    <option key={bg.name} value={bg.name}>
                      {bg.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="mt-2">
              <input 
                type="file" 
                id="background-upload" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingImage}
                className={`w-full bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-md text-sm font-semibold ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploadingImage ? 'Uploading...' : 'Upload Background'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
