import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useReports } from "../../../src/hooks/useReports";
import { formatDate } from "../../../src/utils/formatters";

export default function ReportsListScreen() {
  const router = useRouter();
  const { data: reports, isLoading } = useReports();

  return (
    <View className="flex-1 bg-brand-50">
      <View className="bg-brand-700 px-5 pt-5 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-black">Informes PIE</Text>
            <Text className="text-brand-300 text-sm mt-0.5">
              {reports?.length ?? 0} informe{reports?.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/reports/new")}
            className="bg-accent-500 w-12 h-12 rounded-2xl items-center justify-center"
          >
            <Ionicons name="add" size={26} color="#fff" />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#7c3aed" size="large" />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 12 }}
          ListEmptyComponent={
            <View className="items-center mt-16 px-6">
              <View className="w-24 h-24 rounded-3xl bg-accent-500/10 items-center justify-center mb-4">
                <Ionicons name="document-text" size={44} color="#06b6d4" />
              </View>
              <Text className="text-brand-700 font-black text-xl mb-1">Sin informes</Text>
              <Text className="text-brand-400 text-center text-sm mb-6">Crea tu primer informe PIE semestral</Text>
              <Pressable
                onPress={() => router.push("/(app)/reports/new")}
                className="bg-accent-500 px-8 py-3.5 rounded-2xl"
              >
                <Text className="text-white font-bold">Crear informe</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(app)/reports/${item.id}`)}
              className="bg-white rounded-3xl p-5 mb-3 border-2 border-brand-100 active:opacity-80"
            >
              <View className="flex-row items-start justify-between mb-2">
                <Text className="font-black text-brand-800 text-base flex-1 mr-3" numberOfLines={2}>{item.title}</Text>
                <View className={`rounded-full px-3 py-1 ${item.status === "completed" ? "bg-green-100 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
                  <Text className={`text-xs font-bold ${item.status === "completed" ? "text-green-700" : "text-amber-600"}`}>
                    {item.status === "completed" ? "Completado" : "Borrador"}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-3">
                {item.period && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="calendar-outline" size={12} color="#a78bfa" />
                    <Text className="text-brand-400 text-xs">{item.period}</Text>
                  </View>
                )}
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time-outline" size={12} color="#a78bfa" />
                  <Text className="text-brand-400 text-xs">{formatDate(item.created_at)}</Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
