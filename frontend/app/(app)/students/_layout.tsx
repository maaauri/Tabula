import { Stack } from "expo-router";

export default function StudentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#6d28d9" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "900" },
      }}
    />
  );
}
