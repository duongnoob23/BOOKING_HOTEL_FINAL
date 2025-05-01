import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const getServiceIcon = (serviceType, size = 18, color = "#007AFF") => {
  let iconName = "";
  let serviceName = "";

  // Xác định icon và tên dịch vụ tiếng Việt dựa trên serviceType
  switch (serviceType) {
    case "AMENITY":
      iconName = "bed-outline";
      serviceName = "Tiện nghi";
      break;
    case "BREAKFAST":
      iconName = "cafe-outline";
      serviceName = "Bữa sáng";
      break;
    case "LUNCH":
      iconName = "fast-food-outline";
      serviceName = "Bữa trưa";
      break;
    case "DINNER":
      iconName = "restaurant-outline";
      serviceName = "Bữa tối";
      break;
    case "BUFFET":
      iconName = "pizza-outline";
      serviceName = "Tiệc buffet";
      break;
    case "SPA":
      iconName = "water-outline";
      serviceName = "Spa";
      break;
    case "TRANSPORT":
      iconName = "car-outline";
      serviceName = "Di chuyển";
      break;
    case "ROOM":
      iconName = "home-outline";
      serviceName = "Phòng";
      break;
    default:
      iconName = "help-outline";
      serviceName = "Không xác định";
      break;
  }

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Ionicons name={iconName} size={size} color={color} style={styles.icon} />
      <Text style={[styles.serviceText, { color }]}>{serviceName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 3,
  },
  icon: {
    marginRight: 3, // Khoảng cách giữa icon và tên dịch vụ
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "400",
  },
});

export default getServiceIcon;
