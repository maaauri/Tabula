import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Button } from "../../../src/components/common/Button";
import { Input } from "../../../src/components/common/Input";
import { useCreateReport } from "../../../src/hooks/useReports";
import { useStudents } from "../../../src/hooks/useStudents";

const schema = z.object({
  student_id: z.string().min(1, "Selecciona un estudiante"),
  title:      z.string().min(1, "Requerido"),
  period:     z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewReportScreen() {
  const router = useRouter();
  const createReport = useCreateReport();
  const { data: students } = useStudents();
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "Informe PIE Semestral" },
  });
  const selectedId = watch("student_id");

  const onSubmit = async (data: FormData) => {
    try {
      const report = await createReport.mutateAsync({
        student_id: data.student_id,
        title:      data.title,
        period:     data.period || undefined,
      });
      router.replace(`/(app)/reports/${report.id}`);
    } catch {
      Alert.alert("Error", "No se pudo crear el informe");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-brand-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-3">Seleccionar estudiante</Text>

        {!students?.length ? (
          <View className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-4">
            <Text className="text-amber-700 font-semibold text-sm">Debes agregar un estudiante primero.</Text>
          </View>
        ) : (
          <View className="mb-4">
            {students.map((s) => {
              const selected = selectedId === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setValue("student_id", s.id)}
                  className={`rounded-2xl px-4 py-3.5 mb-2 flex-row items-center border-2 ${selected ? "bg-brand-50 border-brand-500" : "bg-white border-brand-100"}`}
                >
                  <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${selected ? "bg-brand-600" : "bg-brand-100"}`}>
                    <Text className={`font-black text-lg ${selected ? "text-white" : "text-brand-400"}`}>{s.first_name[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold ${selected ? "text-brand-700" : "text-brand-600"}`}>
                      {s.first_name} {s.last_name}
                    </Text>
                    {s.grade && <Text className="text-brand-400 text-xs">{s.grade}</Text>}
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={22} color="#7c3aed" />}
                </Pressable>
              );
            })}
            {errors.student_id && <Text className="text-red-500 text-xs ml-1">{errors.student_id.message}</Text>}
          </View>
        )}

        <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-3 mt-2">Datos del informe</Text>
        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <Input label="Título del informe *" placeholder="Informe PIE Semestral" value={value} onChangeText={onChange} error={errors.title?.message} />
        )} />
        <Controller control={control} name="period" render={({ field: { onChange, value } }) => (
          <Input label="Período" placeholder="Primer Semestre 2026" value={value} onChangeText={onChange} />
        )} />

        <View className="mt-2">
          <Button title="Crear informe" onPress={handleSubmit(onSubmit)} loading={createReport.isPending} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
