import { TouchableOpacity, Text } from "react-native";

export default function Button({
  children,
  onPress,
  onClick,
  disabled = false,
  style = {},
  textStyle = {},
  title = "",
}) {
  return (
    <TouchableOpacity
      onPress={onPress || onClick}
      disabled={disabled}
      style={style}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      {typeof children === "string" ? <Text style={textStyle}>{children}</Text> : children}
    </TouchableOpacity>
  );
}
