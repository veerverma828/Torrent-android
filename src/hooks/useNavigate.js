import { useNavigation } from "@react-navigation/native";

export function useNavigate() {
  const navigation = useNavigation();

  return (path, options) => {
    if (path === -1) {
      navigation.goBack();
      return;
    }

    if (typeof path !== "string") return;

    if (path.startsWith("/movie/")) {
      const id = path.replace("/movie/", "");
      navigation.navigate("Movie", { id, item: options?.state?.item });
    } else if (path.startsWith("/series/")) {
      // Path format: /series/:id or /series/:id/season/:season/episode/:episode
      const match = path.match(/\/series\/([^/]+)(?:\/season\/(\d+)\/episode\/(\d+))?/);
      if (match) {
        const id = match[1];
        const season = match[2];
        const episode = match[3];
        navigation.navigate("Series", { id, season, episode, item: options?.state?.item });
      }
    } else if (path === "/") {
      navigation.navigate("Home");
    }
  };
}
