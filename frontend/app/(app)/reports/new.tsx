import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Button } from "../../../src/components/common/Button";
import { Input } from "../../../src/components/common/Input";
import { useCreateReport } from "../../../src/hooks/useReports";
import { useStudents } from "../../../src/hooks/useStudents";

const schema = z.object({
  student_id: z.string().min(1, "Selecciona un estudiante"),
  title: z.string().min(1, "Requerido"),
  period: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewReportScreen() {
  const router = useRouter();
  const createReport = useCreateReport();
  const { data: students } = useStudents();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "Informe PIE Semestral", period: "" },
  });

  const selectedStudentId = watch("student_id");

  const onSubmit = async (data: FormData) => {
    try {
      const report = await createReport.mutateAsync({
        student_id: data.student_id,
        title: data.title,
        period: data.period || undefined,
      });
      router.replace(`/(app)/reports/${report.id}`);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.detail ?? "No se pudo crear el informe");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="px-4 py-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Nuevo informe PIE</Text>

        <Text className="text-sm font-medium text-gray-700 mb-2">Estudiante *</Text>
        {students && students.length > 0 ? (
          <View className="mb-4">
            {students.map((s) => (
              <View
                key={s.id}
                className={`border rounded-xl px-4 py-3 mb-2 ${selectedStudentId === s.id ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}
              >
                <Text
                  onPress={() => setValue("student_id", s.id)}
                  className={`font-medium ${selectedStudentId === s.id ? "text-blue-700" : "text-gray-700"}`}
                >
                  {s.first_name} {s.last_name} {s.grade ? `· ${s.grade}` : ""}
                </Text>
              </View>
            ))}
            {errors.student_id && <Text className="text-red-500 text-xs">{errors.student_id.message}</Text>}
          </View>
        ) : (
          <Text className="text-gray-400 text-sm mb-4">No hay estudiantes. Agrega uno primero.</Text>
        )}

        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <Input label="Título del informe *" placeholder="Informe PIE Semestral" value={value} onChangeText={onChange} error={errors.title?.message} />
        )} />
        <Controller control={control} name="period" render={({ field: { onChange, value } }) => (
          <Input label="Período" placeholder="Primer Semestre 2026" value={value} onChangeText={onChange} />
        )} />

        <Button title="Crear informe" onPress={handleSubmit(onSubmit)} loading={createReport.isPending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
