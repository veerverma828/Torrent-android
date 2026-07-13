import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSettingsContext } from "../context/SettingsContext.jsx";
import { usePlayerContext } from "../context/PlayerContext.jsx";

export function useHardwareBack() {
  const navigation = useNavigation();
  const { isSettingsOpen, setIsSettingsOpen } = useSettingsContext();
  const { streamUrl, setStreamUrl, fileModalData, setFileModalData } = usePlayerContext();

  useEffect(() => {
    const handleBackPress = () => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true; // handled
      }
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

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, [navigation, isSettingsOpen, setIsSettingsOpen, fileModalData, setFileModalData, streamUrl, setStreamUrl]);
}
