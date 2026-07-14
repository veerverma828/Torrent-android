import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePlayerContext } from "../context/PlayerContext.jsx";

export function useHardwareBack() {
  const navigation = useNavigation();
  const { streamUrl, setStreamUrl, fileModalData, setFileModalData } = usePlayerContext();

  useEffect(() => {
    const handleBackPress = () => {
      if (fileModalData) {
        setFileModalData(null);
        return true; // handled
      }
      if (streamUrl) {
        setStreamUrl(null);
        return true; // handled
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // handled
      }
      return false; // let default behavior happen (exits app)
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [navigation, fileModalData, setFileModalData, streamUrl, setStreamUrl]);
}
