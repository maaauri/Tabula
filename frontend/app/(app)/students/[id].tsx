import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View, Pressable } from "react-native";
import { Button } from "../../../src/components/common/Button";
import { useDeleteStudent, useStudent } from "../../../src/hooks/useStudents";
import { formatDate, fullName } from "../../../src/utils/formatters";

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row items-start mb-4">
      <View className="w-9 h-9 rounded-xl bg-brand-50 items-center justify-center mr-3 mt-0.5">
        <Ionicons name={icon} size={18} color="#7c3aed" />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-bold text-brand-400 uppercase tracking-wider">{label}</Text>
        <Text className="text-brand-800 text-sm mt-0.5 leading-relaxed">{value}</Text>
      </View>
    </View>
  );
}

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: student, isLoading } = useStudent(id!);
  const deleteStudent = useDeleteStudent();

  const handleDelete = () => {
    Alert.alert("Eliminar estudiante", "¿Estás seguro? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          await deleteStudent.mutateAsync(id!);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) return <ActivityIndicator className="mt-12" color="#7c3aed" size="large" />;
  if (!student) return <Text className="text-center mt-12 text-brand-400">Estudiante no encontrado</Text>;

  return (
    <ScrollView className="flex-1 bg-brand-50">
      {/* Hero */}
      <View className="bg-brand-700 px-5 pt-5 pb-14">
        <View className="w-20 h-20 rounded-3xl bg-white/20 items-center justify-center mb-3 border-2 border-white/30">
          <Text className="text-white text-3xl font-black">{student.first_name[0]}</Text>
        </View>
        <Text className="text-white text-2xl font-black">{fullName(student.first_name, student.last_name)}</Text>
        {student.grade && <Text className="text-brand-300 mt-1">{student.grade}</Text>}
      </View>

      {/* NEE badges */}
      {student.needs?.length > 0 && (
        <View className="mx-4 -mt-5 bg-white rounded-3xl p-4 mb-4 border-2 border-accent-400">
          <Text className="text-xs font-black text-accent-600 uppercase tracking-wider mb-2">Necesidades Educativas Especiales</Text>
          <View className="flex-row flex-wrap gap-2">
            {student.needs.map((need, i) => (
              <View key={i} className="bg-accent-500 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-bold">{need}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Info card */}
      <View className="mx-4 bg-white rounded-3xl p-5 mb-4 border-2 border-brand-100">
        <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-4">Información del estudiante</Text>
        <InfoRow icon="card" label="RUT" value={student.rut} />
        <InfoRow icon="calendar" label="Fecha de nacimiento" value={formatDate(student.date_of_birth)} />
        <InfoRow icon="school" label="Establecimiento" value={student.school_name} />
        <InfoRow icon="medical" label="Diagnóstico" value={student.diagnosis} />
      </View>

      {/* Actions */}
      <View className="px-4 gap-3 mb-10">
        <Button title="Ver informes del estudiante" onPress={() => router.push("/(app)/reports")} variant="secondary" />
        <Button title="Eliminar estudiante" onPress={handleDelete} variant="danger" loading={deleteStudent.isPending} />
      </View>
    </ScrollView>
  );
}
