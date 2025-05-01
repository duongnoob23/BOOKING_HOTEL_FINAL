import { registerForPushNotificationsAsync } from "../Utils/notificationsQuan";
import { registerDevice } from "../Redux/apiQuan";
import { Platform } from "react-native";

export const registerPushNotification = async () => {
  try {
    const deviceToken = await registerForPushNotificationsAsync();
    if (deviceToken) {
      await registerDevice(
        deviceToken,
        Platform.OS === "ios" ? "IOS" : "ANDROID"
      );
      return deviceToken;
    }
    throw new Error("Không nhận được device token");
  } catch (error) {
    console.warn(`Lỗi đăng ký push notification: ${error.message}`);
    return null; // Tiếp tục luồng nếu push notification thất bại
  }
};
