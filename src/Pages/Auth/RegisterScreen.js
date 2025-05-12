import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import { registerUser, resetRegisterState } from "../../Redux/Slice/authSlice";
import { showToast } from "../../Utils/toast";

const RegisterScreen = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.getParent().setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.getParent().setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation]);
  // State cho các trường input
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  // State cho lỗi validate
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const { registerLoading, registerSuccess, registerError } = useAppSelector(
    (state) => state.auth
  );

  // Theo dõi trạng thái đăng ký để hiển thị thông báo và điều hướng
  useEffect(() => {
    if (registerSuccess) {
      // Alert.alert("Đăng ký thành công!", "Vui lòng xác thực tài khoản.");
      showToast({
        type: "success",
        text1: "Thành công",
        text2: "Đăng ký tài khoản thành công 🥰",
        position: "top",
        duration: 3000,
      });
      dispatch(resetRegisterState());
      navigation.navigate("LoginScreen");
    }
    if (registerError) {
      console.log("Lỗi đăng ký", registerError);
      // Alert.alert("Lỗi đăng ký", registerError);
      showToast({
        type: "error",
        text1: "Lỗi ",
        text2: "Lỗi đăng ký tài khoản 😡",
        position: "top",
        duration: 3000,
      });
      dispatch(resetRegisterState());
    }
  }, [registerSuccess, registerError, dispatch, navigation]);

  // Hàm validate dữ liệu
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    };

    if (!firstName.trim()) {
      newErrors.firstName = "* Họ không được để trống";
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "* Tên không được để trống";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "* Email không được để trống";
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      newErrors.email = "* Email không đúng định dạng";
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "* Số điện thoại không được để trống";
      isValid = false;
    } else if (!/^\+\d+$/.test(phoneNumber)) {
      newErrors.phoneNumber =
        "* Số điện thoại phải bắt đầu bằng + và chỉ chứa số";
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = "* Mật khẩu không được để trống";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const fetchRegister = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const registerData = {
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
        };
        // console.log("goi try catch lan 1");
        await dispatch(registerUser(registerData)).unwrap();

        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi ",
          text2: "Không thể đăng ký tài khoản",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to register:`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchRegister()]);
    } catch (error) {
      console.log("Failed to fetch data in RegisterScreen:", error);
      showToast({
        type: "error",
        text1: "Lỗi đăng ký",
        text2: "Không thể đăng ký tài khoản mới",
        position: "top",
        duration: 3000,
      });
    }
  };

  // Hàm xử lý khi nhấn nút "Tạo tài khoản"
  const handleRegister = async () => {
    if (validateForm()) {
      // Dữ liệu hợp lệ, chuẩn bị dữ liệu gửi lên backend
      try {
        await fetchData();
        // Gọi API đăng ký
      } catch (error) {
        console.log("Lỗi tại file RegisterScreen:", error);
        showToast({
          type: "error",
          text1: "Lỗi",
          text2: "Lỗi tại file RegisterScreen:",
          position: "top",
          duration: 3000,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapTitle}>
        <Text style={styles.title}>Đăng ký</Text>
      </View>
      <View style={styles.whiteFrame}>
        {/* Ô input Họ */}
        <View style={[styles.inputContainer, styles.inputContainerFirst]}>
          <Ionicons name="person-outline" size={20} color="#0090FF" />
          <TextInput
            placeholder="Họ"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        {errors.firstName ? (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        ) : null}

        {/* Ô input Tên đệm & Tên */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#0090FF" />
          <TextInput
            placeholder="Tên đệm & Tên"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        {errors.lastName ? (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        ) : null}

        {/* Ô input Email */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#0090FF" />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email ? (
          <Text style={styles.errorText}>{errors.email}</Text>
        ) : null}

        {/* Ô input Số điện thoại */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#0090FF" />
          <TextInput
            placeholder="Số điện thoại (VD: +84...)"
            keyboardType="phone-pad"
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>
        {errors.phoneNumber ? (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        ) : null}

        {/* Ô input Mật khẩu */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#0090FF" />
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}

        {/* Nút Tạo tài khoản */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={registerLoading}
        >
          <Text style={styles.buttonText}>
            {registerLoading ? "Đang đăng ký..." : "Tạo tài khoản"}
          </Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.textOr}>Hoặc đăng nhập bằng</Text>
        </View>

        {/* Nút đăng nhập bằng Google và Facebook */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#3b5998" }]}
          >
            <Text style={styles.socialButtonText}>FACEBOOK</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#db4437" }]}
          >
            <Text style={styles.socialButtonText}>GOOGLE</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contract}>
          <Text style={styles.contractText}>
            Với việc tạo tài khoản, tức là bạn đồng ý với
          </Text>
          <Text
            style={styles.contractLink}
            onPress={() => navigation.navigate("Term")}
          >
            điều khoản
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate("LoginScreen")}
          >
            Đăng nhập
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#00F598",
  },
  whiteFrame: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    width: 340,
    height: 646,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  wrapTitle: {
    width: "80%",
    textAlign: "left",
    display: "flex",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "white",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  inputContainerFirst: {
    marginTop: 40,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 30,
  },
  button: {
    backgroundColor: "#00F598",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 18,
  },
  textOr: {
    textAlign: "center",
    color: "gray",
    fontSize: 14,
    marginTop: 50,
    marginBottom: 0,
    fontSize: 13,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  socialButton: {
    width: "48%",
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  socialButtonText: {
    color: "#fff",
  },
  contract: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  contractText: {
    color: "gray",
    fontSize: 13,
  },
  contractLink: {
    color: "#00FF94",
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "gray",
    fontSize: 13,
  },
  footerLink: {
    color: "#00FF94",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
