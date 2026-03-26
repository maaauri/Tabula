import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-semibold text-brand-800 mb-1.5">{label}</Text>}
      <TextInput
        className={`border-2 rounded-2xl px-4 py-3.5 text-base bg-white text-gray-800 ${
          error ? "border-red-400" : "border-brand-200"
        }`}
        placeholderTextColor="#c4b5fd"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );
}
