import { MessageType, showMessage } from "react-native-flash-message";

export const showToast = (title: string, description: string, type: MessageType = "info") => {
  showMessage({
    message: title,
    description: description,
    type: type,
    titleStyle: { fontFamily: 'Unbounded_800ExtraBold', fontSize: 14 },
    textStyle: { fontFamily: 'Inter_400Regular', fontSize: 13 },
    duration: 3000,
    floating: true,
    backgroundColor: type === "danger" ? "#E53935" : "#1A1A1A",
  });
};