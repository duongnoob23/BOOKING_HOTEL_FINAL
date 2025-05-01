import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons

export const showToast = ({
  type = "info",
  text1 = "Thông báo",
  text2,
  position = "top",
  duration = 3000,
} = {}) => {
  Toast.show({
    type,
    text1,
    text2,
    position,
    visibilityTime: duration,
  });
};

export const CustomToast = ({ type, text1, text2 }) => {
  // Chọn màu nền và icon dựa trên type
  const backgroundColor =
    type === "success"
      ? "#00F598" // Xanh lá cây cho success
      : type === "error"
      ? "#FF4D4F" // Đỏ cho error
      : type === "warning"
      ? "#FFA500" // Cam cho warning
      : "#666"; // Xám cho info

  const iconName =
    type === "success"
      ? "checkmark-circle-outline" // Icon cho success
      : type === "error"
      ? "close-circle-outline" // Icon cho error
      : type === "warning"
      ? "warning-outline" // Icon cho warning
      : "information-circle-outline"; // Icon cho info

  return (
    <View style={[styles.toastContainer, { backgroundColor }]}>
      <Ionicons name={iconName} size={24} color="#fff" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error: (props) => <CustomToast {...props} type="error" />,
  warning: (props) => <CustomToast {...props} type="warning" />, // Thêm warning
  info: (props) => <CustomToast {...props} type="info" />,
};

const styles = StyleSheet.create({
  toastContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Shadow cho Android
    flexDirection: "row", // Đặt icon và text theo hàng ngang
    alignItems: "center",
    minWidth: 300,
  },
  icon: {
    marginRight: 10, // Khoảng cách giữa icon và text
  },
  textContainer: {
    flex: 1, // Text chiếm toàn bộ không gian còn lại
  },
  text1: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  text2: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
});
