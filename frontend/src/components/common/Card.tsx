import { Pressable, Text, View } from "react-native";

interface CardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Card({ title, subtitle, onPress, rightElement }: CardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
      </View>
      {rightElement}
    </Pressable>
  );
}
