import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
// import * as Location from "expo-location";

const GoongMapComponent = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 21.050710448404885,
    longitude: 105.73186320696925,
  });
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get("window");

  // Lấy vị trí hiện tại
  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.error('Không có quyền truy cập vị trí');
  //       return;
  //     }

  //     const location = await Location.getCurrentPositionAsync({});
  //     const { latitude, longitude } = location.coords;
  //     console.log(typeof latitude);
  //     console.log(typeof longitude);

  //     console.log('Vị trí hiện tại:', latitude, longitude);
  //     // setCurrentLocation({ latitude, longitude });
  //     setCurrentLocation({ latitude: 21.050710448404885, longitude: 105.73186320696925 });
  //     console.log(typeof currentLocation?.latitude);
  //     console.log(typeof currentLocation?.longitude);
  //   })();
  // }, []);

  // Khi currentLocation có giá trị, mới fetch dữ liệu tuyến đường
  useEffect(() => {
    if (!currentLocation) return;

    const fetchRoute = async () => {
      const { latitude, longitude } = currentLocation;
      const url = `https://rsapi.goong.io/direction?origin=${latitude},${longitude}&destination=20.989685,105.7514914&vehicle=car&api_key=1xR36Z0rKiXkXcewt25CPlN0d6Ojj4uH0zAQVKAL`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const encodedPolyline = data.routes[0].overview_polyline.points;
        const coordinates = decodePolyline(encodedPolyline);
        setRouteCoordinates(coordinates);
      } catch (error) {
        console.error("Lỗi gọi API Goong:", error);
      }
    };

    fetchRoute();
  }, [currentLocation]);

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

  // ⏳ Nếu chưa có vị trí hiện tại → loading
  if (!currentLocation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Đang xác định vị trí của bạn...</Text>
      </View>
    );
  }

  // ✅ Khi đã có vị trí → hiển thị map
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
          coordinate={{ latitude: 20.989685, longitude: 105.7514914 }}
          title="Đích đến"
        />
      </MapView>
    </View>
  );
};

export default GoongMapComponent;
