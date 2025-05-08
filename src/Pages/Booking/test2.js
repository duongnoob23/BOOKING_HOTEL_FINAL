//   const fetchLocations = async (retryCount = 2, delay = 1000) => {
//      for (let attempt = 1; attempt <= retryCount; attempt++) {
//        try {
//          // console.log("goi try catch lan 1");
//          await dispatch(fetchLocationList()).unwrap();
//          return;
//        } catch (error) {
//          showToast({
//            type: "error",
//            text1: "Lỗi tải dữ liệu",
//            text2: "Không thể tải danh sách địa điểm  ",
//            position: "top",
//            duration: 3000,
//          });
//          console.log(`Attempt ${attempt} failed to fetch location list:`, error);
//          if (attempt === retryCount) {
//            throw error;
//          }
//          await new Promise((resolve) => setTimeout(resolve, 1000));
//        }
//      }
//    };

//    const fetchData = async () => {
//      try {
//        await Promise.all([fetchHotels(), fetchLocations()]);
//      } catch (error) {
//        console.log("Failed to fetch data in HomeScreen:", error);
//        showToast({
//          type: "error",
//          text1: "Lỗi tải dữ liệu",
//          text2: "Không thể tải danh sách khách sạn hoặc địa điểm.",
//          position: "top",
//          duration: 3000,
//        });
//      }
//    };

//    useEffect(() => {
//      fetchData();
//    }, [dispatch]);

//    const handleRetry = () => {
//      fetchData();
//    };

// <View style={styles.sectionErorHL}>
//               <TouchableOpacity
//                 style={styles.errorHL}
//                 onPress={() => handleRetry()}
//               >
//                 <Text style={styles.errorHLText}>Thử lại </Text>
//               </TouchableOpacity>
//             </View>

//   sectionErorHL: {
//     justifyContent: "center",
//     alignItems: "center",
//     height: 100,
//     backgroundColor: "white",
//   },
//   errorHL: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "gray",
//     padding: 20,
//     paddingVertical: 10,
//   },
//   errorHLText: {
//     color: "gray",
//     fontSize: 16,
//     fontWeight: "400",
//   },
