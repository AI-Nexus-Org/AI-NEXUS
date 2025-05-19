import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useMemo } from "react";
import { Avatar } from "./Avatar";

const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((loadingText) => {
          if (loadingText.length > 2) {
            return ".";
          }
          return loadingText + ".";
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);
  if (!loading) return null;
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

const ResponseText = (props) => {
  const { message } = useChat();
  console.log('Current message:', message);
  
  if (!message) return null;
  
  return (
    <group {...props}>
      <Text
        fontSize={0.1}
        maxWidth={2}
        textAlign="center"
        anchorX="center"
        anchorY="bottom"
        color="black"
      >
        {message.content || message.text || 'Hello!'}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};



export const Experience = () => {
  const cameraControls = useRef();
  const { 
    cameraZoomed, 
    background, 
    BACKGROUNDS 
  } = useChat();
  
  // Map background state to environment presets
  const environmentPreset = useMemo(() => {
    switch(background) {
      case BACKGROUNDS.NIGHT:
        return "night";
      case BACKGROUNDS.STUDIO:
        return "studio";
      case BACKGROUNDS.WAREHOUSE:
        return "warehouse";
      case BACKGROUNDS.CITY:
        return "city";
      case BACKGROUNDS.GREEN_SCREEN:
      case BACKGROUNDS.CUSTOM:
        return "sunset"; // Keep sunset for both green screen and custom as they're handled via CSS
      case BACKGROUNDS.DEFAULT:
      default:
        return "sunset";
    }
  }, [background, BACKGROUNDS]);

  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset={environmentPreset} />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
        <ResponseText position-y={-0.5} position-z={0.5} />
      </Suspense>
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};
