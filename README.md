

# 3D AI Character Chat Application

A web application that leverages 3D AI characters to provide interactive text and voice responses to user questions. The application consists of a React frontend and Node.js backend with OpenAI and ElevenLabs integration for AI responses and voice synthesis.

## Features

- Interactive 3D AI character that responds to user queries
- Text-to-speech with realistic voice synthesis (ElevenLabs)
- AI-powered conversation (OpenAI)
- Lip-sync animation using Rhubarb Lip Sync
- Customizable character and voice settings

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16 or later)
- Yarn
- FFmpeg installed on your system
- API keys for:
  - OpenAI
  - ElevenLabs

## Installation

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd [repository-name]
   ```

2. Install frontend dependencies:
   ```bash
   yarn
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   yarn
   cd ..

4. Download the Rhubarb Lip Sync binary for your OS from [here](https://github.com/DanielSWolf/rhubarb-lip-sync/releases) and place it in the `bin` folder. Ensure it's executable and accessible at `bin/rhubarb`.

## Configuration

1. Create a `.env` file in the root directory based on the `.env.example`:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ELEVEN_LABS_API_KEY=your-eleven-labs-api-key
   FfmpegPath=your-ffmpeg-path
   RhubarbPath=your-rhubarb-path
   VOICE_ID=your-id
   ```

2. Replace the placeholder values with your actual credentials and paths:
   - `your-openai-api-key`: Your OpenAI API key
   - `your-eleven-labs-api-key`: Your ElevenLabs API key
   - `your-ffmpeg-path`: Path to your FFmpeg executable (e.g., `/usr/bin/ffmpeg` on Linux)
   - `your-rhubarb-path`: Path to your Rhubarb executable (e.g., `./bin/rhubarb`)
   - `your-id`: ElevenLabs voice ID you want to use

## Running the Application

1. Start both frontend and backend servers:
   ```bash
   yarn dev
   ```

2. The application should now be running on:
   ```
   http://localhost:3000
   ```

## Troubleshooting

- Ensure all API keys are correctly set in the backend `.env` file
- Verify Rhubarb binary has execute permissions
- Check that FFmpeg is installed and accessible at the specified path
- If experiencing CORS issues, verify backend is properly configured to accept requests from the frontend origin

## License

[MIT license]
```
