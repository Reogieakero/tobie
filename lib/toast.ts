import { Platform } from "react-native";
import { MessageType, showMessage } from "react-native-flash-message";

export const showToast = (title: string, description: string, type: MessageType = "info") => {
  let bgColor = "#1A1A1A";
  if (type === "danger") bgColor = "#E53935";
  if (type === "success") bgColor = "#4CAF50";

  showMessage({
    message: title,
    description: description,
    type: type,
    backgroundColor: bgColor,
    duration: 3000,
    floating: true,
    style: {
      paddingTop: Platform.OS === 'ios' ? 50 : 10,
      minHeight: Platform.OS === 'ios' ? 100 : 0,
      zIndex: 9999,
      elevation: 99,
    },
    titleStyle: { 
      fontFamily: 'Unbounded_800ExtraBold', 
      fontSize: 14,
      marginTop: Platform.OS === 'ios' ? 5 : 0 
    },
    textStyle: { 
      fontFamily: 'Inter_400Regular', 
      fontSize: 13 
    },
  });
};