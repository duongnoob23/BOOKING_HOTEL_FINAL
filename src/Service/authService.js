import { auth } from "../../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { API_BASE_URL } from "../Constant/Constant";

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();
    if (!idToken) {
      throw new Error("Không nhận được token từ Firebase");
    }
    return idToken;
  } catch (error) {
    throw new Error(`Lỗi xác thực Firebase: ${error.message}`);
  }
};

export const sendTokenToBackend = async (idToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/firebase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: idToken }),
    });
    const data = await response.json();
    if (!data?.data?.accessToken || !data?.data?.userId) {
      throw new Error(data.message || "Dữ liệu trả về từ backend không hợp lệ");
    }
    return {
      accessToken: data.data.accessToken,
      userId: data.data.userId,
    };
  } catch (error) {
    throw new Error(`Lỗi gửi idToken lên backend: ${error.message}`);
  }
};
