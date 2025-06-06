import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import {
  fetchUserInfo,
  setPrePage,
  updateInforUserChange,
} from "../../Redux/Slice/authSlice";
import {
  fetchBookingRoom,
  updateBookingPayload,
} from "../../Redux/Slice/hotelSlice";
import SkeletonInfoConfirm from "../../Components/Skeleton/Auth/SkeletonInfoConfirm";
import { showToast } from "../../Utils/toast";

const InfoConfirmScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();

  // dữ liệu redux auth
  const {
    isLoggedIn,
    infoUser,
    inforUserChange,
    loadingIU,
    errorIU,
    accessToken,
  } = useAppSelector((state) => state.auth);

  // dữ liệu redux hotel
  const { bookingPayload, listUniqueIdBookingRoom } = useAppSelector(
    (state) => state.hotel
  );

  console.log("bookingPayload >>>>>", bookingPayload);
  console.log("inforUserChange", inforUserChange);

  // khởi tạo mảng lưu thông tin người dùng
  const [infomation, setInfomation] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    phoneCountry: "+84",
  });

  // mảng check lỗi người dùng
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const fetchUserInformation = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // console.log("goi try catch lan 1");
        await dispatch(fetchUserInfo()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải thông tin người dùng ",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch user info :`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchUserInformation()]);
    } catch (error) {
      console.log("Failed to fetch data in HomeScreen:", error);
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải dữ liệu người dùng ",
        position: "top",
        duration: 3000,
      });
    }
  };

  // kiểm tra nếu đã đăng nhập và chưa có thông tin người dùng (infoUser) thì gọi api cập nhậtnhật
  useEffect(() => {
    if (isLoggedIn && !infoUser) {
      // dispatch(fetchUserInfo());
      fetchData();
    }
  }, [isLoggedIn, accessToken, dispatch]);

  // nếu đã đăng nhập và có thông tin (infoUser) thì cập nhật vào trong infomation
  useEffect(() => {
    if (isLoggedIn && infoUser) {
      // Ưu tiên inforUserChange nếu tồn tại, nếu không dùng infoUser
      const source = inforUserChange || infoUser;
      setInfomation({
        firstName: source.firstName || "",
        lastName: source.lastName || "",
        email: source.email || "",
        phoneNumber: source.phone || source.phoneNumber || "",
        phoneCountry: source.phoneCountry || "+84",
      });
    }
  }, [infoUser, inforUserChange]);

  // form validate dữ liệu trước khi xác nhận
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    };

    if (!infomation.firstName.trim()) {
      newErrors.firstName = "Họ là bắt buộc *";
      valid = false;
    }
    if (!infomation.lastName.trim()) {
      newErrors.lastName = "Tên là bắt buộc *";
      valid = false;
    }
    if (!infomation.email.trim()) {
      newErrors.email = "Email là bắt buộc *";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(infomation.email)) {
      newErrors.email = "Email không hợp lệ *";
      valid = false;
    }
    if (!infomation.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại là bắt buộc *";
      valid = false;
    } else if (!/^\d{10}$/.test(infomation.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải có 10 chữ số *";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // thay đổi input set lại giá trị
  const onChangeInfomation = (value, name) => {
    setInfomation((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // hàm nhảy sang login nếu chưa đăng nhập
  const handleLogin = () => {
    dispatch(setPrePage("InfoConfirm"));
    navigation.navigate("LoginScreen", { preScreen: "InfoConfirm" });
  };

  // hàm xác nhận -> sang chi tiết hóa đơn
  const handleInfoConfirm = async () => {
    if (isLoggedIn) {
      if (!validateForm()) {
        return;
      }

      try {
        // Lưu thông tin chỉnh sửa cục bộ
        dispatch(
          updateInforUserChange({
            firstName: infomation?.firstName,
            lastName: infomation?.lastName,
            email: infomation?.email,
            phone: infomation?.phoneNumber,
            phoneCountry: infomation?.phoneCountry,
          })
        );
        const bookingPayload_ = {
          ...bookingPayload,
          customerName: infomation?.lastName,
          customerEmail: infomation?.email,
          customerPhone: infomation?.phoneNumber,
        };
        dispatch(updateBookingPayload(bookingPayload_));

        // Gọi fetchBookingRoom và điều hướng
        // dispatch(fetchBookingRoom());
        navigation.navigate("OrderConfirm");
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Lỗi", error.message || "Xử lý thông tin thất bại");
      }
    } else {
      handleLogin();
    }
  };

  if (loadingIU) {
    return <SkeletonInfoConfirm />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={styles.container}>
        {isLoggedIn && (
          <>
            <Text style={styles.title}>THÔNG TIN CÁ NHÂN</Text>

            <View
              style={[
                styles.inputContainer,
                errors?.firstName && styles.inputError,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#007AFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={infomation?.firstName}
                onChangeText={(value) => onChangeInfomation(value, "firstName")}
                placeholder="Họ *"
                placeholderTextColor="#999"
                editable={isLoggedIn}
              />
              {errors?.firstName ? (
                <Text style={styles.errorText}>{errors?.firstName}</Text>
              ) : null}
            </View>

            <View
              style={[
                styles.inputContainer,
                errors?.lastName && styles.inputError,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color="#007AFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={infomation?.lastName}
                onChangeText={(value) => onChangeInfomation(value, "lastName")}
                placeholder="Tên *"
                placeholderTextColor="#999"
                editable={isLoggedIn}
              />
              {errors?.lastName ? (
                <Text style={styles.errorText}>{errors?.lastName}</Text>
              ) : null}
            </View>

            <View
              style={[
                styles.inputContainer,
                errors?.email && styles.inputError,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#007AFF"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={infomation?.email}
                onChangeText={(value) => onChangeInfomation(value, "email")}
                placeholder="Email *"
                placeholderTextColor="#999"
                keyboardType="email-address"
                editable={isLoggedIn}
              />
              {errors?.email ? (
                <Text style={styles.errorText}>{errors?.email}</Text>
              ) : null}
            </View>

            <View
              style={[
                styles.inputContainer,
                errors?.phoneNumber && styles.inputError,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color="#007AFF"
                style={styles.icon}
              />
              <TextInput
                style={[styles.input]}
                value={infomation?.phoneCountry}
                editable={false}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={infomation?.phoneNumber}
                onChangeText={(value) =>
                  onChangeInfomation(value, "phoneNumber")
                }
                placeholder="Số điện thoại *"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={isLoggedIn}
              />
              {errors?.phoneNumber ? (
                <Text style={styles.errorText}>{errors?.phoneNumber}</Text>
              ) : null}
            </View>
          </>
        )}

        {isLoggedIn && (
          <TouchableOpacity
            style={[styles.button, loadingIU && styles.buttonDisabled]}
            onPress={handleInfoConfirm}
            disabled={loadingIU}
          >
            <Text style={styles.buttonText}>
              {loadingIU ? "Đang xử lý..." : "Xác nhận thông tin"}
            </Text>
          </TouchableOpacity>
        )}
        {!isLoggedIn && (
          <TouchableOpacity
            style={styles.wrapperLoginButton}
            onPress={handleLogin}
          >
            <View style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Đăng nhập tài khoản</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default InfoConfirmScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "400",
    color: "#000",
    marginTop: 30,
    marginBottom: 50,
    textAlign: "center",
  },
  wrapperLoginButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "oranage",
  },
  loginButton: {
    backgroundColor: "#00F598",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 20,
  },
  inputError: {
    borderBottomColor: "#FF0000",
  },
  icon: {
    marginRight: 10,
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    color: "#000",
    paddingVertical: 10,
    marginBottom: 10,
  },
  phoneCode: {
    fontSize: 16,
    color: "#000",
    marginRight: 10,
  },
  checkIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: "#FF0000",
    fontSize: 12,
    marginTop: 5,
    position: "absolute",
    bottom: -20,
    left: 30,
  },
  button: {
    backgroundColor: "#00F598",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "400",
  },
});
