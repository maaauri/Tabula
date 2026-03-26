import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useStudents } from "../../../src/hooks/useStudents";
import { fullName } from "../../../src/utils/formatters";

const AVATAR_COLORS = [
  "bg-brand-600", "bg-accent-500", "bg-brand-500", "bg-accent-600",
  "bg-brand-700", "bg-accent-400",
];

export default function StudentsListScreen() {
  const router = useRouter();
  const { data: students, isLoading } = useStudents();

  return (
    <View className="flex-1 bg-brand-50">
      {/* Header */}
      <View className="bg-brand-700 px-5 pt-5 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-2xl font-black">Estudiantes</Text>
            <Text className="text-brand-300 text-sm mt-0.5">
              {students?.length ?? 0} registrado{students?.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/students/new")}
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
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 12 }}
          ListEmptyComponent={
            <View className="items-center mt-16 px-6">
              <View className="w-24 h-24 rounded-3xl bg-brand-100 items-center justify-center mb-4">
                <Ionicons name="people" size={44} color="#a78bfa" />
              </View>
              <Text className="text-brand-700 font-black text-xl mb-1">Sin estudiantes</Text>
              <Text className="text-brand-400 text-center text-sm mb-6">Agrega tu primer estudiante para comenzar</Text>
              <Pressable
                onPress={() => router.push("/(app)/students/new")}
                className="bg-accent-500 px-8 py-3.5 rounded-2xl"
              >
                <Text className="text-white font-bold">Agregar estudiante</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => router.push(`/(app)/students/${item.id}`)}
              className="bg-white rounded-3xl p-4 mb-3 border-2 border-brand-100 flex-row items-center active:opacity-80"
            >
              <View className={`w-14 h-14 rounded-2xl ${AVATAR_COLORS[index % AVATAR_COLORS.length]} items-center justify-center mr-4`}>
                <Text className="text-white text-xl font-black">{item.first_name[0]}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-brand-800 text-base">{fullName(item.first_name, item.last_name)}</Text>
                <Text className="text-brand-400 text-sm mt-0.5">{item.grade ?? "Curso no especificado"}</Text>
                {item.needs?.length > 0 && (
                  <View className="flex-row mt-1.5 gap-1">
                    {item.needs.slice(0, 2).map((n, i) => (
                      <View key={i} className="bg-brand-50 rounded-full px-2 py-0.5 border border-brand-200">
                        <Text className="text-brand-600 text-xs font-semibold">{n}</Text>
                      </View>
                    ))}
                    {item.needs.length > 2 && (
                      <Text className="text-brand-400 text-xs self-center">+{item.needs.length - 2}</Text>
                    )}
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#c4b5fd" />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
