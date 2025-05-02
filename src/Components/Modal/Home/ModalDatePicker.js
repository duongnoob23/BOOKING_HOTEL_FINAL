import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Calendar } from "react-native-calendars"; // Import Calendar từ react-native-calendars
import showToast from "../../../Utils/toast";
const ModalDatePicker = ({
  visible,
  onClose,
  onConfirm,
  title = "Chọn ngày",
  initialDate,
  mode = "checkin",
}) => {
  console.log(`1 ${mode}`, initialDate);
  // Chuyển initialDate thành định dạng YYYY-MM-DD để react-native-calendars sử dụng
  const initialDateString =
    initialDate.toISOString().split("T")[0] || new Date();
  const [selectedDate, setSelectedDate] = useState(initialDateString);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString); // Lưu ngày được chọn dưới dạng YYYY-MM-DD
  };

  const handleConfirm = () => {
    const date = new Date(selectedDate); // Chuyển chuỗi YYYY-MM-DD thành đối tượng Date
    onConfirm(mode, date); // Gọi hàm onConfirm với mode và ngày đã chọn
    // showToast({
    //   type: "warning", // hoặc "error", "info"
    //   text1: "Chọn lại ngày checkin",
    //   text2: "Ngày CheckIn phải lớn hơn hoặc bằng ngày hiện tại",
    //   position: "top-right",
    //   duration: 3000,
    // });
    // onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      style={{
        zIndex: 1000,
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>

          {/* Sử dụng Calendar từ react-native-calendars */}
          <Calendar
            current={initialDateString} // Ngày hiện tại
            minDate={new Date().toISOString().split("T")[0]} // Không cho phép chọn ngày trước hôm nay
            onDayPress={handleDayPress} // Xử lý khi người dùng chọn ngày
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#0090FF",
              },
            }} // Đánh dấu ngày đã chọn
            theme={{
              todayTextColor: "#FF6347", // Màu cho ngày hôm nay
              arrowColor: "#0090FF", // Màu mũi tên chuyển tháng
              monthTextColor: "#333", // Màu tiêu đề tháng
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
            }}
          />

          {/* Hiển thị ngày đã chọn */}
          <Text style={styles.selectedDateText}>
            Ngày đã chọn: {new Date(selectedDate).toLocaleDateString("vi-VN")}
          </Text>

          {/* Nút Hủy và Xác nhận */}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.modalButtonText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  selectedDateText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: 10,
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
});

export default ModalDatePicker;
