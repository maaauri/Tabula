import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { Button } from "../../../src/components/common/Button";
import { useDeleteStudent, useStudent } from "../../../src/hooks/useStudents";
import { formatDate, fullName } from "../../../src/utils/formatters";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="mb-3">
      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</Text>
      <Text className="text-base text-gray-800 mt-0.5">{value}</Text>
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
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteStudent.mutateAsync(id!);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) return <ActivityIndicator className="mt-12" color="#1d4ed8" />;
  if (!student) return <Text className="text-center mt-12 text-gray-500">Estudiante no encontrado</Text>;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="bg-blue-700 px-4 pt-4 pb-12">
        <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
          <Text className="text-white text-2xl font-bold">{student.first_name[0]}</Text>
        </View>
        <Text className="text-white text-xl font-bold">{fullName(student.first_name, student.last_name)}</Text>
        {student.grade && <Text className="text-blue-200 mt-1">{student.grade}</Text>}
      </View>

      <View className="mx-4 -mt-6 bg-white rounded-2xl p-5 shadow-sm mb-4">
        <Text className="font-semibold text-gray-700 mb-4">Datos personales</Text>
        <InfoRow label="RUT" value={student.rut} />
        <InfoRow label="Fecha de nacimiento" value={formatDate(student.date_of_birth)} />
        <InfoRow label="Establecimiento" value={student.school_name} />
        <InfoRow label="Diagnóstico" value={student.diagnosis} />
        {student.needs?.length > 0 && (
          <View className="mb-3">
            <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">NEE</Text>
            <View className="flex-row flex-wrap mt-1 gap-2">
              {student.needs.map((need, i) => (
                <View key={i} className="bg-blue-100 rounded-full px-3 py-1">
                  <Text className="text-blue-700 text-xs font-medium">{need}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="px-4 gap-3 mb-8">
        <Button
          title="Ver informes"
          onPress={() => router.push(`/(app)/reports?student_id=${id}`)}
          variant="secondary"
        />
        <Button title="Eliminar estudiante" onPress={handleDelete} variant="danger" loading={deleteStudent.isPending} />
      </View>
    </ScrollView>
  );
}
