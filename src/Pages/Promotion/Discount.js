import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector, useAppDispatch } from "../../Redux/hook";
import { fetchListPromotion } from "../../Redux/Slice/promotionSlice";
import { formatPrice } from "../../Utils/formarPrice";
import { Alert } from "react-native";
import {
  fetchBookingRoom,
  updateBookingPayload,
} from "../../Redux/Slice/hotelSlice";
import cloneDeep from "lodash/cloneDeep";
import { showToast } from "../../Utils/toast";

const Discount = ({ navigation, route }) => {
  const prePage = route?.params?.prePage || "";
  console.log("23>>>", route?.params);
  const { listPromotion, loadingPromotion, errorP } = useAppSelector(
    (state) => state.promotion
  );
  const { bookingPayload } = useAppSelector((state) => state.hotel);
  const { accessToken, isLoggedIn } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  console.log(accessToken);
  // Sắp xếp danh sách để mã đang dùng (dựa trên bookingPayload.couponId) lên đầu
  const sortedPromotions = [...listPromotion].sort((a, b) => {
    if (a.id === bookingPayload?.couponId) return -1;
    if (b.id === bookingPayload?.couponId) return 1;
    return 0;
  });

  const fetchDiscount = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const code = route?.params?.code;
        const totalPrice = route?.params?.totalPrice;

        if (!code || !totalPrice) {
          showToast({
            type: "error",
            text1: "Thiếu dữ liệu ",
            text2: "Thiếu mã và giá tiền cho hóa đơn",
            position: "top",
            duration: 3000,
          });
          return;
        }
        // console.log("goi try catch lan 1");
        await dispatch(fetchListPromotion({ code, totalPrice })).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải dữ liệu phiếu giảm giá ",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch discount:`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchDiscount()]);
    } catch (error) {
      console.log("Failed to fetch data in Discount :", error);
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải dữ liệu phiếu giảm giá.",
        position: "top",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  const handleRetry = () => {
    fetchData();
  };

  const handleChooseSale = (item) => {
    try {
      if (prePage === "OrderConfirm") {
        if (!item?.id || !item?.code) {
          Alert.alert("Lỗi", "Mã giảm giá không hợp lệ.");
          return;
        }

        const bookingPayload_ = { ...bookingPayload };
        bookingPayload_.couponId = item.id;
        bookingPayload_.couponCode = item.code;
        console.log("CCCCCCCCCCCCCCCCCCCCC", bookingPayload_);

        dispatch(updateBookingPayload(bookingPayload_));

        dispatch(fetchBookingRoom());

        navigation.navigate("OrderConfirm");
      }
      console.log(item);
    } catch (error) {
      Alert.alert("Lỗi", `Không thể xử lý mã giảm giá: ${error.message}`);
    }
  };

  // Chưa đăng nhập
  if (!accessToken && !isLoggedIn) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="log-in-outline" size={48} color="#6B7280" />
        <Text style={styles.emptyText}>
          Bạn cần đăng nhập để xem mã giảm giá
        </Text>
      </View>
    );
  }

  // Đang tải
  if (loadingPromotion) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Đang tải...</Text>
      </View>
    );
  }
  console.log("25>>>", sortedPromotions);
  // Giao diện chính
  return (
    <>
      {errorP === null ? (
        <View style={styles.discountCodes}>
          {sortedPromotions.length > 0 ? (
            sortedPromotions.map((item) => (
              <View key={item?.id} style={styles.discountCodes__item}>
                <Ionicons
                  name="gift-outline"
                  size={45}
                  color="#007BFF"
                  style={styles.discountCodes__itemIcon}
                />
                <View style={styles.discountCodes__itemContent}>
                  <Text style={styles.discountCodes__itemTitle}>
                    {item?.description}
                  </Text>
                  <Text style={styles.discountCodes__itemCode}>
                    {item?.code}
                  </Text>
                  <Text style={styles.discountCodes__itemExpiry}>
                    Số tiền đặt phòng thấp nhất{" "}
                    {formatPrice(item?.minBookingAmount)}
                  </Text>
                  <Text style={styles.discountCodes__itemExpiry}>
                    Hạn sử dụng: {item?.expirationDate}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.id === bookingPayload?.couponId
                      ? styles.actionButtonUsed
                      : styles.actionButtonUnused,
                  ]}
                  onPress={() => handleChooseSale(item)}
                  disabled={item.id === bookingPayload?.couponId}
                >
                  <Text style={styles.actionButtonText}>
                    {item.id === bookingPayload?.couponId
                      ? "Đang dùng"
                      : "Dùng ngay"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={50}
                color="#888888"
              />
              <Text style={styles.emptyText}>Bạn chưa có mã giảm giá nào</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.sectionErorHL}>
          <TouchableOpacity style={styles.errorHL} onPress={handleRetry}>
            <Text style={styles.errorHLText}>Thử lại </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  discountCodes: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  discountCodes__item: {
    flexDirection: "row",
    alignItems: "center", // Căn giữa để nút nằm gọn
    marginBottom: 20,
    paddingVertical: 10,
  },
  discountCodes__itemIcon: {
    marginRight: 10,
  },
  discountCodes__itemContent: {
    flex: 1,
  },
  discountCodes__itemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  discountCodes__itemCode: {
    fontSize: 14,
    color: "#007BFF",
    marginBottom: 5,
  },
  discountCodes__itemExpiry: {
    fontSize: 14,
    color: "#888888",
  },
  actionButton: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  actionButtonUnused: {
    backgroundColor: "#00F598", // Màu chủ đạo
  },
  actionButtonUsed: {
    backgroundColor: "#CCCCCC",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold",
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
    height: 100,
    backgroundColor: "white",
  },
  errorHL: {
    backgroundColor: "white",
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

export default Discount;
