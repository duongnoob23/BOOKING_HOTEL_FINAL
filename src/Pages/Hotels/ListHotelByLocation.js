import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";

import Icon from "@expo/vector-icons/FontAwesome"; // Sử dụng FontAwesome cho biểu tượng
import Ionicons from "react-native-vector-icons/Ionicons";
import SkeletonListHotelByLocation from "../../Components/Skeleton/Home/SkeletonListHotelByLocation";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import ModalAmenity from "../../Components/Modal/Home/ModalAmenity";
import ModalSort from "../../Components/Modal/Home/ModalSort";
import {
  fetchAmenityList,
  fetchHotelById,
  fetchHotelByLocation,
  fetchHotelList,
  fetchServiceList,
} from "../../Redux/Slice/hotelSlice";
import ModalFilter from "../../Components/Modal/Home/ModalFilter";
import { showToast } from "../../Utils/toast";
const ListHotelByLocation = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const {
    tempFilter,
    sortList,
    amenityList,
    filterList,
    hotelByLocation,
    inforFilter,
    loadingHBL,
    errorHBL,
    loadingSL,
    errorSL,
    loadingAL,
    errorAL,
  } = useAppSelector((state) => state.hotel);

  // console.log("18 amenityList", hotelByLocation);

  // console.log("16>>>", tempFilter.amenityIds, inforFilter.serviceIds);
  // console.log("17>>>", inforFilter.amenityIds, inforFilter.serviceIds);
  console.log("19>>>", inforFilter);
  // giá trị ban đầu kiểm soát bật tắt các modal
  const modalDefault = {
    Amenity: false,
    FilterBy: false,
    SortBy: false,
  };

  console.log("19>>>", inforFilter);
  // giá trị bật tắt modal
  const [modalVisible, setModalVisible] = useState({
    modalDefault,
  });

  const dispatch = useAppDispatch();

  // Hàm gọi API lấy danh sách dịch vụ (fetchServiceList) với retry
  const fetchServices = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        await dispatch(fetchServiceList()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải danh sách dịch vụ",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch service list:`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Hàm gọi API lấy danh sách tiện nghi (fetchAmenityList) với retry
  const fetchAmenities = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        await dispatch(fetchAmenityList()).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải danh sách tiện nghi",
          position: "top",
          duration: 3000,
        });
        console.log(`Attempt ${attempt} failed to fetch amenity list:`, error);
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Hàm gọi API lấy danh sách khách sạn theo địa điểm (fetchHotelByLocation) với retry
  const fetchHotelsByLocation = async (retryCount = 2, delay = 1000) => {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        await dispatch(fetchHotelByLocation(inforFilter)).unwrap();
        return;
      } catch (error) {
        showToast({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: "Không thể tải danh sách khách sạn theo địa điểm",
          position: "top",
          duration: 3000,
        });
        console.log(
          `Attempt ${attempt} failed to fetch hotels by location:`,
          error
        );
        if (attempt === retryCount) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Hàm gọi đồng thời cả 3 API
  const fetchData = async () => {
    try {
      await Promise.all([fetchHotelsByLocation()]);
    } catch (error) {
      showToast({
        type: "error",
        text1: "Lỗi tải dữ liệu",
        text2: "Không thể tải dữ liệu dịch vụ, tiện nghi hoặc khách sạn.",
        position: "top",
        duration: 3000,
      });
      console.log("Failed to fetch data in ListHotelByLocation:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    dispatch,
    inforFilter.amenityIds,
    inforFilter.sortById,
    inforFilter.serviceIds,
  ]); // Chỉ phụ thuộc vào dispatch, không cần phụ thuộc vào inforFilter vì fetchHotelsByLocation đã xử lý

  // Hàm retry để gọi lại cả 3 API khi người dùng nhấn "Thử lại"
  const handleRetry = () => {
    fetchData();
  };

  // gọi api để lấy danh sách khách sạn theo yêu cầu, danh sách tiện nghi,dịch vụ
  // useEffect(() => {
  //   dispatch(fetchHotelList()); // kiểm tra lại xem gọi ở đây có bị dư thừa ko vì trang này gần như không dùng đến ,các dữ liệu của fetchHotelList

  //   // phải gọi 2 api này để lấy danh sách dịch vụ, tiên nghi
  //   //  dispatch(fetchServiceList());
  //   //  dispatch(fetchAmenityList());
  //   dispatch(fetchHotelByLocation(inforFilter));
  // }, [
  //   inforFilter.amenityIds,
  //   inforFilter.sortById,
  //   inforFilter.serviceIds,
  //   dispatch,
  // ]);

  // console.log(">>> 51 listByHotel", hotelByLocation);

  const selectedAmenities = tempFilter.amenityIds
    .map((id) => {
      const amenity = amenityList.find((item) => item.id === id);
      return amenity ? amenity.name : null;
    })
    .filter((name) => name !== null);

  // Lấy danh sách tên dịch vụ đã chọn
  const selectedServices = tempFilter.serviceIds
    .map((id) => {
      const service = filterList.find((item) => item.id === id);
      return service ? service.name : null;
    })
    .filter((name) => name !== null);
  // khi chưa có dữ liệu thì hiện skeleton
  if (loadingHBL) {
    return <SkeletonListHotelByLocation />;
  }
  const selectedSort =
    sortList.find((item) => item.id === tempFilter.sortById)?.name ||
    "Không xác định";
  //   console.log(">>> 123 ListLocationi", hotelByLocation);

  // Ánh xạ tên tiện nghi thành icon
  const getIconForAmenity = (amenityName) => {
    const nameIcons = {
      "Nhìn ra thành phố": "eye-outline",
      "Phòng tắm riêng": "water-outline",
      "Đồ vệ sinh cá nhân miễn phí": "brush-outline",
      "Két an toàn": "lock-closed-outline",
      "Nhà vệ sinh": "water-outline",
      "Lò sưởi": "flame-outline",
      "Bồn tắm hoặc Vòi sen": "water-outline",
      "Khăn tắm": "bandage-outline",
      "Ra trải giường": "bed-outline",
      "Ổ điện gần giường": "cube-outline",
      "Sàn lát gạch/đá cẩm thạch": "cube-outline",
      "Bàn làm việc": "cube-outline",
      "Ghế cao dành cho trẻ em": "accessibility-outline",
      "Khu vực tiếp khách": "accessibility-outline",
      TV: "tv-outline",
      Dép: "footsteps-outline",
      "Tủ lạnh": "snow-outline",
      "Máy pha trà/cà phê": "cafe-outline",
      "Máy sấy tóc": "cube-outline",
      "Dịch vụ báo thức": "alarm-outline",
      "Ấm đun nước điện": "flash-outline",
      "Truyền hình cáp": "videocam-outline",
      "Két an toàn cỡ laptop": "laptop-outline",
      "Tủ hoặc phòng để quần áo": "shirt-outline",
      "Các tầng trên chỉ lên được bằng cầu thang": "cube-outline",
      "Giấy vệ sinh": "document-outline",
      "Máy điều hòa độc lập cho từng phòng": "snow-outline",
      "Bánh mì trứng": "egg-outline",
      "Phở bò": "egg-outline",
      "Bún riêu": "fish-outline",
      "Cháo gà": "nutrition-outline",
      "Bánh cuốn": "leaf-outline",
      "Cơm tấm sườn bì chả": "fast-food-outline",
      "Canh chua cá lóc": "fish-outline",
      "Gà kho gừng": "nutrition-outline",
      "Cá kho tộ": "fish-outline",
      "Bò xào lúc lắc": "flame-outline",
      "Lẩu hải sản": "fish-outline",
      "Tôm nướng muối ớt": "flame-outline",
      "Bò bít tết": "flame-outline",
      "Cua rang me": "fish-outline",
      "Mực xào sa tế": "fish-outline",
      "Salad cá ngừ": "nutrition-outline",
      "Sushi cá hồi": "fish-outline",
      "Hàu nướng phô mai": "fish-outline",
      "Sườn BBQ": "flame-outline",
      "Gỏi cuốn": "leaf-outline",
      Massage: "hand-right-outline",
      "Xông hơi": "thermometer-outline",
      "Phòng gym": "barbell-outline",
      "Đưa đón sân bay": "airplane-outline",
      "Thuê xe": "car-sport-outline",
      Taxi: "car-outline",
      "Dọn phòng": "brush-outline",
      "Giặt ủi": "shirt-outline",
      "Trang trí phòng đặc biệt": "sparkles-outline",
    };
    return nameIcons[amenityName] || "ellipse-outline";
  };

  // Ánh xạ tên dịch vụ thành icon
  const getIconForService = (name) => {
    switch (name) {
      case "Wi-fi miễn phí":
        return "wifi-outline";
      case "Phòng gym":
        return "barbell-outline";
      case "Thích hợp trẻ em":
        return "happy-outline";
      case "Bữa sáng miễn phí":
        return "restaurant-outline";
      default:
        return "ellipse-outline";
    }
  };

  // Ánh xạ tên tiêu chí sắp xếp thành icon
  const getIconForSort = (name) => {
    switch (name) {
      case "Giá tăng dần":
        return "cash-outline";
      case "Giá giảm dần":
        return "cash-outline";
      case "Đánh giá tăng dần":
        return "chatbox-ellipses-outline";
      case "Đánh giá giảm dần":
        return "chatbox-ellipses-outline";
      default:
        return "menu-outline";
    }
  };

  // hàm xem chi tiết một khách san -> gọi hotelDetails
  const handleToHotelDetails = (item) => {
    // const id = item?.hotelId;
    // navigation.navigate("HotelDetails", { item });
    // console.log(item?.hotelId);
    if (item && item !== "") {
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
  };

  const handleToMapViewScreen = () => {
    navigation.navigate("MapViewScreen");
    // navigation.navigate("GoongMapComponent");
  };
  // hàm hiển thị từng item trong danh sách khách sạnsạn
  const HotelItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.hotelItem}
        onPress={() => handleToHotelDetails(item)}
      >
        {/* Container chính với flexDirection: row */}
        <View style={styles.hotelContainer}>
          {/* Phần ảnh bên trái */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.hotelImageMain}
              resizeMode="cover"
            />
            <View style={styles.imageRow}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.hotelImageSmall1}
                resizeMode="cover"
              />
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.hotelImageSmall}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Phần thông tin bên phải */}
          <View style={styles.hotelDetails}>
            {/* Tên khách sạn */}
            <Text style={styles.hotelName}>{item?.hotelName}</Text>

            {/* Mô tả */}
            <Text style={styles.description}>
              Địa chỉ: {item?.hotelLocation}
            </Text>

            {/* Đánh giá và số nhận xét */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>{item?.hotelRating}</Text>
              </View>
              <View style={styles.ratingBox2}>
                <Text style={styles.reviewCount}>
                  {item?.sumReview} nhận xét
                </Text>
              </View>
            </View>

            {/* Khuyến mãi */}
            {item?.promotionName && (
              <View style={styles.promotion}>
                <Text style={styles.promotionText}>{item?.promotionName}</Text>
              </View>
            )}
            {item.promotionValue && (
              <View style={[styles.promotion, { backgroundColor: "#24784E" }]}>
                <Text style={styles.promotionText}>{item?.promotionValue}</Text>
              </View>
            )}

            {/* Giá và nút đặt ngay */}
            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                {+item?.promotionPrice !== +item?.price && (
                  <View>
                    <Text style={styles.oldPrice}>
                      {/* {Math.round(item.price * 2).toLocaleString()} đ */}
                      {item?.price?.toLocaleString()} đ
                    </Text>
                  </View>
                )}
                <View
                  style={
                    +item?.promotionPrice === +item?.price
                      ? { paddingTop: 70 }
                      : { paddingTop: 0 }
                  }
                >
                  <Text style={styles.price}>
                    {item?.promotionPrice?.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.bookView}>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleToHotelDetails(item)}
              >
                <Text style={styles.bookButtonText}>Đặt ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  console.log(modalVisible);
  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề và số lượng khách sạn */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerNavi}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color="black"
            style={[styles.searchIcon]}
          />
          <Text style={styles.title}>Khách sạn</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>{hotelByLocation?.length} khách sạn</Text>
      </View>

      {/* Thanh tìm kiếm và bộ lọc */}
      <View style={styles.filterContainer}>
        {/* Thanh tìm kiếm */}
        {/* <View style={styles.searchBar}>
          <TouchableOpacity>
            <Ionicons
              name="search-outline"
              size={20}
              color="#0090FF"
              style={[styles.searchIcon]}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.searchText}
            placeholder="Tìm kiếm"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity>
            <Ionicons
              name="close-outline"
              size={20}
              color="black"
              style={[styles.searchIcon]}
            />
          </TouchableOpacity>
        </View> */}

        {/* Bộ lọc */}
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setModalVisible({
                ...modalDefault,
                Amenity: !modalVisible.Amenity,
              })
            }
          >
            <Text style={styles.filterButtonText}>Tiện nghi</Text>
            <Icon name="angle-down" size={20} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setModalVisible({
                ...modalDefault,
                FilterBy: !modalVisible.FilterBy,
              })
            }
          >
            <Text style={styles.filterButtonText}>Bộ lọc</Text>
            <Icon name="angle-down" size={20} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setModalVisible({
                ...modalDefault,
                SortBy: !modalVisible.SortBy,
              })
            }
          >
            <Text style={styles.filterButtonText}>Sắp xếp</Text>
            <Icon name="angle-down" size={20} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            // onPress={() =>
            //   setModalVisible({
            //     ...modalDefault,
            //     SortBy: !modalVisible.SortBy,
            //   })
            // }
            onPress={() => handleToMapViewScreen()}
          >
            <Text style={styles.filterButtonText}>Bản đồ</Text>
            <Icon name="angle-down" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* {selectedSort && (
            <View style={styles.selectedFilterTag}>
              <Text style={styles.selectedFilterText}>{selectedSort}</Text>
            </View>
          )} */}
      {modalVisible.Amenity ? (
        <ModalAmenity
          onOpen={() => {
            console.log("15 run ");
            console.log("16", amenityList);
            // Gọi fetchAmenities lần đầu tiên khi mở ModalAmenity
            if (amenityList.length === 0) {
              fetchAmenities();
            }
          }}
          onClose={() => setModalVisible({ ...modalVisible, Amenity: false })}
        />
      ) : modalVisible.SortBy ? (
        <ModalSort
          onClose={() => setModalVisible({ ...modalVisible, SortBy: false })}
        />
      ) : modalVisible.FilterBy ? (
        <ModalFilter
          onOpen={() => {
            // Gọi fetchAmenities lần đầu tiên khi mở ModalAmenity
            if (filterList.length === 0) {
              fetchServices();
            }
          }}
          onClose={() => setModalVisible({ ...modalVisible, FilterBy: false })}
        />
      ) : errorHBL ? (
        <View style={styles.sectionErorHL}>
          <TouchableOpacity style={styles.errorHL} onPress={handleRetry}>
            <Text style={styles.errorHLText}>Thử lại </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View>
            {(selectedAmenities.length > 0 ||
              selectedServices.length > 0 ||
              selectedSort) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectedFiltersContainer}
              >
                {selectedSort && (
                  <View style={styles.selectedFilterTag}>
                    <Ionicons
                      name={getIconForSort(selectedSort)}
                      size={16}
                      color="#007AFF"
                      style={styles.tagIcon}
                    />
                    <Text style={styles.selectedFilterText}>
                      {selectedSort}
                    </Text>
                  </View>
                )}
                {selectedAmenities.map((amenity, index) => (
                  <View
                    key={`amenity-${index}`}
                    style={styles.selectedFilterTag}
                  >
                    <Ionicons
                      name={getIconForService(amenity)}
                      size={16}
                      color="#007AFF"
                      style={styles.tagIcon}
                    />
                    <Text style={styles.selectedFilterText}>{amenity}</Text>
                  </View>
                ))}
                {selectedServices.map((service, index) => (
                  <View
                    key={`service-${index}`}
                    style={styles.selectedFilterTag}
                  >
                    <Ionicons
                      name={getIconForAmenity(service)}
                      size={16}
                      color="#007AFF"
                      style={styles.tagIcon}
                    />
                    <Text style={styles.selectedFilterText}>{service}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          <ScrollView style={styles.scrollView}>
            {hotelByLocation &&
              hotelByLocation?.map((item, index) => (
                <HotelItem key={index} item={item} />
              ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};

export default ListHotelByLocation;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginTop: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerNavi: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 5,
  },
  filterContainer: {
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    //     padding: 10,
    paddingLeft: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
    fontWeight: "800",
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: "#666666",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "space-between",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  hotelItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 3, // Bóng cho Android
    shadowColor: "#000", // Bóng cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 320,
    padding: 5,
  },
  hotelContainer: {
    flexDirection: "row", // Ảnh bên trái, thông tin bên phải
    // padding: 10,
  },
  imageContainer: {
    width: "35%", // Ảnh chiếm 40% chiều rộng
    marginRight: 10,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  hotelImageMain: {
    width: "100%",
    height: "65%", // Chiều cao ảnh lớn
    // borderRadius: 5,
    borderTopLeftRadius: 12,
    marginBottom: 5,
  },
  imageRow: {
    height: "33%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hotelImageSmall1: {
    width: "48%", // Chiếm 48% để có khoảng cách giữa 2 ảnh
    borderBottomLeftRadius: 12,
    // borderRadius: 12,
  },
  hotelImageSmall: {
    width: "48%", // Chiếm 48% để có khoảng cách giữa 2 ảnh
  },
  hotelDetails: {
    flex: 1, // Thông tin chiếm phần còn lại
    justifyContent: "flex-start",
    padding: 10,
    paddingLeft: 0,
    flexDirection: "column",
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#191E38",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#2B2F38",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  ratingBox: {
    backgroundColor: "#24784E", // Màu xanh giống trong hình
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginRight: 5,
  },
  ratingBox2: {
    flexDirection: "column",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF", // Chữ trắng trong ô xanh
  },
  reviewText: {
    fontSize: 14,
    color: "#191E38", // Màu xanh giống "Ngoại hạng"
    marginRight: 5,
    fontWeight: "bold",
  },
  reviewCount: {
    fontSize: 14,
    color: "#2B2F38",
  },
  promotion: {
    backgroundColor: "#FEDB39", // Màu cam giống trong hình
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-end",
    marginBottom: 10,
    marignRight: 10,
  },
  promotionText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  footer: {
    // flexDirection: "row",
    // alignItems: "flex-end",
    // justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  oldPrice: {
    fontSize: 12,
    color: "#666666",
    textDecorationLine: "line-through", // Gạch ngang giá cũ
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2A2317", // Màu cam giống trong hình
    marginBottom: 10,
  },
  totalPrice: {
    fontSize: 10,
    color: "#666666",
  },
  bookView: {
    marginTop: "auto",
    width: "80%",
    marginHorizontal: "auto",
    textAlign: "center",
  },
  bookButton: {
    backgroundColor: "#24784E", // Màu xanh của nút "Đặt ngay"
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 15,
    textAlign: "center",
  },
  bookButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
  },

  //-------------------------------------------
  hotelItem1: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    elevation: 3, // Bóng cho Android
    shadowColor: "#000", // Bóng cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image1: {
    width: "100%",
    height: "200",
    justifyContent: "center",
    alignItems: "center",
  },
  hotelImage1: {
    width: "95%",
    height: "90%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderRadius: 10,
  },
  hotelDetails1: {
    padding: 10,
  },
  hotelHeader1: {
    marginBottom: 5,
  },
  hotelName1: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  ratingContainer1: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  starIcon1: {
    marginRight: 5,
  },
  ratingText1: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 5,
  },
  reviewText1: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 40,
  },
  description1: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
  footer1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promotion1: {
    backgroundColor: "#F8D146",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  promotionText1: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  price1: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginLeft: 20,
  },
  bookButton1: {
    backgroundColor: "#00F598", // Màu xanh theo yêu cầu
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 30,
  },
  bookButtonText1: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "400",
  },

  sectionErorHL: {
    flex: 1,
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
  selectedFiltersContainer: {
    marginBottom: 10,
    marginLeft: 5,
  },
  selectedFilterTag: {
    flexDirection: "row", // Đặt layout ngang để icon và text nằm cạnh nhau
    alignItems: "center", // Căn giữa theo chiều dọc
    backgroundColor: "#E6F0FA",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 2,
  },
  tagIcon: {
    marginRight: 5, // Khoảng cách giữa icon và text
  },
  selectedFilterText: {
    color: "#007AFF",
    fontSize: 12,
  },
});

// const test = [
//   {
//     hotelId: 10,
//     hotelLocation: "Hà Nội",
//     hotelName: "Old Quarter Inn",
//     hotelRating: 4.3,
//     imageUrl: null,
//     price: 875000,
//     promotionName: "Ưu đãi đầu năm 2025",
//     sumReview: 300,
//   },
//   {
//     hotelId: 2,
//     hotelLocation: "Hà Nội",
//     hotelName: "Onomo",
//     hotelRating: 4.3,
//     imageUrl:
//       "https://res.cloudinary.com/dt7eo0hbq/image/upload/v1729241122/Room/nipyn0qgyoyhtgkadlyi.jpg",
//     price: 950000,
//     promotionName: "Ưu đãi đầu năm 2025",
//     sumReview: 150,
//   },
//   {
//     hotelId: 11,
//     hotelLocation: "Hà Nội",
//     hotelName: "Lotus Blossom Resort",
//     hotelRating: 4.1,
//     imageUrl: null,
//     price: 1000000,
//     promotionName: null,
//     sumReview: 250,
//   },
//   {
//     hotelId: 13,
//     hotelLocation: "Hà Nội",
//     hotelName: "Tràng An Plaza",
//     hotelRating: 4.4,
//     imageUrl: null,
//     price: 1125000,
//     promotionName: "Giảm giá mùa hè",
//     sumReview: 320,
//   },
//   {
//     hotelId: 12,
//     hotelLocation: "Hà Nội",
//     hotelName: "Skyline Hotel",
//     hotelRating: 4.6,
//     imageUrl: null,
//     price: 1250000,
//     promotionName: "Ưu đãi cuối tuần",
//     sumReview: 380,
//   },
// ];
