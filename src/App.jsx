import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { ConversationHistory } from "./components/ConversationHistory";
import { ChatProvider } from "./hooks/useChat";

function App() {
  return (
    <ChatProvider>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
      <ConversationHistory />
    </ChatProvider>
  );
}

export default App;
