import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native"; // Thêm Modal và ActivityIndicator
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  sendReview,
  resetSendReviewState,
  updateLoadingSendReview,
} from "../../Redux/Slice/hotelSlice";
import { useAppDispatch, useAppSelector } from "../../Redux/hook";
import { showToast } from "../../Utils/toast";

const RateApp = ({ navigation, route }) => {
  const hotel = route?.params?.item || [];
  console.log("item >>>>>>>>>>>>>>", route.params);

  // State cho đánh giá và nhận xét
  const [ratings, setRatings] = useState({
    hotel: 0,
    room: 0,
    location: 0,
    service: 0,
  });
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const dispatch = useAppDispatch();

  // Lấy trạng thái từ Redux
  const { loadingSendReview, sendReviewSuccess, sendReviewError } =
    useAppSelector((state) => state.hotel);

  const { bookingDetailData } = useAppSelector((state) => state.booking);

  console.log("25BKD", bookingDetailData);
  // Xử lý chọn sao
  const handleRating = (criterion, value) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: value,
    }));
  };

  // Hàm render sao
  const renderStars = (criterion) => {
    const rating = ratings[criterion];
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <TouchableOpacity
          style={styles.start}
          key={`full-${i}`}
          onPress={() => handleRating(criterion, i + 1)}
        >
          <Ionicons name="star" size={22} color="#FFD700" />
        </TouchableOpacity>
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <TouchableOpacity
          style={styles.start}
          key={`empty-${i}`}
          onPress={() => handleRating(criterion, fullStars + i + 1)}
        >
          <Ionicons name="star-outline" size={22} color="#CCCCCC" />
        </TouchableOpacity>
      );
    }

    return stars;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần cấp quyền truy cập thư viện ảnh để chọn ảnh!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newImage = {
        uri: result.assets[0].uri,
        type: result.assets[0].type || "image/jpeg",
        name: `sample-image-${images.length + 1}.jpg`,
      };

      if (images.length < 4) {
        setImages((prevImages) => [...prevImages, newImage]);
      } else {
        alert("Bạn chỉ có thể chọn tối đa 4 ảnh!");
      }
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleTo = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    const reviewData = {
      hotelId: hotel?.hotelId,
      bookingId: hotel?.bookingId,
      hotelPoint: ratings?.hotel.toString(),
      roomPoint: ratings?.room.toString(),
      locationPoint: ratings?.location.toString(),
      servicePoint: ratings?.service.toString(),
      comment: comment,
      image: images,
    };
    console.log("Dữ liệu gửi 0000000000000", reviewData);
    dispatch(updateLoadingSendReview());
    dispatch(sendReview(reviewData));
  };

  // Reset dữ liệu người dùng sau khi gửi thành công
  const resetUserInput = () => {
    setRatings({
      hotel: 0,
      room: 0,
      location: 0,
      service: 0,
    });
    setComment("");
    setImages([]);
  };

  // Theo dõi trạng thái gửi review để hiển thị thông báo và điều hướng
  useEffect(() => {
    if (sendReviewSuccess) {
      showToast({
        type: "success",
        text1: "Thành công🥰",
        text2: "Gửi đánh giá thành công!",
        position: "top",
        duration: 3000,
      });
      // alert("Gửi đánh giá thành công!");
      resetUserInput(); // Reset dữ liệu người dùng
      dispatch(resetSendReviewState());
      navigation.navigate("BookingScreen");
    }
    if (sendReviewError) {
      showToast({
        type: "error",
        text1: "Thất bại 😡 ",
        text2: `Lỗi: ${sendReviewError}`,
        position: "top",
        duration: 3000,
      });
      // alert(`Lỗi: ${sendReviewError}`);
      dispatch(resetSendReviewState());
      // Điều hướng về BookingScreen nếu có lỗi
      navigation.navigate("BookingScreen");
    }
  }, [sendReviewSuccess, sendReviewError, dispatch, navigation]);

  return (
    <>
      <ScrollView
        style={styles.rateDetail}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.rateDetail__header}>
          <TouchableOpacity onPress={handleTo}>
            <Ionicons
              style={styles.iconBed}
              name="chevron-back-outline"
              size={25}
              color="black"
            />
          </TouchableOpacity>
          <Text style={styles.rateDetail__headerTitle}>Chi tiết đánh giá</Text>
        </View>

        {/* Tiêu đề "Bình luận của: {username}" */}
        <View style={styles.rateDetail__criterionTitle}>
          <Text style={styles.rateDetail__headerTitleUser}>
            Bình luận của bạn
          </Text>
        </View>

        {/* Tiêu chí đánh giá */}
        <View style={styles.rateDetail__criteria}>
          <View style={styles.rateDetail__criterion}>
            <View style={styles.rateDetail__criterionTitle}>
              <Text style={styles.rateDetail__criterionLabel}>
                Đánh giá khách sạn
              </Text>
            </View>
            <View style={styles.rateDetail__stars}>{renderStars("hotel")}</View>
          </View>
          <View style={styles.rateDetail__criterion}>
            <View style={styles.rateDetail__criterionTitle}>
              <Text style={styles.rateDetail__criterionLabel}>
                Đánh giá phòng
              </Text>
            </View>
            <View style={styles.rateDetail__stars}>{renderStars("room")}</View>
          </View>
          <View style={styles.rateDetail__criterion}>
            <View style={styles.rateDetail__criterionTitle}>
              <Text style={styles.rateDetail__criterionLabel}>
                Đánh giá địa điểm
              </Text>
            </View>
            <View style={styles.rateDetail__stars}>
              {renderStars("location")}
            </View>
          </View>
          <View style={styles.rateDetail__criterion}>
            <View style={styles.rateDetail__criterionTitle}>
              <Text style={styles.rateDetail__criterionLabel}>
                Đánh giá dịch vụ
              </Text>
            </View>
            <View style={styles.rateDetail__stars}>
              {renderStars("service")}
            </View>
          </View>
        </View>

        {/* Nhận xét */}
        <Text style={styles.rateDetail__commentLabel}>Nhận xét</Text>
        <TextInput
          style={styles.rateDetail__commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Nhập nhận xét của bạn..."
          multiline
        />

        {/* Hiển thị ảnh đã chọn */}
        <Text style={styles.rateDetail__photosLabel}>Ảnh</Text>
        <View
          style={[
            styles.rateDetail__photos,
            images.length > 0 && { justifyContent: "flex-start" },
          ]}
        >
          {images.length > 0 ? (
            images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.rateDetail__photo}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.notPicture}>
              <Text style={styles.notPictureText}>
                Chưa có ảnh nào được chọn
              </Text>
            </View>
          )}
        </View>

        {/* Nút chọn ảnh (dấu cộng) */}
        {images.length < 4 ? (
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          ""
        )}
      </ScrollView>

      {/* Nút xác nhận */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loadingSendReview}
        >
          <Text style={styles.buttonText}>
            {loadingSendReview ? "Đang gửi..." : "Đánh giá"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal loading toàn màn hình */}
      <Modal
        visible={loadingSendReview}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#00F598" />
            <Text style={styles.modalText}>Đang gửi đánh giá...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  rateDetail: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
  },
  scrollContent: {
    paddingBottom: 20,
    // Thêm padding dưới để nội dung không bị che bởi nút "Xác nhận"
  },
  rateDetail__header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  rateDetail__headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  rateDetail__headerTitleUser: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  rateDetail__criteria: {
    marginBottom: 20,
  },
  rateDetail__criterion: {
    flexDirection: "column",
    justifyContent: "space",
    alignItems: "center",
    marginBottom: 5,
    borderBottomColor: "#E5E5E5",
    borderBottomWidth: 1,
  },
  rateDetail__criterionTitle: {
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  rateDetail__criterionLabel: {
    fontSize: 16,
    color: "#000000",
  },
  rateDetail__stars: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 8,
  },
  start: {
    marginRight: 5,
  },
  rateDetail__commentLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  rateDetail__commentInput: {
    backgroundColor: "#E8ECEF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000000",
    marginBottom: 10,
    minHeight: 40,
  },
  addImageButton: {
    backgroundColor: "#00F598",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  rateDetail__photosLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  rateDetail__photos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative", // Để định vị nút xóa
    marginRight: 10,
    marginBottom: 10,
  },
  rateDetail__photo: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "90%",
    backgroundColor: "#00F598",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: "auto",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  notPicture: {
    textAlign: "center",
    padding: 20,
  },
  notPictureText: {
    textAlign: "center",
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  loadingContainer: {
    marginTop: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Màu xám đen, mờ
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});

export default RateApp;
