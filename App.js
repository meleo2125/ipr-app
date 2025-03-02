import { Slot } from "expo-router";
import { View, StatusBar } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
