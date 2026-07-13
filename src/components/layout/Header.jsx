import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext.jsx";
import appLogoPng from "../../../Images/title-logo-600.png";
import { theme } from "../../styles/theme.js";

export default function Header() {
  const navigation = useNavigation();
  const { setQuery } = useAppContext();

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          setQuery("");
          navigation.navigate("Home");
        }}
      >
        <Image source={appLogoPng} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  logo: {
    width: "100%",
    maxWidth: 300,
    height: 121,
  },
});
