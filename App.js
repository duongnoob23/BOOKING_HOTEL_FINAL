import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "react-native-gesture-handler";
import Navigation from "./src/Routes";
import { Provider } from "react-redux";
import { store } from "./src/Redux/store";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";

import { showToast, toastConfig, CustomToast } from "./src/Utils/toast";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const AppContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // dispatch(restoreAuth());
  }, [dispatch]);

  return <Navigation />;
};

export default function App() {
  return (
    <Provider store={store}>
      <Navigation />
      <Toast config={toastConfig} />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
