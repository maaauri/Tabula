import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { Button } from "../../src/components/common/Button";
import { Input } from "../../src/components/common/Input";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      Alert.alert("Error", "Credenciales incorrectas. Verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-brand-700">
      <ScrollView contentContainerClassName="flex-1 justify-end">

        {/* Hero */}
        <View className="flex-1 items-center justify-center px-6 pt-16 pb-8">
          <View className="w-24 h-24 rounded-3xl bg-white/20 items-center justify-center mb-5 border-2 border-white/30">
            <Text className="text-white text-5xl font-black">T</Text>
          </View>
          <Text className="text-white text-4xl font-black tracking-tight">Tabula</Text>
          <Text className="text-brand-300 text-base mt-2 text-center">
            Plataforma PIE para educadores chilenos
          </Text>
        </View>

        {/* Card */}
        <View className="bg-white rounded-t-3xl px-6 pt-8 pb-10">
          <Text className="text-2xl font-black text-brand-800 mb-1">Iniciar sesión</Text>
          <Text className="text-brand-400 text-sm mb-6">Ingresa con tu cuenta de educador</Text>

          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input
              label="Correo electrónico"
              placeholder="educador@escuela.cl"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )} />

          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )} />

          <View className="mt-2">
            <Button title="Ingresar" onPress={handleSubmit(onSubmit)} loading={loading} />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
