import BookingHistoryDetails from "../Pages/Booking/BookingHistoryDetails";
import BookingScreen from "../Pages/Booking/BookingScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RateApp from "../Pages/Reviews/RateApp";
import TermScreen from "../Pages/Auth/TermScreen";
import AllPolicy from "../Pages/Hotels/AllPolicy";
const Stack = createNativeStackNavigator();

const BookingStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="BookingScreen"
        component={BookingScreen}
        options={{
          headerShown: true,
          tabBarVisible: false, // Ẩn thanh tab dưới cùng
          title: "Lịch sử đặt phòng  ",
        }}
      />
      <Stack.Screen
        name="BookingHistoryDetails"
        component={BookingHistoryDetails}
        options={{
          headerShown: true,
          tabBarVisible: false, // Ẩn thanh tab dưới cùng
          title: "Chi tiết đặt phòng  ",
        }}
      />
      <Stack.Screen
        name="TermScreen"
        component={TermScreen}
        options={{
          headerShown: true,
          tabBarVisible: false, // Ẩn thanh tab dưới cùng
          title: "check",
        }}
      />
      <Stack.Screen
        name="RateApp"
        component={RateApp}
        options={{
          headerShown: false,
          tabBarVisible: false, // Ẩn thanh tab dưới cùng
        }}
      />
      <Stack.Screen
        name="AllPolicy"
        component={AllPolicy}
        options={{
          headerShown: true,
          title: "Các chính sách",
          tabBarVisible: false, // Ẩn thanh tab dưới cùng
        }}
      />
    </Stack.Navigator>
  );
};

export default BookingStackNavigator;
