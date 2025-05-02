import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView, Text } from "react-native";
import { MotiView } from "moti";

// Component SkeletonHomeScreen
const SkeletonHomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.body}>
        {/* Header */}
        <View style={styles.header}>
          <MotiView
            style={[styles.titleSkeleton]}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Phần tìm kiếm */}
        {/* Nhãn "Khách Sạn" */}
        <MotiView
          style={[styles.hotelLabelContainer]}
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
        />

        {/* Ô tìm kiếm địa điểm */}
        <View style={styles.inputContainer}>
          <MotiView
            style={styles.inputIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={[styles.inputTextSkeleton, { width: "60%" }]}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Ô ngày nhận phòng */}
        <View style={styles.inputContainer}>
          <MotiView
            style={styles.inputIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={[styles.inputTextSkeleton, { width: "60%" }]}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={styles.arrowIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Ô ngày thanh toán */}
        <View style={styles.inputContainer}>
          <MotiView
            style={styles.inputIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={[styles.inputTextSkeleton, { width: "60%" }]}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={styles.arrowIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Ô số lượng khách */}
        <View style={styles.inputContainer}>
          <MotiView
            style={styles.inputIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={[styles.inputTextSkeleton, { width: "60%" }]}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
          <MotiView
            style={styles.arrowIconSkeleton}
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          />
        </View>

        {/* Nút "Tìm kiếm" */}
        <MotiView
          style={[styles.newButton]}
          from={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
        />

        {/* Phần "Tiếp tục tìm kiếm của bạn" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MotiView
              style={[styles.sectionTitleSkeleton]}
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 1000,
                loop: true,
              }}
            />
            <MotiView
              style={[styles.viewAllTextSkeleton]}
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 1000,
                loop: true,
              }}
            />
          </View>

          {/* Danh sách ngang các item "Tiếp tục tìm kiếm" */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...Array(3)].map((_, index) => (
              <View key={index} style={styles.recentSearchItem}>
                <MotiView
                  style={styles.recentSearchImage}
                  from={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: "timing",
                    duration: 1000,
                    loop: true,
                  }}
                />
                <View style={styles.recentSearchDetails}>
                  <MotiView
                    style={[styles.recentSearchTextSkeleton]}
                    from={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "timing",
                      duration: 1000,
                      loop: true,
                    }}
                  />
                  <MotiView
                    style={[styles.recentSearchSubTextSkeleton]}
                    from={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "timing",
                      duration: 1000,
                      loop: true,
                    }}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Phần "Ưu đãi cuối tuần" */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MotiView
              style={[styles.sectionTitleSkeleton]}
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 1000,
                loop: true,
              }}
            />
            <MotiView
              style={[styles.viewAllTextSkeleton]} // Sửa từ styles.viewAll.TEXTSkeleton thành styles.viewAllTextSkeleton
              from={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "timing",
                duration: 1000,
                loop: true,
              }}
            />
          </View>

          {/* Danh sách ngang các item "Ưu đãi cuối tuần" */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[...Array(3)].map((_, index) => (
              <View key={index} style={styles.dealItem}>
                <MotiView
                  style={styles.dealImage}
                  from={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    type: "timing",
                    duration: 1000,
                    loop: true,
                  }}
                />
                <View style={styles.dealDetails}>
                  <MotiView
                    style={[styles.dealNameSkeleton]}
                    from={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "timing",
                      duration: 1000,
                      loop: true,
                    }}
                  />
                  <View style={styles.dealReviews}>
                    <MotiView
                      style={styles.dealIconSkeleton}
                      from={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                      }}
                    />
                    <MotiView
                      style={[styles.dealPointSkeleton]}
                      from={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                      }}
                    />
                    <MotiView
                      style={[styles.dealReviewsTextSkeleton]}
                      from={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                      }}
                    />
                  </View>
                  <MotiView
                    style={[styles.dealDescSkeleton]}
                    from={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      type: "timing",
                      duration: 1000,
                      loop: true,
                    }}
                  />
                  <View style={styles.dealFooter}>
                    <MotiView
                      style={[styles.dealSaleSkeleton]}
                      from={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                      }}
                    />
                    <MotiView
                      style={[styles.dealPriceSkeleton]}
                      from={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                      }}
                    />
                    <MotiView
                      style={[styles.dealBookingSkeleton]}
                      from={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Khoảng trống cuối */}
        <View style={styles.lastSection} />
        <View>
          <Text>{"\n\n"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
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
  },
  titleSkeleton: {
    width: 120,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  body: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  hotelLabelContainer: {
    backgroundColor: "#e0e0e0",
    //     backgroundColor: "",
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    position: "relative",
    padding: 10,
    marginBottom: 10,
    marginTop: 8,
  },
  inputIconSkeleton: {
    width: 24,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  inputTextSkeleton: {
    height: 18,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginLeft: 15,
  },
  arrowIconSkeleton: {
    width: 20,
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginLeft: 10,
  },
  newButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  sectionTitleSkeleton: {
    width: 150,
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
  },
  viewAllTextSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
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
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  recentSearchDetails: {
    marginLeft: 10,
    flex: 1,
  },
  recentSearchTextSkeleton: {
    width: "80%",
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 5,
  },
  recentSearchSubTextSkeleton: {
    width: "90%",
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
  },
  dealItem: {
    alignItems: "flex-start",
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    marginRight: 10,
    width: 250,
  },
  dealImage: {
    width: 250,
    height: 150,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dealDetails: {
    marginLeft: 8,
    marginRight: 10,
    width: "100%",
  },
  dealNameSkeleton: {
    width: "70%",
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginTop: 5,
    marginBottom: 5,
  },
  dealReviews: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5,
  },
  dealIconSkeleton: {
    width: 24,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginRight: 10,
  },
  dealPointSkeleton: {
    width: 30,
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginRight: 10,
  },
  dealReviewsTextSkeleton: {
    width: 80,
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
  },
  dealDescSkeleton: {
    width: "90%",
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginBottom: 5,
  },
  dealFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  dealSaleSkeleton: {
    width: 60,
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
  },
  dealPriceSkeleton: {
    width: 60,
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
  },
  dealBookingSkeleton: {
    width: 80,
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  lastSection: {
    // marginBottom: 20,
    // paddingBottom: 50,
  },
});

export default SkeletonHomeScreen;
