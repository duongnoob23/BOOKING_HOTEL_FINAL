import React, { cloneElement, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Button,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Sử dụng FontAwesome cho icons
import { FlatList } from "react-native";
import { API_BASE_URL } from "../../Constant/Constant";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import {
  fetchAmenityList,
  fetchHotelById,
  fetchHotelByLocation,
  fetchHotelList,
  fetchLocationList,
  fetchServiceList,
  updateTempFilter,
  applyFilter,
  changeCheckOutDate,
  changeCheckInDate,
} from "../../Redux/Slice/hotelSlice";
import ModalLocationList from "../../Components/Modal/Home/ModalLocationList";
import cloneDeep from "lodash/cloneDeep";
import { Picker } from "@react-native-picker/picker";
import ModalCheckIn from "../../Components/Modal/Home/ModalCheckIn";
import ModalCheckOut from "../../Components/Modal/Home/ModalCheckOut";
import ModalGuestsAndRooms from "../../Components/Modal/Home/ModalGuestsAndRooms";
import { skeletonLoading } from "../../Redux/Slice/hotelSlice";
import { updateFilter } from "../../Redux/Slice/hotelSlice";
import { fetchListService } from "../../Redux/Slice/serviceSlice";
import { fetchUserInfo } from "../../Redux/Slice/authSlice";
import ReusableModal from "../../Components/Modal/FlexibleModal/ReusableModal";
import ModalBookingCancelled from "../../Components/Modal/Booking/ModalBookingCancelled";
import ModalDatePicker from "../../Components/Modal/Home/ModalDatePicker"; // Đã import
import { showToast } from "../../Utils/toast";

// import SkeletonHomeScreen from "../../Components/Skeleton/Home/SkeletonHomeScreen";
import SkeletonOrderConfirmScreen from "../../Components/Skeleton/Hotels/SkeletonOrderConfirm";
import SkeletonHomeScreen from "../../Components/Skeleton/Home/SkeletonHomeScreen";

const HomeScreen = ({ navigation }) => {
  const {
    hotelHistorySearch,
    hotelList,
    locationList,
    inforFilter,
    loadingHL,
    loadingLL,
    errorHL,
    errorLL,
  } = useAppSelector((state) => state.hotel); // lấy thông tin danh sách tìm kiếm sau khi search, danh sách ưu đãi cuối tuần, lịch sử tìm kiếm
  const dispatch = useAppDispatch();

  // console.log("3 ", hotelList);

  const [open, setOpen] = useState({
    Modal_1: false,
    Modal_CheckIn: false,
    Modal_CheckOut: false,
    Modal_GuestsAndRooms: false,
  }); // Modal đóng mở 4 chức năng tìm kiếm

  const continueSearch = hotelHistorySearch; // biến lưu dữ liệu danh sách tìm kiếm

  const fetchHotels = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // console.log("goi try catch lan 1");
        await dispatch(fetchHotelList()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải danh sách khách sạn ",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch hotel list:`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchLocations = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // console.log("goi try catch lan 1");
        await dispatch(fetchLocationList()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải danh sách địa điểm  ",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch location list:`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchHotels(), fetchLocations()]);
    } catch (error) {
      console.log("Failed to fetch data in HomeScreen:", error);
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải danh sách khách sạn hoặc địa điểm.",
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

  const handleToHotelDetails = (item) => {
    if (item && item !== "") {
      const currentDay = new Date();
      const nextDay = new Date();
      nextDay.setDate(currentDay.getDate() + 1);
      console.log("15", currentDay, nextDay);

      if (
        inforFilter.checkInDate === "" &&
        inforFilter.checkInDate?.length === 0
      ) {
        dispatch(changeCheckInDate(currentDay.toISOString()));
      }
      if (
        inforFilter.checkOutDate === "" &&
        inforFilter.checkOutDate?.length === 0
      ) {
        dispatch(changeCheckOutDate(nextDay.toISOString()));
      }

      navigation.navigate("HotelDetails", { item });
      console.log("1");
    } else {
      showToast({
        type: "error",
        text1: "Lõi thiếu dữ liệu ",
        text2: "Không có dữ liệu item truyền sang HotelDetails",
        position: "top",
        duration: 3000,
      });
      return;
    }
    // const id = item?.hotelId;
    // dispatch(fetchHotelById(id));
  }; // hàm chuyển sang hotel Detail, nên bắt try catch , kiểm tra xem có id không, nên gọi dispatch ở bên hotelDetails

  const handleCloseModal = (name) => {
    const open_ = cloneDeep(open);
    open_[name] = false;
    setOpen(open_);
  };

  const WidthtwoRowScrollView = 210 * Math.ceil(continueSearch.length / 2);

  const handleModalCheck = (name, value) => {
    const open_ = cloneDeep(open);
    open_[name] = value;
    setOpen(open_);
  }; // Hàm mở modal , với các modal chọn thời gian thì cần phải set lại thời gian hiển thị

  const formatToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }; // chuẩn hóa ngày tháng năm hiển thì YYYY-MM-DD

  const normalizeDate = (date) => {
    console.log();
    // Lấy ngày, tháng, năm theo múi giờ địa phương (UTC+7)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Tạo ngày mới với múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}T00:00:00.000+07:00`
    );
    return vietnamDate;
  };

  const handleConfirmDate = (name, date, onValidationResult) => {
    // Chuẩn hóa date và today để bỏ qua giờ/phút/giây
    console.log("12.1", date);
    // date = normalizeDate(date);
    const today = normalizeDate(new Date());
    console.log("12", date);
    console.log("12.2", today);
    // 0. Nếu là checkin
    if (name === "checkin") {
      // 1. So sánh: ngày check-in không được nhỏ hơn ngày hiện tại
      if (date <= today) {
        showToast({
          type: "warning", // hoặc "error", "info"
          text1: "Chọn lại ngày checkin",
          text2: "Ngày CheckIn phải lớn hơn hoặc bằng ngày hiện tại",
          position: "top",
          duration: 3000,
        });
        onValidationResult(false);
        // Alert.alert("Ngày CheckIn phải lớn hơn hoặc bằng ngày hiện tại");
        return;
      }

      // Format ngày check-in để lưu vào inforFilter
      // 2. Kiểm tra ngày check-out
      dispatch(changeCheckInDate(date.toISOString()));

      if (inforFilter?.checkOutDate && inforFilter?.checkOutDate !== "") {
        // Đã có check-out, chuyển check-out thành Date để so sánh
        const checkOutDate = new Date(inforFilter?.checkOutDate);

        if (checkOutDate <= date) {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          dispatch(changeCheckOutDate(nextDay.toISOString()));
        }
      } else {
        // 3. Chưa có check-out, đặt check-out = check-in + 1
        const nextDay = new Date(date);
        // nextDay.setDate(nextDay.getDate() + 1);
        // currentDay.setDate(currentDay.getDate() + 1);
        nextDay.setDate(date.getDate() + 1);
        // updatedFilter.checkout = formatToDDMMYYYY(nextDay);
        dispatch(changeCheckOutDate(nextDay.toISOString()));
      }

      // Cập nhật filter vào Redux
      handleModalCheck("Modal_CheckIn", false);
    }

    // 0. Nếu là checkout
    if (name === "checkout") {
      // 1. So sánh: check-out không được nhỏ hơn ngày hiện tại
      if (date <= today) {
        showToast({
          type: "warning", // hoặc "error", "info"
          text1: "Chọn lại ngày checkout",
          text2: "Ngày CheckOut phải lớn hơn ngày hiện tại",
          position: "top",
          duration: 3000,
        });
        onValidationResult(false);
        // Alert.alert("Ngày CheckOut phải lớn hơn ngày hiện tại");
        return;
      }
      if (
        inforFilter?.checkin &&
        inforFilter?.checkin !== "" &&
        inforFilter?.checkInDate &&
        inforFilter?.checkInDate !== ""
      ) {
        const checkInDate = new Date(inforFilter?.checkInDate);
        if (date <= checkInDate) {
          showToast({
            type: "warning", // hoặc "error", "info"
            text1: "Chọn lại ngày checkout",
            text2: "Ngày CheckOut phải lớn hơn ngày CheckIn",
            position: "top",
            duration: 3000,
          });
          onValidationResult(false);
          // Alert.alert("Ngày CheckOut phải lớn hơn ngày CheckIn");
          return;
        }
      }

      console.log("13", date);
      // Format ngày check-out để lưu vào inforFilter
      // changeCheckOutDate(date);
      dispatch(changeCheckOutDate(date.toISOString()));
      console.log("6", date.toISOString());
      // Cập nhật filter vào Redux
      // dispatch(
      //   updateFilter({ ...inforFilter, checkout: formattedCheckOutDate })
      // );
      onValidationResult(true);
      handleModalCheck("Modal_CheckOut", false);
    }
  };

  const handleFilterHotel = () => {
    if (+inforFilter?.locationId === 0) {
      showToast({
        type: "warning", // hoặc "error", "info"
        text1: "Thiếu địa điểm ",
        text2: "Vui lòng chọn địa điểm!",
        position: "top",
        duration: 3000,
      });
      return;
    }

    // lỗi
    const currentDay = new Date();
    const nextDay = new Date();
    nextDay.setDate(currentDay.getDate() + 1);
    console.log("15", currentDay, nextDay);

    if (
      inforFilter.checkInDate === "" &&
      inforFilter.checkInDate?.length === 0
    ) {
      dispatch(changeCheckInDate(currentDay.toISOString()));
    }
    if (
      inforFilter.checkOutDate === "" &&
      inforFilter.checkOutDate?.length === 0
    ) {
      dispatch(changeCheckOutDate(nextDay.toISOString()));
    }
    dispatch(skeletonLoading());
    navigation.navigate("ListHotelLocation");
  }; // hàm gọi ListHotelByLocation search từ nút tìm kiếm
  // NOTE CÒN HÀM NÀY XỬ LÝ CUỐI CÙNG
  console.log("2", inforFilter);
  const handleContinueSearch = (item) => {
    // console.log(item);
    const inforFilter_ = {
      locationId: item?.locationId,
      checkin: item?.checkIn,
      checkout: item?.checkOut,
      adults: item?.adults,
      children: item?.children,
      amenityIds: [],
      serviceIds: [],
      sortById: 1,
    };
    // console.log("inforFIlter Fake", inforFilter_);
    dispatch(skeletonLoading());
    dispatch(fetchHotelByLocation(inforFilter_));

    navigation.navigate("ListHotelLocation");
  }; // Hàm gọi HotelDetails từ HistorySearch

  // console.log("1", inforFilter);

  if (loadingHL || loadingLL) {
    return <SkeletonHomeScreen />;
  }

  const HotelRequestList = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.dealItem}
        onPress={() => handleToHotelDetails(item)}
      >
        <View style={styles.dealImage}>
          <Image
            source={{
              uri: `${item.imageUrl}`,
            }}
            style={styles.image}
          />
        </View>
        <View style={styles.dealDetails}>
          <Text style={styles.dealName}>{item.hotelName}</Text>
          <View style={styles.dealReviews}>
            <Icon
              style={styles.iconStart}
              name="star"
              size={24}
              color="#EBA731"
            />
            <Text style={styles.dealPoint}>{item.hotelRating} </Text>
            <Text style={styles.dealReviewsText}>
              Đánh giá ({item.sumReview}){" "}
            </Text>
          </View>
          <Text style={styles.dealDesc}>{item.promotionName}</Text>
          <View style={styles.dealFooter}>
            <Text style={styles.dealSale}>Giảm 25%</Text>
            <Text style={styles.dealPrice}> {item.price}</Text>
            <TouchableOpacity onPress={() => handleToHotelDetails(item)}>
              <Text style={styles.dealBooking}>Đặt ngay </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }; // phần hiển thị giao diện ưu đãi cuối cùng , cần phải chỉnh sửa lại để hiển thị nhiều loại ưu đãi trong dữ liệu hơn
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <Map /> */}
      <View style={styles.header}>
        <Text style={styles.title}>Tìm Phòng</Text>
        {/* <TouchableOpacity onPress={() => handleToInfoConfirm()}>
          <Icon name="filter" size={24} color="#007AFF" />
        </TouchableOpacity> */}
      </View>
      {/* Body */}
      <ScrollView style={styles.body} scrollEnabled={!open.Modal_1}>
        <View style={styles.hotelLabelContainer}>
          <Text style={styles.hotelLabel}>Khách Sạn</Text>
        </View>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => handleModalCheck("Modal_1", true)}
        >
          <Icon name="map-marker" size={24} color="#0090FF" />
          <Text style={styles.inputText}>
            {inforFilter.locationId !== "0"
              ? locationList?.find(
                  (item) => item.id.toString() === inforFilter.locationId
                )?.name || "Bạn muốn ở đâu"
              : "Bạn muốn ở đâu"}
          </Text>
        </TouchableOpacity>
        <ModalLocationList
          visible={open.Modal_1} // Thay position bằng visible
          onClose={() => handleCloseModal("Modal_1")}
          onSelect={(locationId) =>
            dispatch(updateFilter({ ...inforFilter, locationId: locationId }))
          }
          handleRetry={handleRetry}
        />
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => handleModalCheck("Modal_CheckIn", true)}
        >
          <Icon name="calendar" size={24} color="#0090FF" />
          {inforFilter?.checkin === "" ? (
            <Text style={styles.inputText}>Ngày & giờ nhận phòng</Text>
          ) : (
            <Text style={styles.inputText}>{inforFilter?.checkin}</Text>
          )}
          <Icon
            name="angle-down"
            size={20}
            color="#0090FF"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => handleModalCheck("Modal_CheckOut", true)}
        >
          <Icon name="calendar" size={24} color="#0090FF" />

          {inforFilter?.checkout !== "" ? (
            <Text style={styles.inputText}>{inforFilter?.checkout}</Text>
          ) : (
            <Text style={styles.inputText}>Ngày & giờ thanh toán</Text>
          )}
          <Icon
            name="angle-down"
            size={20}
            color="#0090FF"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <ModalDatePicker
          visible={open.Modal_CheckIn}
          onClose={() => handleCloseModal("Modal_CheckIn")}
          onConfirm={handleConfirmDate}
          title="Chọn ngày nhận phòng"
          mode="checkin"
        />

        <ModalDatePicker
          visible={open.Modal_CheckOut}
          onClose={() => handleCloseModal("Modal_CheckOut")}
          onConfirm={handleConfirmDate}
          title="Chọn ngày trả phòng"
          mode="checkout"
        />

        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => handleModalCheck("Modal_GuestsAndRooms", true)}
        >
          <Icon name="building" size={24} color="#0090FF" />
          <Text style={styles.inputText}>
            {inforFilter.adults} Người lớn, {inforFilter.children} Trẻ em,{" "}
            {inforFilter.roomNumber} Phòng
          </Text>
          <Icon
            name="angle-down"
            size={20}
            color="#0090FF"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <ModalGuestsAndRooms
          visible={open.Modal_GuestsAndRooms}
          onClose={handleModalCheck}
          // inforFilter={inforFilter}
          // setInforFilter={setInforFilter}
        />
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => handleFilterHotel()}
        >
          <Text style={styles.newButtonText}> Tìm kiếm </Text>
        </TouchableOpacity>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TIẾP TỤC TÌM KIẾM CỦA BẠN</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>XEM TẤT CẢ</Text>
            </TouchableOpacity>
          </View>

          {errorHL === null ? (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View
                  style={[
                    styles.twoRowScrollView,
                    { width: WidthtwoRowScrollView },
                  ]}
                >
                  {continueSearch?.map((item, index) => {
                    return (
                      <TouchableOpacity
                        onPress={() => handleContinueSearch(item)}
                        key={index}
                        style={styles.recentSearchItem}
                      >
                        <Image
                          source={{
                            uri: `${item?.image}`,
                          }}
                          style={styles.recentSearchImage}
                        />
                        <View style={styles.recentSearchDetails}>
                          <Text style={styles.recentSearchText}>
                            {item?.location}
                          </Text>
                          <Text style={styles.recentSearchSubText}>
                            Từ {item?.checkIn} đến {item?.checkOut} ,
                            {item?.adults}
                            Người lớn , {item?.children} Trẻ em
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
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
        </View>

        {Object.keys(hotelList)?.map((promotionName) => (
          <View key={promotionName} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {promotionName.toUpperCase()}
              </Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>XEM TẤT CẢ</Text>
              </TouchableOpacity>
            </View>
            {errorHL ? (
              <View style={styles.sectionErorHL}>
                <TouchableOpacity style={styles.errorHL} onPress={handleRetry}>
                  <Text style={styles.errorHLText}>Thử lại </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {hotelList[promotionName] &&
                  hotelList[promotionName].map((item, index) => (
                    <HotelRequestList key={index} item={item} />
                  ))}
              </ScrollView>
            )}
          </View>
        ))}
        <View style={styles.lastSection}></View>
        <View>
          <Text>{"\n\n"}</Text>
        </View>
        {/* <View></View> */}
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;

// const styles = StyleSheet.create({});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#000000",
  },
  body: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  hotelLabelContainer: {
    backgroundColor: "#0090FF",
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  hotelLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "400",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    position: "relative",
    // borderWidth: 1,
    // borderColor: "#E0E0E0",
    // borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 8,
  },
  inputText: {
    flex: 1,
    marginLeft: 15,
    color: "black",
    fontWeight: "400",
    fontSize: 18,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  newButton: {
    backgroundColor: "#00F598",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  newButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: 400,
  },
  searchButton: {
    backgroundColor: "black",
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "gray",
    textTransform: "uppercase",
  },
  viewAllText: {
    fontSize: 14,
    color: "#007AFF",
  },
  twoRowScrollView: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  recentSearchItem: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    alignItems: "center",
    width: 250,
    height: 70,
    marginBottom: 10,
  },
  recentSearchImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  recentSearchDetails: {
    marginLeft: 10,
    flex: 1,
  },
  recentSearchText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
  },
  recentSearchSubText: {
    fontSize: 10,
    color: "#666666",
    marginTop: 2,
  },
  dealItem: {
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginRight: 10,
    width: 250,
    backgroundColor: "#EFEFEF",
  },
  dealImage: {
    width: 250,
    height: 150,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 240,
    height: 140,
    borderRadius: 5,
  },
  dealDetails: {
    marginLeft: 8,
    marginRight: 10,
    width: "100%",
  },
  dealName: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    marginBottom: 5,
    color: "black",
  },
  dealReviews: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5,
  },
  iconStart: {
    marginRight: 10,
  },
  dealPoint: {
    color: "red",
    fontWeight: "400",
    marginRight: 10,
    fontSize: 12,
  },

  dealReact: {
    fontSize: 12,
  },
  dealReviewsText: {
    fontSize: 12,
  },
  dealLocation: {
    color: "black",
    marginRight: 12,
  },
  dealLocationName: {
    fontSize: 12,
  },
  dealFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  dealSale: {
    color: "#EBA731",
    fontWeight: "bold",
    fontSize: 14,
  },
  dealPrice: {
    fontWeight: "600",
    fontSize: 14,
  },
  dealDesc: {
    fontSize: 12,
    fontWeight: 400,
    marginBottom: 5,
  },
  dealBooking: {
    fontSize: 14,
    fontWeight: 400,
    borderRadius: 10,
    backgroundColor: "#00F598",
    color: "white",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  dealText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 5,
    textAlign: "center",
  },
  searchButton: {
    marginVertical: 15,
    borderRadius: 8,
    overflow: "hidden", // Đảm bảo gradient không bị cắt bởi borderRadius
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    // flex: 1,
    // backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền mờ
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    maxHeight: "800",
  },
  modalContent: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 10,
    padding: 20,
    maxHeight: "60%", // Giới hạn chiều cao của modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  locationText: {
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#0090FF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    height: 150,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#0090FF",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  lastSection: {
    // marginBottom: 20,
    // paddingBottom: 50,
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

//  const getData = async () => {
//    try {
//      const response = await fetch(`${API_BASE_URL}/api/hotel/home`, {
//        method: "GET",
//        headers: {
//          "Content-Type": "application/json",
//        },
//      });
//      if (response) {
//        const data = await response.json();
//        // console.log("Dữ liệu từ API:", data);
//        // console.log(data.data[0].hotelRequestList);
//        setHotelRequestList(data.data[0].hotelRequestList);
//      } else {
//      }
//    } catch (error) {
//      console.error("Lỗi khi gọi API:", error);
//    }
//  };

// const [inforFilter, setInforFilter] = useState({
//   locationId: "0",
//   checkin: checkinDate,
//   checkout: checkoutDate,
//   adults: 0,
//   children: 0,
//   roomNumber: 1,
//   amenityIds: [],
//   serviceIds: [],
// });

// tạo skeleton cho HomeScreen, bắt loadingLL, loadingHL, errorHl, errorLL
