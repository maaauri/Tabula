import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useReports } from "../../src/hooks/useReports";
import { useStudents } from "../../src/hooks/useStudents";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { data: students } = useStudents();
  const { data: reports } = useReports();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="bg-blue-700 px-6 pt-6 pb-10">
        <Text className="text-white text-2xl font-bold">Hola, {user?.full_name?.split(" ")[0]}</Text>
        <Text className="text-blue-200 mt-1">Plataforma PIE · Tabula</Text>
      </View>

      <View className="-mt-6 mx-4 flex-row gap-3">
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
          <Text className="text-3xl font-bold text-blue-700">{students?.length ?? 0}</Text>
          <Text className="text-gray-500 text-sm mt-1">Estudiantes</Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center">
          <Text className="text-3xl font-bold text-blue-700">{reports?.length ?? 0}</Text>
          <Text className="text-gray-500 text-sm mt-1">Informes</Text>
        </View>
      </View>

      <View className="px-4 mt-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Accesos rápidos</Text>

        <Pressable
          onPress={() => router.push("/(app)/students/new")}
          className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
        >
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            <Ionicons name="person-add-outline" size={20} color="#1d4ed8" />
          </View>
          <View>
            <Text className="font-semibold text-gray-800">Agregar estudiante</Text>
            <Text className="text-gray-500 text-sm">Registrar nuevo estudiante PIE</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(app)/reports/new")}
          className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-gray-100"
        >
          <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
            <Ionicons name="add-circle-outline" size={20} color="#16a34a" />
          </View>
          <View>
            <Text className="font-semibold text-gray-800">Crear informe</Text>
            <Text className="text-gray-500 text-sm">Nuevo informe PIE semestral</Text>
          </View>
        </Pressable>
      </View>

      <View className="px-4 mt-2 mb-8">
        <Pressable
          onPress={logout}
          className="bg-red-50 rounded-xl p-4 flex-row items-center border border-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text className="text-red-600 font-medium ml-2">Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
