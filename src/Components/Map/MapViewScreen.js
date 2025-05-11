import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppSelector } from "../../Redux/hook";
const MapDirectionScreen = ({ navigation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const GOONG_MAP_API_KEY = "CqJGWaabFV9MNodiMThwxZpkhBLgyZcalsD93NHG";

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
  const locations = hotelByLocation;
  const handleToHotelDetails = (item) => {
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

  const HotelItem = () => {
    return (
      <TouchableOpacity
        style={styles.hotelItem}
        onPress={() => handleToHotelDetails(selectedLocation)}
      >
        {/* Container chính với flexDirection: row */}
        <View style={styles.hotelContainer}>
          {/* Phần ảnh bên trái */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedLocation.imageUrl }}
              style={styles.hotelImageMain}
              resizeMode="cover"
            />
            <View style={styles.imageRow}>
              <Image
                source={{ uri: selectedLocation.imageUrl }}
                style={styles.hotelImageSmall1}
                resizeMode="cover"
              />
              <Image
                source={{ uri: selectedLocation.imageUrl }}
                style={styles.hotelImageSmall}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Phần thông tin bên phải */}
          <View style={styles.hotelDetails}>
            {/* Tên khách sạn */}
            <Text style={styles.hotelName}>{selectedLocation?.hotelName}</Text>

            {/* Mô tả */}
            <Text style={styles.description}>
              Địa chỉ: {selectedLocation?.hotelLocation}
            </Text>

            {/* Đánh giá và số nhận xét */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>
                  {selectedLocation?.hotelRating}
                </Text>
              </View>
              <View style={styles.ratingBox2}>
                <Text style={styles.reviewCount}>
                  {selectedLocation?.sumReview} nhận xét
                </Text>
              </View>
            </View>

            {/* Khuyến mãi */}
            {selectedLocation?.promotionName && (
              <View style={styles.promotion}>
                <Text style={styles.promotionText}>
                  {selectedLocation?.promotionName}
                </Text>
              </View>
            )}
            {selectedLocation.promotionValue && (
              <View style={[styles.promotion, { backgroundColor: "#24784E" }]}>
                <Text style={styles.promotionText}>
                  Giảm {selectedLocation?.promotionValue}
                </Text>
              </View>
            )}

            {/* Giá và nút đặt ngay */}
            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                {+selectedLocation?.promotionPrice !==
                  +selectedLocation?.price && (
                  <View>
                    <Text style={styles.oldPrice}>
                      {/* {Math.round(selectedLocation.price * 2).toLocaleString()} đ */}
                      {selectedLocation?.price?.toLocaleString()} đ
                    </Text>
                  </View>
                )}
                <View
                  style={
                    +selectedLocation?.promotionPrice ===
                    +selectedLocation?.price
                      ? { paddingTop: 70 }
                      : { paddingTop: 0 }
                  }
                >
                  <Text style={styles.price}>
                    {selectedLocation?.promotionPrice?.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.bookView}>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleToHotelDetails(selectedLocation)}
              >
                <Text style={styles.bookButtonText}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: parseFloat(locations[0].lat),
          longitude: parseFloat(locations[0].lng),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate={`https://tiles.goong.io/assets/goong_map_web/{z}/{x}/{y}.png?api_key=${GOONG_MAP_API_KEY}`}
          maximumZ={20}
          flipY={false}
        />

        {locations.map((loc) => (
          <Marker
            key={loc.hotelId}
            coordinate={{
              latitude: parseFloat(loc.lat),
              longitude: parseFloat(loc.lng),
            }}
            onPress={() => setSelectedLocation(loc)}
          >
            <View style={styles.customMarker}>
              {/* <View style={styles.markerDot} />
               */}
              <Ionicons
                name="location-sharp"
                size={30}
                color="#007AFF"
                style={styles.icon}
              />
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 4,
                  marginTop: 4,
                  paddingBottom: 2,
                }}
              ></View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Hiển thị thông tin khi Marker được bấm  {/* Hiển thị thông tin khi Marker được bấm */}
      <Modal visible={!!selectedLocation} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setSelectedLocation(null)}>
          <View style={styles.modalOverlay}>
            <HotelItem key={selectedLocation?.hotelId} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default MapDirectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: "center",
    position: "relative",
  },
  markerDot: {
    width: 16,
    height: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerText: {
    fontSize: 14,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 4,
    color: "#000",
    elevation: 2,
    textAlign: "center",
    fontWeight: "600",
  },
  price: {
    paddingLeft: 4,
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 8,
  },
  cardButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: "center",
  },
  cardButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  tooltip: {
    position: "absolute",
    top: -50, // Đặt tooltip phía trên markerDot
    backgroundColor: "white",
    borderRadius: 4,
    padding: 8,
    minWidth: 100,

    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  },
  tooltipPrice: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "bold",
    marginTop: 2,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  hotelItem: {
    width: "100%",
    backgroundColor: "red",
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
    height: "320",

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
});
