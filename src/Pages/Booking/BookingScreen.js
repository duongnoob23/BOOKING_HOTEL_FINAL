import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Dùng icon từ Expo
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import PriceScreen from "../Hotels/PriceScreen";
import { useState } from "react";
import RoomCancelled from "./RoomCancelled";
import RoomBooking from "./RoomBooking";
import RoomBooked from "./RoomBooked";
import RoomCheckedOut from "./RoomCheckedOut";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import { fetchBookingStatus } from "../../Redux/Slice/hotelSlice";
import { showToast } from "../../Utils/toast";

const BookingScreen = ({ navigation }) => {
  // Lấy dữ liệu redux
  const { bookingStatus, loadingBS, errorBS } = useAppSelector(
    (state) => state.hotel
  );
  const { accessToken, isLoggedIn } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const Tab = createMaterialTopTabNavigator();

  const fetchBooking = async (retryCount = 1, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // console.log("goi try catch lan 1");
        await dispatch(fetchBookingStatus()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải dữ liệu Booking ",
          position: "top",
          duration: 3000,
        });
        console.log(
          `Attempt ${attempt} failed to fetch booking status :`,
          error
        );
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchBooking()]);
    } catch (error) {
      console.log("Failed to fetch data in BookingScreen:", error);
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải dữ liệu Booking ",
        position: "top",
        duration: 3000,
      });
    }
  };

  const handleRetry = () => {
    fetchData();
  };
  // Chỉ gọi API khi người dùng đã đăng nhập
  useEffect(() => {
    if (accessToken && isLoggedIn) {
      dispatch(fetchBookingStatus());
    }
    // Thêm sự kiện focus
    const unsubscribe = navigation.addListener("focus", () => {
      if (accessToken && isLoggedIn) {
        dispatch(fetchBookingStatus());
      }
    });
    // Cleanup listener khi component unmount
    return unsubscribe;
  }, [dispatch, accessToken, isLoggedIn, navigation]); // Thêm accessToken và isLoggedIn vào dependency array để gọi lại API nếu trạng thái đăng nhập thay đổi

  // Kiểm tra chưa đăng nhập
  if (!accessToken && !isLoggedIn) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="log-in-outline" size={48} color="#6B7280" />
        <Text style={styles.emptyText}>Đăng nhập để sử dụng tính năng này</Text>
      </View>
    );
  }

  // Kiểm tra dữ liệu đang tải hoặc chưa có
  if (loadingBS || !bookingStatus) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }

  // Phần còn lại giữ nguyên
  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View style={styles.header__tabs}>
        <TouchableOpacity
          style={[
            styles.header__tab,
            styles.header__tab__1,
            state.index === 0 && styles.active,
          ]}
          onPress={() => {
            navigation.navigate("Booked");
          }}
        >
          <Text
            style={[
              styles.header__tab__text,
              state.index === 0 && styles.activeText,
            ]}
          >
            Đã đặt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.header__tab, state.index === 1 && styles.active]}
          onPress={() => {
            navigation.navigate("Booking");
          }}
        >
          <Text
            style={[
              styles.header__tab__text,
              state.index === 1 && styles.activeText,
            ]}
          >
            Đang ở
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.header__tab, state.index === 2 && styles.active]}
          onPress={() => {
            navigation.navigate("CheckedOut");
          }}
        >
          <Text
            style={[
              styles.header__tab__text,
              state.index === 2 && styles.activeText,
            ]}
          >
            Đã trả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.header__tab,
            styles.header__tab__3,
            state.index === 3 && styles.active,
          ]}
          onPress={() => {
            navigation.navigate("Cancelled");
          }}
        >
          <Text
            style={[
              styles.header__tab__text,
              state.index === 3 && styles.activeText,
            ]}
          >
            Đã hủy
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!errorBS === null) {
    return (
      <View style={styles.sectionErorHL}>
        <TouchableOpacity style={styles.errorHL} onPress={() => handleRetry()}>
          <Text style={styles.errorHLText}>Thử lại </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.bookingHistoryScreen}>
      {/* <View style={styles.bookingHistoryScreen__searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#0090FF"
          style={styles.bookingHistoryScreen__searchIcon}
        />
        <TextInput
          style={styles.bookingHistoryScreen__searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
        />
        <TouchableOpacity>
          <Ionicons
            name="close"
            size={20}
            color="#999"
            style={styles.bookingHistoryScreen__clearIcon}
          />
        </TouchableOpacity>
      </View> */}

      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        initialRouteName="Booked"
      >
        <Tab.Screen
          name="Booked"
          component={RoomBooked}
          options={{ tabBarLabel: "Đang đặt " }}
        />
        <Tab.Screen
          name="Booking"
          component={RoomBooking}
          options={{ tabBarLabel: "Đã đặt " }}
        />
        <Tab.Screen
          name="CheckedOut"
          component={RoomCheckedOut}
          options={{ tabBarLabel: "Đã đặt " }}
        />
        <Tab.Screen
          name="Cancelled"
          component={RoomCancelled}
          options={{ tabBarLabel: "Đã hủy " }}
        />
      </Tab.Navigator>
    </View>
  );
};

// Styles giữ nguyên, đã có emptyContainer và emptyText
const styles = StyleSheet.create({
  bookingHistoryScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  bookingHistoryScreen__searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 40,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#d3d3d3",
  },
  bookingHistoryScreen__searchIcon: {
    marginRight: 10,
  },
  bookingHistoryScreen__searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  bookingHistoryScreen__clearIcon: {
    marginLeft: 10,
  },
  header__tabs: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  header__tab: {
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#0090FF",
    paddingHorizontal: 20,
  },
  header__tab__1: {
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  header__tab__3: {
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  header__tab__text: {
    fontSize: 14,
    color: "#007AFF",
  },
  active: {
    backgroundColor: "#0090FF",
  },
  activeText: {
    color: "white",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
    marginTop: 20,
  },
  sectionErorHL: {
    justifyContent: "center",
    alignItems: "center",
    // height: 100,
    backgroundColor: "white",
    flex: 1,
  },
  errorHL: {
    backgroundColor: "E5E5E5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "gray",
    padding: 20,
    paddingVertical: 10,
  },
  errorHLText: {
    color: "gray",
    fontSize: 16,
    fontWeight: "400",
  },
});

export default BookingScreen;
