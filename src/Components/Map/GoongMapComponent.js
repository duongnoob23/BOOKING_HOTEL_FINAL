import React, { useState, useEffect, useRef } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import Toast from "react-native-toast-message"; // Sử dụng Toast để hiển thị thông báo lỗi

const GoongMapComponent = ({ navigation, route }) => {
  const lat = parseFloat(route?.params?.lat);
  const lng = parseFloat(route?.params?.lng);
  console.log("Điểm đích:", lat, lng);

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null); // Bắt đầu với null
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get("window");

  // Lấy vị trí hiện tại bằng expo-location
  useEffect(() => {
    (async () => {
      try {
        // Yêu cầu quyền truy cập vị trí
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Không có quyền truy cập vị trí");
          Toast.show({
            type: "error",
            text1: "Không có quyền truy cập vị trí",
            text2: "Vui lòng cấp quyền để sử dụng tính năng này",
            position: "top",
            duration: 3000,
          });
          // Nếu không có quyền, bạn có thể xử lý bằng cách yêu cầu người dùng cấp quyền lại
          return;
        }

        // Lấy vị trí hiện tại
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High, // Độ chính xác cao
          timeout: 15000, // Thời gian chờ tối đa 15 giây
        });
        const { latitude, longitude } = location.coords;
        console.log("Vị trí hiện tại:", latitude, longitude);
        setCurrentLocation({ latitude, longitude });
      } catch (error) {
        console.error("Lỗi khi lấy vị trí:", error.message);
        Toast.show({
          type: "error",
          text1: "Lỗi khi lấy vị trí",
          text2: error.message || "Vui lòng kiểm tra GPS và kết nối mạng",
          position: "top",
          duration: 3000,
        });
      }
    })();
  }, []);

  // Fetch tuyến đường khi có vị trí hiện tại
  useEffect(() => {
    if (!currentLocation || !lat || !lng) return;

    const fetchRoute = async () => {
      const { latitude, longitude } = currentLocation;
      const url = `https://rsapi.goong.io/direction?origin=${latitude},${longitude}&destination=${lat},${lng}&vehicle=car&api_key=1xR36Z0rKiXkXcewt25CPlN0d6Ojj4uH0zAQVKAL`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.routes || !data.routes[0]) {
          throw new Error("Không tìm thấy tuyến đường");
        }
        const encodedPolyline = data.routes[0].overview_polyline.points;
        const coordinates = decodePolyline(encodedPolyline);
        setRouteCoordinates(coordinates);

        // Tự động điều chỉnh vùng hiển thị để bao gồm cả điểm xuất phát và đích
        if (mapRef.current) {
          const allCoordinates = [
            { latitude, longitude },
            { latitude: lat, longitude: lng },
            ...coordinates,
          ];
          mapRef.current.fitToCoordinates(allCoordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } catch (error) {
        console.error("Lỗi gọi API Goong:", error.message);
        Toast.show({
          type: "error",
          text1: "Lỗi khi lấy tuyến đường",
          text2: error.message || "Vui lòng kiểm tra kết nối mạng",
          position: "top",
          duration: 3000,
        });
      }
    };

    fetchRoute();
  }, [currentLocation, lat, lng]);

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dLng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  // Hiển thị loading nếu chưa có vị trí hiện tại
  if (!currentLocation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Đang xác định vị trí của bạn...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ textAlign: "center", padding: 10 }}>
        Tuyến đường từ vị trí của bạn đến đích
      </Text>
      <MapView
        ref={mapRef}
        style={{ width, height }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF0000"
          strokeWidth={4}
        />
        <Marker
          coordinate={currentLocation}
          title="Bạn đang ở đây"
          pinColor="green"
        />
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
          title="Đích đến"
        />
      </MapView>
    </View>
  );
};

export default GoongMapComponent;
