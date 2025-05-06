import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import showToast from "../../../Utils/toast";
import { useAppSelector } from "../../../Redux/hook";

const ModalDatePicker = ({
  visible,
  onClose,
  onConfirm,
  title = "Chọn ngày",
  mode,
}) => {
  const { inforFilter } = useAppSelector((state) => state.hotel);
  console.log(`1 ${mode}`, inforFilter[mode]);

  // Khởi tạo selectedDate từ inforFilter[mode], hoặc ngày hiện tại nếu không có giá trị
  const [selectedDate, setSelectedDate] = useState(
    inforFilter[mode] || new Date().toISOString().split("T")[0]
  );

  // Reset selectedDate khi modal mở (visible thay đổi thành true)
  useEffect(() => {
    if (visible) {
      setSelectedDate(
        inforFilter[mode] || new Date().toISOString().split("T")[0]
      );
    }
  }, [visible, inforFilter[mode]]);

  const handleDayPress = (day) => {
    console.log("10", day.dateString);
    setSelectedDate(day.dateString); // Lưu ngày được chọn dưới dạng YYYY-MM-DD
  };

  const handleConfirm = () => {
    const date = new Date(`${selectedDate}T00:00:00.000Z`); // tạo ngày với giờ đằng sau chính xác, không bị lùi giờ theo mốc việt nam
    console.log("11", date);

    // Gọi onConfirm và truyền callback để reset selectedDate nếu validate thất bại
    onConfirm(mode, date, (isValid) => {
      if (!isValid) {
        // Nếu validate thất bại, reset selectedDate về giá trị gốc
        setSelectedDate(
          inforFilter[mode] || new Date().toISOString().split("T")[0]
        );
      }
    });
  };

  const handleCancel = () => {
    // Khi bấm Hủy, reset selectedDate về giá trị gốc
    setSelectedDate(
      inforFilter[mode] || new Date().toISOString().split("T")[0]
    ); // nếu chọn ngày mà huy thì reset lại giá trị ngày chọn ban đầu
    onClose();
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

          <Calendar
            current={inforFilter[mode]} // Ngày hiện tại
            minDate={new Date().toISOString().split("T")[0]} // Không cho phép chọn ngày trước hôm nay
            onDayPress={handleDayPress} // Xử lý khi người dùng chọn ngày
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#0090FF",
              },
            }} // Đánh dấu ngày đã chọn
            theme={{
              todayTextColor: "#FF6347",
              arrowColor: "#0090FF",
              monthTextColor: "#333",
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
            }}
          />
          <Text style={styles.selectedDateText}>
            Ngày đã chọn:{" "}
            {new Date(`${selectedDate}T00:00:00.000+07:00`).toLocaleDateString(
              "vi-VN"
            )}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
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
