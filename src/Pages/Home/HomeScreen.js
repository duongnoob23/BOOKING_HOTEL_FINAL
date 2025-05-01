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
const HomeScreen = ({ navigation }) => {
  const {
    hotelHistorySearch,
    hotelList,
    locationList,
    hotelDetail,
    hotelByLocation,
    loading,
    error,
    inforFilter,
  } = useAppSelector((state) => state.hotel);

  const { infoUser } = useAppSelector((state) => state.auth);

  const [open, setOpen] = useState({
    Modal_1: false,
    Modal_CheckIn: false,
    Modal_CheckOut: false,
    Modal_GuestsAndRooms: false,
  });

  const [modalPosition, setModalPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [modalVisible, setModalVisible] = useState(true);
  const [modalType, setModalType] = useState("error");

  const continueSearch = hotelHistorySearch;
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
  const [selectDay, setSelectDay] = useState({
    day: 4,
    month: 4,
    year: 2025,
  });

  // console.log(">>>>> 104 HomeScreen inforFilter", inforFilter);
  // console.log("----- 105 HomeScreen selectDay", selectDay);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchServiceList());
    dispatch(fetchAmenityList());
    dispatch(fetchHotelList());
    dispatch(fetchLocationList());
  }, [dispatch]);

  // useEffect(() => {
  //   dispatch(fetchHotelList());
  // }, [hotelHistorySearch]);

  const handleToHotelDetails = (item) => {
    const id = item?.hotelId;
    dispatch(fetchHotelById(id));
    navigation.navigate("HotelDetails", { item });
  };

  // console.log("hotelHistorySearch", hotelHistorySearch);

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
            <TouchableOpacity>
              <Text style={styles.dealBooking}>Đặt ngay </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const inputContainerRef = useRef(null);

  const handleOpenModal = (name) => {
    const open_ = cloneDeep(open);
    open_[name] = true;
    setOpen(open_);

    if (inputContainerRef.current) {
      inputContainerRef.current.measure((fx, fy, width, height, px, py) => {
        setModalPosition({ top: px + 2 * height, left: 0, width: "100%" });
      });
    }
  };

  const handleCloseModal = (name) => {
    const open_ = cloneDeep(open);
    open_[name] = false;
    setOpen(open_);
  };

  const WidthtwoRowScrollView = 210 * Math.ceil(continueSearch.length / 2);

  const handleModalCheck = (name, value) => {
    const open_ = cloneDeep(open);
    open_[name] = value;

    if (name === "Modal_CheckIn" || name === "Modal_CheckOut") {
      const day =
        inforFilter[name === "Modal_CheckIn" ? "checkin" : "checkout"];
      setSelectDay({
        day: +day.split("-")[2],
        month: +day.split("-")[1],
        year: +day.split("-")[0],
      });
    }

    setOpen(open_);
  };

  const formatToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleConfirmDate = (name) => {
    const formattedDate = `${selectDay.year}-${String(selectDay.month).padStart(
      2,
      "0"
    )}-${String(selectDay.day).padStart(2, "0")}`;
    const today = new Date();
    const dateToday = formatToYYYYMMDD(today);
    const date1 = new Date(dateToday);
    const date2 = new Date(formattedDate);

    // Kiểm tra ngày check-in
    if (name === "checkin") {
      if (date2 < date1) {
        Alert.alert("Ngày CheckIn phải lớn hơn ngày hiện tại");
        return;
      }

      // Cập nhật filter
      let updatedFilter = { ...inforFilter, checkin: formattedDate };

      // Nếu đã có check-out, kiểm tra tính hợp lệ
      if (inforFilter.checkout) {
        const checkoutDate = new Date(inforFilter.checkout);
        if (checkoutDate <= date2) {
          // Check-out không hợp lệ, đặt thành check-in + 1
          const nextDay = new Date(date2);
          nextDay.setDate(date2.getDate() + 1);
          updatedFilter.checkout = formatToYYYYMMDD(nextDay);
        }
      } else {
        // Chưa có check-out, đặt thành check-in + 1
        const nextDay = new Date(date2);
        nextDay.setDate(date2.getDate() + 1);
        updatedFilter.checkout = formatToYYYYMMDD(nextDay);
      }

      dispatch(updateFilter(updatedFilter));
      handleModalCheck("Modal_CheckIn", false);
    }

    // Kiểm tra ngày check-out
    if (name === "checkout") {
      if (date2 <= date1) {
        Alert.alert("Ngày CheckOut phải lớn hơn ngày hiện tại");
        return;
      }

      // Nếu đã có check-in, kiểm tra check-out > check-in
      if (inforFilter.checkin) {
        const checkinDate = new Date(inforFilter.checkin);
        if (date2 <= checkinDate) {
          Alert.alert("Ngày CheckOut phải lớn hơn ngày CheckIn");
          return;
        }
      }

      // Cập nhật filter
      dispatch(updateFilter({ ...inforFilter, checkout: formattedDate }));
      handleModalCheck("Modal_CheckOut", false);
    }
  };

  const handleFilterHotel = () => {
    dispatch(skeletonLoading());
    dispatch(fetchHotelByLocation(inforFilter));
    console.log(">>> run 0");
    navigation.navigate("ListHotelLocation");
  };

  const handleToInfoConfirm = () => {
    // dispatch(fetchUserInfo());
    navigation.navigate("TestModal");
  };

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
  };
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
          ref={inputContainerRef}
          onPress={() => handleOpenModal("Modal_1")}
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
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => handleModalCheck("Modal_CheckIn", true)}
        >
          <Icon name="calendar" size={24} color="#0090FF" />
          <Text style={styles.inputText}>{inforFilter.checkin}</Text>
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
          <Text style={styles.inputText}>{inforFilter.checkout}</Text>
          <Icon
            name="angle-down"
            size={20}
            color="#0090FF"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        <ModalCheckIn
          visible={open.Modal_CheckIn}
          onClose={handleModalCheck}
          selectDay={selectDay}
          setSelectDay={setSelectDay}
          confirm={handleConfirmDate}
        />
        <ModalCheckOut
          visible={open.Modal_CheckOut}
          onClose={handleModalCheck}
          selectDay={selectDay}
          setSelectDay={setSelectDay}
          confirm={handleConfirmDate}
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
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ƯU ĐÃI CUỐI TUẦN</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>XEM TẤT CẢ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {hotelList &&
              hotelList.map((item, index) => {
                return <HotelRequestList key={index} item={item} />;
              })}
          </ScrollView>
        </View>
        <View style={styles.lastSection}></View>
        {open.Modal_1 && (
          <ModalLocationList
            position={modalPosition}
            onClose={() => handleCloseModal("Modal_1")}
            onSelect={(locationId) =>
              // setInforFilter({ ...inforFilter, locationId })
              dispatch(updateFilter({ ...inforFilter, locationId: locationId }))
            }
          />
        )}
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

{
  /* <Modal
            animationType="slide"
            transparent={true}
            visible={open.Modal_1}
            onRequestClose={() => handleCloseModal("Modal_1")} 
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn địa điểm</Text>

                <FlatList
                  data={locations}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.locationItem}
                      onPress={() => {
                      
                        setInforFilter({
                          ...inforFilter,
                          locationId: item.id.toString(),
                        });
                        handleCloseModal("Modal_1");
                      }}
                    >
                      <Icon name="map-marker" size={24} color="#0090FF" />
                      <Text style={styles.locationText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => handleCloseModal("Modal_1")}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */
}

{
  /* {open.Modal_1 && (
          <TouchableWithoutFeedback onPress={() => handleCloseModal("Modal_1")}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <ModalLocationList
                  onClose={() => handleCloseModal("Modal_1")}
                  onSelect={(locationId) =>
                    setInforFilter({ ...inforFilter, locationId })
                  }
                />
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )} */
}
