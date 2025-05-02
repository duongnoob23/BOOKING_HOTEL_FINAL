import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal, // Thêm Modal
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAppSelector } from "../../../Redux/hook";

const ModalLocationList = ({ visible, onClose, onSelect }) => {
  // Thay position bằng visible
  const { hotelList, locationList, hotelDetail, loading, error } =
    useAppSelector((state) => state.hotel);

  return (
    <Modal visible={visible} animationType="none" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chọn địa điểm</Text>

          <ScrollView style={styles.scrollView}>
            {locationList &&
              locationList?.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  style={styles.locationItem}
                  onPress={() => {
                    onSelect(item.id.toString());
                    onClose();
                  }}
                >
                  <Icon name="map-marker" size={24} color="#0090FF" />
                  <Text style={styles.locationText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalLocationList;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Overlay trong suốt
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10, // Giảm padding để vừa với nội dung
    width: "90%", // Chiều rộng cố định
    maxHeight: "80%", // Giới hạn chiều cao
    zIndex: 1000,
  },
  scrollView: {
    maxHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    padding: 10,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    marginHorizontal: 15,
    marginBottom: 15,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
