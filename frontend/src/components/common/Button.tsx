import { ActivityIndicator, Pressable, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline";
}

export function Button({ title, onPress, loading = false, disabled = false, variant = "primary" }: ButtonProps) {
  const styles = {
    primary:  { bg: "bg-accent-500",   text: "text-white",       border: "" },
    secondary:{ bg: "bg-brand-100",    text: "text-brand-700",   border: "" },
    danger:   { bg: "bg-red-500",      text: "text-white",       border: "" },
    outline:  { bg: "bg-white",        text: "text-brand-700",   border: "border border-brand-300" },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${styles.bg} ${styles.border} rounded-2xl px-4 py-3.5 items-center justify-center ${disabled || loading ? "opacity-50" : "active:opacity-80"}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "outline" ? "#6d28d9" : "#fff"} />
      ) : (
        <Text className={`${styles.text} font-bold text-base tracking-wide`}>{title}</Text>
      )}
    </Pressable>
  );
}
