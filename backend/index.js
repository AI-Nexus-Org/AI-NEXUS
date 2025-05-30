import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import fs from "fs";
import { promises as fsPromises } from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure FFmpeg and rhubarb path -
const ffmpegPath = path.resolve(__dirname,process.env.FfmpegPath);// CHANGE THIS TO YOUR ACTUAL FFMPEG PATH
const rhubarbPath = path.resolve(__dirname,process.env.RhubarbPath);  // For rhubarb lip-sync

// Helper functions with error handling
const readJsonTranscript = async (file) => {
  try {
    const data = await fsPromises.readFile(file, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading JSON file ${file}:`, err);
    return null;
  }
};

const audioFileToBase64 = async (file) => {
  try {
    const data = await fsPromises.readFile(file);
    return data.toString("base64");
  } catch (err) {
    console.error(`Error reading audio file ${file}:`, err);
    return null;
  }
};
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.VOICE_ID;

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

// Create audios directory if it doesn't exist
(async () => {
  try {
    await fsPromises.mkdir('audios', { recursive: true });
  } catch (err) {
    console.error('Could not create audios directory:', err);
  }
})();

// Error response templates
const errorResponses = {
  noApiKeys: [
    {
      text: "API keys are missing! Please configure them.",
      audio: await audioFileToBase64("audios/api_0.wav").catch(() => null),
      lipsync: await readJsonTranscript("audios/api_0.json").catch(() => null),
      facialExpression: "angry",
      animation: "Angry"
    }
  ],
  ffmpegError: [
    {
      text: "There was a problem processing the audio.",
      audio: null,
      lipsync: null,
      facialExpression: "sad",
      animation: "Crying"
    }
  ],
  elevenLabsError: [
    {
      text: "Having trouble generating my voice right now.",
      audio: null,
      lipsync: null,
      facialExpression: "sad",
      animation: "Terrified"
    }
  ]
};

// Modified execCommand with better error handling
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`);
        console.error(`Error: ${error.message}`);
        console.error(`Stderr: ${stderr}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const lipSyncMessage = async (messageIndex) => {
  try {
    const time = new Date().getTime();
    console.log(`Starting conversion for message ${messageIndex}`);
    
    // Convert MP3 to WAV using hardcoded FFmpeg path
    await execCommand(
      `"${ffmpegPath}" -y -i audios/message_${messageIndex}.mp3 audios/message_${messageIndex}.wav`
    );
    
    console.log(`Conversion done in ${new Date().getTime() - time}ms`);
    
    // Run rhubarb lip-sync
    await execCommand(
      `"${rhubarbPath}" -f json -o audios/message_${messageIndex}.json audios/message_${messageIndex}.wav -r phonetic`
    );
    
    console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
  } catch (error) {
    console.error(`Lip sync failed for message ${messageIndex}:`, error);
    throw new Error('Lip sync processing failed');
  }
};

// Speech-to-text endpoint to handle voice recordings
app.post("/speech-to-text", async (req, res) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).send({ error: "No audio data provided" });
    }
    
    // Convert base64 audio to buffer
    const base64Data = audioData.split(',')[1]; // Remove the data URL prefix
    const audioBuffer = Buffer.from(base64Data, 'base64');
    
    // Save audio temporarily with the correct extension (.mp3 or .webm)
    const tempAudioPath = path.join(__dirname, 'audios', `speech_${Date.now()}.mp3`);
    await fsPromises.writeFile(tempAudioPath, audioBuffer);
    
    console.log(`Audio saved to ${tempAudioPath}, preparing for transcription...`);
    
    try {
      // Use OpenAI's Whisper API for speech recognition with the proper file
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempAudioPath),
        model: "whisper-1",
      });
      
      console.log("Transcription successful:", transcription.text);
      
      // Clean up the temporary file
      await fsPromises.unlink(tempAudioPath).catch(err => {
        console.error("Error deleting temporary audio file:", err);
      });
      
      return res.send({ text: transcription.text });
    } catch (err) {
      console.error("OpenAI Whisper API error:", err);
      throw new Error("Failed to transcribe audio");
    }
  } catch (error) {
    console.error("Error in /speech-to-text endpoint:", error);
    res.status(500).send({
      error: "An error occurred while processing your audio",
      details: error.message
    });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    if (!userMessage) {
      return res.send({
        messages: [
          {
            text: "Hey dear... How was your day?",
            audio: await audioFileToBase64("audios/intro_0.wav").catch(() => null),
            lipsync: await readJsonTranscript("audios/intro_0.json").catch(() => null),
            facialExpression: "smile",
            animation: "Talking_1",
          },
          {
            text: "I missed you so much... Please don't go for so long!",
            audio: await audioFileToBase64("audios/intro_1.wav").catch(() => null),
            lipsync: await readJsonTranscript("audios/intro_1.json").catch(() => null),
            facialExpression: "sad",
            animation: "Crying",
          },
        ],
      });
    }

    if (!elevenLabsApiKey || openai.apiKey === "-") {
      return res.send({ messages: errorResponses.noApiKeys });
    }

    // Get ChatGPT response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      max_tokens: 500,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
        You are a virtual girlfriend.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `,
        },
        { role: "user", content: userMessage || "Hello" }
      ],
    }).catch(err => {
      console.error("OpenAI API error:", err);
      throw new Error("Failed to get ChatGPT response");
    });

    let messages = JSON.parse(completion.choices[0].message.content);
    if (messages.messages) messages = messages.messages;

    // Process each message
    for (let i = 0; i < messages.length; i++) {
      try {
        const fileName = `audios/message_${i}.mp3`;
        
        // Generate audio with ElevenLabs
        await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, messages[i].text)
          .catch(async err => {
            console.error("ElevenLabs error:", err);
            throw new Error('Voice generation failed');
          });
        
        // Generate lip-sync
        await lipSyncMessage(i).catch(err => {
          console.error("Lip-sync error:", err);
          throw new Error('Lip-sync failed');
        });
        
        messages[i].audio = await audioFileToBase64(fileName);
        messages[i].lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      } catch (error) {
        console.error(`Error processing message ${i}:`, error);
        // Fallback to error response if audio generation fails
        messages[i] = {
          ...messages[i],
          audio: null,
          lipsync: null,
          facialExpression: "sad",
          animation: "Terrified"
        };
      }
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error in /chat endpoint:", error);
    res.status(500).send({ 
      error: "An error occurred while processing your request",
      details: error.message 
    });
  }
});



app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
