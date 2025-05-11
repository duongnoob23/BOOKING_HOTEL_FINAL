import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import Ionicons from "react-native-vector-icons/Ionicons";
import getServiceIcon from "../../Components/Icon/getServiceIcon";
import {
  fetchBookingRoom,
  setNavigateFoodCart,
  updateBookingPayload,
} from "../../Redux/Slice/hotelSlice";
import SkeletonOrderConfirm from "../../Components/Skeleton/Hotels/SkeletonOrderConfirm";
import { formatPrice } from "../../Utils/formarPrice";
import { fetchListPromotion } from "../../Redux/Slice/promotionSlice";
import {
  fetchPaymentOrder,
  resetPaymentData,
} from "../../Redux/Slice/paymentSlice";
import ReusableModal from "../../Components/Modal/FlexibleModal/ReusableModal";
import cloneDeep from "lodash/cloneDeep";
import { showToast } from "../../Utils/toast";
const OrderConfirmScreen = ({ navigation }) => {
  const [paymentMethod, setPaymentMethod] = useState("ZaloPay");
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("confirm");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  // khai báo redux auth
  const { inforUserChange, infoUser } = useAppSelector((state) => state.auth);
  const { bookingData, bookingPayload, loadingBR, errorBR } = useAppSelector(
    (state) => state.hotel
  );
  console.log("24>>>", bookingPayload);
  // khai báo redux payment
  const { paymentData, loadingPayment, error } = useAppSelector(
    (state) => state.payment
  );

  console.log(">>>>> check dataa");
  console.log(bookingData);
  console.log(bookingPayload);
  const dispatch = useAppDispatch();
  const listRoom = bookingData?.roomBookedList;

  // set thuộc tính modal
  const showModal = (type, title, message) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const fetchPayment = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // console.log("goi try catch lan 1");
        await dispatch(fetchPaymentOrder()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi thanh toán ",
          text2: "Vui lòng bấm xác nhận đặt phòng lại",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch payment :`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchBooking = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // console.log("goi try catch lan 1");
        await dispatch(fetchBookingRoom(bookingPayload)).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải dữ liệu chi tiết hóa đơn  ",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch order :`, error);
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
      console.log("Failed to fetch data in OrderConfirm :", error);
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải dữ liệu chi tiết hóa đơn .",
        position: "top",
        duration: 3000,
      });
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchPayment()]);
    } catch (error) {
      console.log("Failed to fetch data in OrderConfirm :", error);
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải dữ liệu chi tiết hóa đơn .",
        position: "top",
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const bookingPayload_ = {
      ...bookingPayload,
      couponId: bookingData?.couponId || 0,
      couponCode: bookingData?.couponCode || "",
    };
    dispatch(updateBookingPayload(bookingPayload_));
  }, [bookingData]);

  useEffect(() => {
    // fetchData();
    dispatch(fetchBookingRoom(bookingPayload));
  }, [bookingPayload?.roomRequestList, dispatch]);

  const handleRetry = () => {
    fetchData();
  };
  // Reset paymentData khi vào màn hình
  useEffect(() => {
    dispatch(resetPaymentData());
    return () => {
      dispatch(resetPaymentData());
    };
  }, [dispatch]);

  // Theo dõi paymentData để điều hướng
  useEffect(() => {
    if (
      paymentData &&
      paymentData.orderUrl !== "" &&
      paymentData.appTransId !== ""
    ) {
      console.log("Dữ liệu API trả về:", paymentData);
      setIsLoading(false);
      navigation.navigate("PaymentWebViewScreenQuan", {
        orderUrl: paymentData.orderUrl,
      });
    } else if (!loadingPayment && error) {
      console.error("Payment error:", error);
      Alert.alert("Lỗi", error || "Lỗi tạo thanh toán");
      setIsLoading(false);
    }
  }, [paymentData, loadingPayment, error, navigation]);

  // trả về thể loại của dịch vụ
  const getUniqueServiceTypes = (serviceSelect) => {
    const serviceTypes = new Set(
      serviceSelect?.map((service) => service.serviceType) || []
    );
    return Array.from(serviceTypes);
  };

  // điều hướng tới orderFood
  const handleToOrderFood = () => {
    dispatch(setNavigateFoodCart("OrderConfirm"));
    navigation.navigate("OrderFood", { prePage: "OrderConfirm" });
  };

  // điều hướng tới Giảm giá 😡
  const handleToSale = () => {
    const totalPrice =
      +bookingData?.totalPriceRoom + +bookingData?.totalPriceService;
    const code = bookingPayload?.couponId;
    console.log("30>>>", code, totalPrice);
    // if (code && code !== 0 && totalPrice >= 0) {
    if (1) {
      navigation.navigate("Discount", {
        prePage: "OrderConfirm",
        code: code,
        totalPrice: totalPrice,
      });
    } else {
      showToast({
        type: "error",
        text1: "Lỗi thiếu dữ liệu",
        text2: "Không có Id mã giảm giá hoặc tổng giá ",
        position: "top",
        duration: 3000,
      });
      return;
    }
    // dispatch(fetchListPromotion({ code, totalPrice }));
  };

  // điều hướng tới chính sách
  const handleToPolicy = (item) => {
    navigation.navigate("AllPolicy", { data: item?.policyBooked });
  };

  // render danh sách phòng
  const renderListRoom = (item) => (
    <View style={styles.roomWrapper}>
      <View style={styles.roomInfo}>
        <Text style={styles.roomLabel}>Tên Phòng</Text>
        <Text style={styles.roomValue}>{item?.roomName}</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomLabel}>Loại phòng</Text>
        <Text style={styles.roomValue}>{item?.roomType}</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomLabel}>Số khách</Text>
        <Text style={styles.roomValue}>{item?.adults} người</Text>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomLabel}>Giá</Text>
        <Text style={styles.roomValue}>{formatPrice(item?.priceRoom)}</Text>
      </View>
      <View style={styles.roomInfoService}>
        <View style={styles.roomInfoServiceText}>
          <Text style={styles.roomLabel}>Dịch vụ</Text>
        </View>
        <View style={styles.serviceIcons}>
          {item?.serviceSelect?.length > 0 ? (
            getUniqueServiceTypes(item?.serviceSelect).map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.iconWrapper}
                onPress={handleToOrderFood}
              >
                {getServiceIcon(type)}
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity onPress={handleToOrderFood}>
              <Ionicons name="add-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.roomInfo}>
        <Text style={styles.roomLabel}>Điều kiện</Text>
        <TouchableOpacity
          onPress={() => handleToPolicy(item)}
          style={[styles.roomValue, { fontWeight: "bold", color: "#007AFF" }]}
        >
          <View>
            <Text style={{ fontWeight: "bold", color: "#007AFF" }}>
              Xem thêm
            </Text>
          </View>
          <View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color="#007AFF"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loadingBR) {
    return <SkeletonOrderConfirm />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mainContainer}>
        <View style={styles.headerSection}>
          <Text style={[styles.title, styles.titleCenter]}>
            Thông tin khách hàng
          </Text>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tên</Text>
              <Text style={styles.infoValue}>
                {(inforUserChange || infoUser)?.lastName}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {(inforUserChange || infoUser)?.email}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>
                +84 {(inforUserChange || infoUser)?.phone}
              </Text>
            </View>
          </View>
          <View style={styles.br} />
        </View>

        <View style={styles.headerSection}>
          <Text style={[styles.title, styles.titleCenter]}>
            Thông tin khách sạn
          </Text>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tên khách sạn</Text>
              <Text style={styles.infoValue}>{bookingData?.hotelName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vị trí khách sạn</Text>
              <Text style={styles.infoValue}>{bookingData?.hotelAddress}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tổng người lớn</Text>
              <Text style={styles.infoValue}>{bookingData?.totalAdults}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CheckIn</Text>
              <Text style={styles.infoValue}>{bookingData?.checkIn}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CheckOut</Text>
              <Text style={styles.infoValue}>{bookingData?.checkOut}</Text>
            </View>
          </View>
          <View style={styles.br} />
        </View>

        {errorBR === null ? (
          <View style={styles.roomsSection}>
            <Text style={styles.subTitle}>Phòng đặt</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {listRoom?.map((item, index) => (
                <View key={item?.uniqueId}>{renderListRoom(item)}</View>
              ))}
            </ScrollView>
            <View style={styles.br} />
          </View>
        ) : (
          <View style={styles.sectionErorHL}>
            <TouchableOpacity
              style={styles.errorHL}
              onPress={() => handleRetry()}
            >
              <Text style={styles.errorHLText}>Thử lại </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerSection}>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mã giảm giá</Text>
              {bookingPayload?.couponCode && (
                <TouchableOpacity
                  style={styles.wrapperInfoValueSale}
                  onPress={handleToSale}
                >
                  <Ionicons name="bookmark-outline" size={18} color="#007AFF" />
                  <Text style={styles.infoValueSale}>
                    {bookingPayload?.couponCode}
                  </Text>
                </TouchableOpacity>
              )}
              {!bookingPayload?.couponCode && (
                <TouchableOpacity
                  // style={styles.wrapperInfoValueSale}
                  onPress={handleToSale}
                >
                  <Ionicons name="add-outline" size={18} color="#007AFF" />
                  <Text style={styles.infoValueSale}>
                    {bookingPayload?.couponCode}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.headerSection}>
          <Text style={[styles.title, styles.titleCenter]}>Hóa đơn</Text>
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Giá tiền phòng</Text>
              <Text style={styles.infoValue}>
                {formatPrice(bookingData?.totalPriceRoom)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabelSale}>Giá tiền dịch vụ</Text>
              <Text style={styles.infoValue}>
                {formatPrice(bookingData?.totalPriceService)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mã giảm giá</Text>
              <Text style={styles.infoValue}>
                {formatPrice(bookingData?.priceCoupon)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Giá tiền cọc </Text>
              <Text style={styles.infoValue}>
                {formatPrice(bookingData?.priceDeposit)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Giá cuối cùng</Text>
              <Text style={styles.infoValue}>
                {formatPrice(bookingData?.finalPrice)}
              </Text>
            </View>
          </View>
          <View style={styles.br} />
        </View>
      </ScrollView>
      <View style={styles.footerSection}>
        <View style={styles.br} />
        <Text style={styles.subTitle}>Phương thức thanh toán</Text>
        <View style={styles.infoSectionLast}>
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod("ZaloPay")}
          >
            <View style={styles.radioCircle}>
              {paymentMethod === "ZaloPay" && (
                <View style={styles.selectedRadio} />
              )}
            </View>
            <Text style={styles.paymentText}>ZaloPay</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (isLoading || loadingPayment) && styles.buttonDisabled,
          ]}
          onPress={() =>
            showModal(
              "confirm",
              "Xác nhận",
              ` ${
                bookingData?.policyPayment
              } \n\nBạn sẽ thanh toán \n tiền cọc: ${formatPrice(
                bookingData?.priceDeposit
              )}  `
            )
          }
          disabled={isLoading || loadingPayment}
        >
          <Text style={styles.buttonText}>
            {isLoading || loadingPayment
              ? "Đang xử lý..."
              : "Xác nhận đặt phòng"}
          </Text>
        </TouchableOpacity>
      </View>

      <ReusableModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        confirmText={modalType === "confirm" ? "Xác nhận" : "OK"}
        cancelText="Hủy"
        onConfirm={() => {
          setModalVisible(false);
          handlePayment();
        }}
        onCancel={() => {
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default OrderConfirmScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  headerSection: {
    // Phần đầu cố định, không cần flex cụ thể vì sẽ chiếm không gian tự nhiên
  },
  roomsSection: {
    // flex: 1, // Chiếm không gian còn lại để ScrollView có thể cuộn
    // marginVertical: 10,
  },
  footerSection: {
    // Phần cuối cố định, không cần flex cụ thể vì sẽ chiếm không gian tự nhiên
  },
  title: {
    fontWeight: "400",
    color: "#000",
    marginBottom: 5,
    textAligin: "center",
  },
  titleCenter: {
    textAlign: "center",
    fontSize: 17,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginBottom: 5,
    textAlign: "center",
  },
  infoSection: {
    // marginBottom: 10,
    // flexDirection: "row",
    // justifyContent:"center"
  },
  infoSectionSale: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoSectionLast: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#000",
    marginBottom: 2,
  },
  roomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  roomInfoService: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  roomInfoServiceText: {
    width: "20%",
  },
  roomLabel: {
    fontSize: 14,
    color: "#666",
  },
  roomValue: {
    fontSize: 14,
    color: "#000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#007AFF",
  },
  paymentText: {
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#00F598",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "400",
  },
  br: {
    borderBottomColor: "#E5E5E5",
    borderBottomWidth: 1,
    marginVertical: 5,
  },
  roomWrapper: {
    // marginVertical: 20,
    borderBottomColor: "#E5E5E5",
    borderBottomWidth: 1,
    paddingVertical: 20,
  },
  serviceIcons: {
    width: "76%",
    flexDirection: "row",
    // alignItems: "flex-start",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  iconWrapper: {
    marginLeft: 3,
  },
  infoValueSale: {
    padding: 3,
    color: "#007AFF",
    fontSize: 12,
    marginBottom: 2,
    padding: 2,
    textAlign: "",
  },
  wrapperInfoValueSale: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
  },
  sectionErorHL: {
    justifyContent: "center",
    alignItems: "center",
    height: 150,
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
