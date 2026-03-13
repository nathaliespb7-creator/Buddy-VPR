import { useLocation } from "wouter";
import { SplashScreen } from "@/components/SplashScreen";

export default function WelcomePage() {
  const [, setLocation] = useLocation();

  return (
    <SplashScreen
      onFinish={() => {
        setLocation("/intro");
      }}
    />
  );
}

