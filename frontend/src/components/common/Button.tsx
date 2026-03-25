import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ title, onPress, loading = false, disabled = false, variant = "primary" }: ButtonProps) {
  const bgClass =
    variant === "primary"
      ? "bg-blue-700"
      : variant === "danger"
      ? "bg-red-600"
      : "bg-gray-200";
  const textClass = variant === "secondary" ? "text-gray-800" : "text-white";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${bgClass} rounded-xl px-4 py-3 items-center justify-center opacity-${disabled || loading ? "50" : "100"}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#374151" : "#fff"} />
      ) : (
        <Text className={`${textClass} font-semibold text-base`}>{title}</Text>
      )}
    </Pressable>
  );
}
