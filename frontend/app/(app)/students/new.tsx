import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Button } from "../../../src/components/common/Button";
import { Input } from "../../../src/components/common/Input";
import { useCreateStudent } from "../../../src/hooks/useStudents";

const schema = z.object({
  first_name:  z.string().min(1, "Requerido"),
  last_name:   z.string().min(1, "Requerido"),
  rut:         z.string().optional(),
  grade:       z.string().optional(),
  school_name: z.string().optional(),
  diagnosis:   z.string().optional(),
  needs:       z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-3 mt-2">{children}</Text>
  );
}

export default function NewStudentScreen() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createStudent.mutateAsync({
        first_name:  data.first_name,
        last_name:   data.last_name,
        rut:         data.rut || undefined,
        grade:       data.grade || undefined,
        school_name: data.school_name || undefined,
        diagnosis:   data.diagnosis || undefined,
        needs:       data.needs ? data.needs.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      router.back();
    } catch {
      Alert.alert("Error", "No se pudo crear el estudiante");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-brand-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        <SectionTitle>Datos personales</SectionTitle>
        <Controller control={control} name="first_name" render={({ field: { onChange, value } }) => (
          <Input label="Nombre *" placeholder="Nombre" value={value} onChangeText={onChange} error={errors.first_name?.message} />
        )} />
        <Controller control={control} name="last_name" render={({ field: { onChange, value } }) => (
          <Input label="Apellido *" placeholder="Apellido" value={value} onChangeText={onChange} error={errors.last_name?.message} />
        )} />
        <Controller control={control} name="rut" render={({ field: { onChange, value } }) => (
          <Input label="RUT" placeholder="12.345.678-9" value={value} onChangeText={onChange} />
        )} />

        <SectionTitle>Información escolar</SectionTitle>
        <Controller control={control} name="grade" render={({ field: { onChange, value } }) => (
          <Input label="Curso" placeholder="3° Básico" value={value} onChangeText={onChange} />
        )} />
        <Controller control={control} name="school_name" render={({ field: { onChange, value } }) => (
          <Input label="Establecimiento" placeholder="Escuela El Sol" value={value} onChangeText={onChange} />
        )} />

        <SectionTitle>Diagnóstico PIE</SectionTitle>
        <Controller control={control} name="diagnosis" render={({ field: { onChange, value } }) => (
          <Input label="Diagnóstico" placeholder="TEA, Dislexia, etc." value={value} onChangeText={onChange} multiline numberOfLines={3} />
        )} />
        <Controller control={control} name="needs" render={({ field: { onChange, value } }) => (
          <Input label="NEE (separadas por coma)" placeholder="Dificultad lectora, Discalculia" value={value} onChangeText={onChange} />
        )} />

        <View className="mt-2">
          <Button title="Guardar estudiante" onPress={handleSubmit(onSubmit)} loading={createStudent.isPending} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
