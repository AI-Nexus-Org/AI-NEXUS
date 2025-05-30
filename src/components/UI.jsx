import { useRef, useState, useEffect } from "react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
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

  // Start voice recording
  const startRecording = async () => {
    try {
      // Reset audio chunks
      setAudioChunks([]);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      // Create media recorder with appropriate settings
      // Use audio/mp3 if supported, otherwise fall back to audio/webm
      const mimeType = MediaRecorder.isTypeSupported('audio/mp3') 
        ? 'audio/mp3' 
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
          
      console.log(`Using audio format: ${mimeType}`);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });
      setMediaRecorder(recorder);
      
      // Set up event listeners to collect audio data
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, e.data]);
        }
      };
      
      // Start recording with 100ms timeslices to get frequent updates
      recorder.start(100);
      setIsRecording(true);
      
      // Provide feedback that recording has started
      console.log('Voice recording started');
      
      // Set the input placeholder to show recording status
      if (input.current) {
        input.current.placeholder = 'Recording... Speak now';
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  // Stop voice recording and process the audio
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      // Reset input placeholder
      if (input.current) {
        input.current.placeholder = 'Transcribing your message...';
      }
      
      // Set up the onstop handler before stopping the recorder
      mediaRecorder.onstop = async () => {
        try {
          if (audioChunks.length === 0) {
            console.warn('No audio data captured');
            if (input.current) {
              input.current.placeholder = 'Type a message...';
            }
            return;
          }
          
          console.log(`Recording stopped. Processing ${audioChunks.length} audio chunks...`);
          
          // Create a blob from the audio chunks with the correct MIME type
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          console.log(`Creating audio blob with MIME type: ${mimeType}`);
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          
          // Optional: Play back the recorded audio for confirmation
          // const audioUrl = URL.createObjectURL(audioBlob);
          // const audio = new Audio(audioUrl);
          // audio.play();
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            console.log('Audio converted to base64, sending to server...');
            
            // Send to backend for speech-to-text
            try {
              const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/speech-to-text`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ audioData: base64Audio }),
              });
              
              if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
              }
              
              const data = await response.json();
              
              if (data.text) {
                console.log('Transcription received:', data.text);
                // Set the transcribed text to the input field
                if (input.current) {
                  input.current.value = data.text;
                  input.current.placeholder = 'Type a message...';
                }
                
                // Send the message
                chat(data.text);
              } else if (data.error) {
                console.error('Speech-to-text error:', data.error);
                alert('Could not transcribe audio. Please try again.');
                if (input.current) {
                  input.current.placeholder = 'Type a message...';
                }
              }
            } catch (fetchError) {
              console.error('Error sending audio to server:', fetchError);
              alert('Error communicating with the server. Please try again.');
              if (input.current) {
                input.current.placeholder = 'Type a message...';
              }
            }
          };
        } catch (error) {
          console.error('Error processing audio:', error);
          alert('Error processing audio. Please try again.');
          if (input.current) {
            input.current.placeholder = 'Type a message...';
          }
        }
      };
      
      // Stop the recorder after setting up the onstop handler
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

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
          <h1 className="font-black text-xl">Virtual Assistant</h1>
          <p>My virtual assistant</p>
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
              className="bg-white bg-opacity-70 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
          {/* Microphone button */}
          <button
            disabled={loading || message}
            onClick={isRecording ? stopRecording : startRecording}
            className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white p-4 rounded-md`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
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
