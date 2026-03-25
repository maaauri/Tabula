import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useReports } from "../../../src/hooks/useReports";
import { formatDate } from "../../../src/utils/formatters";

export default function ReportsListScreen() {
  const router = useRouter();
  const { data: reports, isLoading } = useReports();

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-blue-700 px-4 pt-4 pb-6 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">Informes PIE</Text>
        <Pressable
          onPress={() => router.push("/(app)/reports/new")}
          className="bg-white/20 rounded-full p-2"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#1d4ed8" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pt-4"
          ListEmptyComponent={
            <View className="items-center mt-12">
              <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-3 text-base">No hay informes creados</Text>
              <Pressable
                onPress={() => router.push("/(app)/reports/new")}
                className="mt-4 bg-blue-700 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Crear informe</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(app)/reports/${item.id}`)}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-semibold text-gray-800 flex-1 mr-2" numberOfLines={1}>{item.title}</Text>
                <View className={`rounded-full px-2 py-0.5 ${item.status === "completed" ? "bg-green-100" : "bg-amber-100"}`}>
                  <Text className={`text-xs font-medium ${item.status === "completed" ? "text-green-700" : "text-amber-700"}`}>
                    {item.status === "completed" ? "Completado" : "Borrador"}
                  </Text>
                </View>
              </View>
              {item.period && <Text className="text-gray-500 text-sm mt-1">{item.period}</Text>}
              <Text className="text-gray-400 text-xs mt-1">{formatDate(item.created_at)}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
