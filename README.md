

# 🧠 3D AI Character Web App

This web application features an interactive **3D AI-powered character** that responds to user input via text using advanced AI technologies including **OpenAI** for text generation, **ElevenLabs** for voice synthesis, and **Rhubarb** for facial animation and lip-syncing.

---

## 📦 Features

- 💬 AI-generated text responses powered by OpenAI
- 🗣️ Realistic voice synthesis with ElevenLabs
- 🎭 Facial animation and lip-syncing using Rhubarb Lip Sync
- 🎥 Web-based 3D character rendering
- ⚙️ Modular frontend/backend architecture

---

## 📁 Project Structure

/ ├── frontend/         # React (or similar) app │   ├── public/ │   └── src/ │       └── ... ├── backend/          # Node.js/Express backend │   ├── controllers/ │   ├── routes/ │   └── ... ├── bin/              # Binaries for tools like Rhubarb │   └── rhubarb       # Executable for Rhubarb Lip Sync ├── .env              # Environment variables ├── .env.example      # Example env file └── README.md

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


---

2. Set Up Environment Variables

Create a .env file in the root directory based on the .env.example file:

OPENAI_API_KEY=your-openai-api-key
ELEVEN_LABS_API_KEY=your-eleven-labs-api-key
FfmpegPath=your-ffmpeg-path
RhubarbPath=your-rhubarb-path
VOICE_ID=your-elevenlabs-voice-id


---

3. Install Dependencies

Frontend

cd frontend
yarn
yarn dev

Backend

cd ../backend
yarn
yarn dev


---

4. Set Up Rhubarb Lip Sync

Download the Rhubarb Lip Sync binary from the official GitHub:

🔗 Rhubarb Lip Sync Releases

Extract it

Place the binary into the bin/ folder at the root of the project

Ensure it's accessible via bin/rhubarb



---

5. Install FFmpeg

Ensure FFmpeg is installed and its path is correctly specified in your .env file.

🛠 Download FFmpeg


---

🧪 Development Scripts

Run from the root directory:

Frontend:

cd frontend
yarn dev

Backend:

cd backend
yarn dev



---

🌍 Tech Stack

Layer	Technology

Frontend	React, Three.js (or similar 3D lib)
Backend	Node.js, Express
AI Services	OpenAI, ElevenLabs
Animation	Rhubarb Lip Sync, FFmpeg



---

🧰 Environment Variables

Here are the required environment variables:

Variable Name	Description

OPENAI_API_KEY	Your OpenAI API Key
ELEVEN_LABS_API_KEY	Your ElevenLabs API Key
FfmpegPath	Path to your local FFmpeg binary
RhubarbPath	Path to your Rhubarb executable
VOICE_ID	ElevenLabs voice ID to be used



---

📄 License

MIT License © [Your Name or Organization]


---

🤝 Contributing

Pull requests and stars are always welcome. For major changes, please open an issue first to discuss what you’d like to change.


---

📫 Contact

For questions or support, reach out to:

📧 your.email@example.com
🔗 LinkedIn

---

Let me know if you'd like it tailored to a specific frontend framework (e.g., Next.js, Vue), or hosted on a particular platform (like Vercel or Heroku).


