import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useStudents } from "../../../src/hooks/useStudents";
import { fullName } from "../../../src/utils/formatters";

export default function StudentsListScreen() {
  const router = useRouter();
  const { data: students, isLoading } = useStudents();

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-blue-700 px-4 pt-4 pb-6 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">Estudiantes</Text>
        <Pressable
          onPress={() => router.push("/(app)/students/new")}
          className="bg-white/20 rounded-full p-2"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-8" color="#1d4ed8" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pt-4"
          ListEmptyComponent={
            <View className="items-center mt-12">
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-3 text-base">No hay estudiantes registrados</Text>
              <Pressable
                onPress={() => router.push("/(app)/students/new")}
                className="mt-4 bg-blue-700 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Agregar estudiante</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/(app)/students/${item.id}`)}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-blue-700 font-bold text-base">{item.first_name[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">{fullName(item.first_name, item.last_name)}</Text>
                <Text className="text-gray-500 text-sm">{item.grade ?? "Curso no especificado"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
