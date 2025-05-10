import React, { useLayoutEffect, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyVouchers,
  fetchEventVouchers,
  saveVoucher,
  clearVoucherStatus,
} from "../../Redux/Slice/voucherSlice"; // Thay bằng đường dẫn thực tế
import { showToast } from "../../Utils/toast";

const Promotion = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken, isLoggedIn } = useSelector((state) => state.auth);
  const { eventVouchers, myVouchers, loading, error, successSave } =
    useSelector((state) => state.voucher);

  // Gọi API khi component mount
  useEffect(() => {
    if (isLoggedIn && accessToken) {
      dispatch(fetchEventVouchers());
      dispatch(fetchMyVouchers());
    }
  }, [dispatch, isLoggedIn, accessToken]);

  // Xử lý thông báo khi lưu voucher
  useEffect(() => {
    if (successSave) {
      console.log("thông báo PromotionScreen", successSave);
      // alert(successSave); // Có thể thay bằng ToastAndroid hoặc thư viện khác
      showToast({
        type: "success",
        text1: "Thành công!",
        text2: "Lưu voucher Thành công 🥰",
        position: "top",
        duration: 3000,
      });
      dispatch(clearVoucherStatus());
    }
    if (error) {
      // alert(error);
      console.log("lỗi ở thông báo PromotionScreen", error);
      showToast({
        type: "warning",
        text1: "Thất bại!",
        text2: "Không lưu được voucher 😡",
        position: "top",
        duration: 3000,
      });
      dispatch(clearVoucherStatus());
    }
  }, [successSave, error, dispatch]);

  // Tạo danh sách ID của myVouchers để kiểm tra
  const myVouchersIds = useMemo(() => {
    return [
      ...myVouchers.unused,
      ...myVouchers.used,
      ...myVouchers.expired,
    ].map((voucher) => voucher.id);
  }, [myVouchers]);

  const handleToVoucherDetail = (voucher) => {
    navigation.navigate("VoucherDetail", { voucher });
  };

  const handleSaveVoucher = (voucherId) => {
    dispatch(saveVoucher(voucherId));
  };

  const renderVoucher = ({ item }) => {
    const isSaved = myVouchersIds.includes(String(item.id)); // Kiểm tra coupon đã lưu

    return (
      <TouchableOpacity
        style={styles.voucherItem}
        // onPress={() => handleToVoucherDetail(item)}
      >
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.voucherIconContainer,
              { backgroundColor: item.iconBackground || "#FF6347" },
            ]}
          >
            <Text style={styles.voucherIcon}>E</Text>
          </View>
        </View>
        <View style={styles.voucherContent}>
          <View style={styles.voucherContentLeft}>
            <Text style={styles.voucherTitle}>{item.description}</Text>
            <Text style={styles.voucherExpiry}>{item.code}</Text>
            <Text style={styles.voucherExpiry}>{item.expirationDate}</Text>
          </View>
          <View style={styles.voucherContentRight}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isSaved ? styles.actionButtonSaved : styles.actionButtonNormal,
              ]}
              onPress={() => !isSaved && handleSaveVoucher(item.id)}
              disabled={isSaved}
            >
              <Text style={styles.actionButtonText}>
                {isSaved ? "Đã lưu" : "Lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Khuyến mãi sự kiện</Text>
      </View> */}
      <FlatList
        data={eventVouchers}
        renderItem={renderVoucher}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.voucherList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Không có voucher sự kiện nào hiện tại.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  voucherList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  voucherItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  iconContainer: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  voucherIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    borderStyle: "dashed",
  },
  voucherIcon: {
    fontSize: 30,
    color: "#FFF",
    fontWeight: "bold",
  },
  voucherContent: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    flexDirection: "row",
  },
  voucherContentLeft: {
    width: "70%",
  },
  voucherContentRight: {
    justifyContent: "center",
    alignItems: "center",
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  actionButton: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonNormal: {
    backgroundColor: "#EE4D2D",
  },
  actionButtonSaved: {
    backgroundColor: "#CCCCCC",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default Promotion;
