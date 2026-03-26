import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../src/hooks/useAuth";
import { useReports } from "../../src/hooks/useReports";
import { useStudents } from "../../src/hooks/useStudents";

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  iconBg: string;
  onPress: () => void;
}

function QuickAction({ icon, label, subtitle, iconBg, onPress }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-3xl p-5 mb-3 border-2 border-brand-100 active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className={`w-14 h-14 rounded-2xl ${iconBg} items-center justify-center mr-4`}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-brand-800 font-bold text-base">{label}</Text>
          <Text className="text-brand-400 text-sm mt-0.5">{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#c4b5fd" />
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { data: students } = useStudents();
  const { data: reports } = useReports();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-brand-50">
      {/* Header */}
      <View className="bg-brand-700 px-6 pt-6 pb-16">
        <Text className="text-brand-300 text-sm font-semibold mb-1">Bienvenido/a,</Text>
        <Text className="text-white text-2xl font-black">{user?.full_name}</Text>
        <Text className="text-brand-300 text-sm mt-1">Plataforma PIE · Tabula</Text>
      </View>

      {/* Stats */}
      <View className="mx-4 -mt-8 flex-row gap-3 mb-5">
        <View className="flex-1 bg-white rounded-3xl p-5 items-center border-2 border-brand-100">
          <View className="w-12 h-12 rounded-2xl bg-brand-600 items-center justify-center mb-2">
            <Ionicons name="people" size={22} color="#fff" />
          </View>
          <Text className="text-3xl font-black text-brand-700">{students?.length ?? 0}</Text>
          <Text className="text-brand-400 text-xs font-semibold mt-0.5">Estudiantes</Text>
        </View>
        <View className="flex-1 bg-white rounded-3xl p-5 items-center border-2 border-accent-400">
          <View className="w-12 h-12 rounded-2xl bg-accent-500 items-center justify-center mb-2">
            <Ionicons name="document-text" size={22} color="#fff" />
          </View>
          <Text className="text-3xl font-black text-accent-600">{reports?.length ?? 0}</Text>
          <Text className="text-brand-400 text-xs font-semibold mt-0.5">Informes</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View className="px-4">
        <Text className="text-brand-800 font-black text-base mb-3 uppercase tracking-wider text-xs">Acciones rápidas</Text>

        <QuickAction
          icon="person-add"
          label="Agregar estudiante"
          subtitle="Registrar nuevo perfil PIE"
          iconBg="bg-brand-600"
          onPress={() => router.push("/(app)/students/new")}
        />
        <QuickAction
          icon="add-circle"
          label="Crear informe"
          subtitle="Nuevo informe PIE semestral"
          iconBg="bg-accent-500"
          onPress={() => router.push("/(app)/reports/new")}
        />
        <QuickAction
          icon="people"
          label="Ver estudiantes"
          subtitle="Gestionar todos los estudiantes"
          iconBg="bg-brand-500"
          onPress={() => router.push("/(app)/students")}
        />
        <QuickAction
          icon="document-text"
          label="Ver informes"
          subtitle="Revisar y editar informes"
          iconBg="bg-accent-600"
          onPress={() => router.push("/(app)/reports")}
        />
      </View>

      {/* Logout */}
      <View className="px-4 mt-4 mb-10">
        <Pressable onPress={logout} className="flex-row items-center justify-center py-4 gap-2">
          <Ionicons name="log-out-outline" size={18} color="#a78bfa" />
          <Text className="text-brand-400 font-semibold text-sm">Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
