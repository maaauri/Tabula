import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAiAssist } from "../../hooks/useAiAssist";

interface AiAssistPanelProps {
  visible: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  reportId: string;
  sectionKey: string;
}

const MODES = [
  { key: "generate", label: "Redactar" },
  { key: "improve", label: "Mejorar" },
  { key: "summarize", label: "Resumir" },
] as const;

export function AiAssistPanel({ visible, onClose, onInsert, reportId, sectionKey }: AiAssistPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"generate" | "improve" | "summarize">("generate");
  const { streamedText, isStreaming, generate, clear, error } = useAiAssist();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generate(reportId, sectionKey, prompt, mode);
  };

  const handleInsert = () => {
    onInsert(streamedText);
    clear();
    setPrompt("");
    onClose();
  };

  const handleClose = () => {
    clear();
    setPrompt("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View className="flex-1 bg-slate-50">
        <View className="bg-blue-700 px-4 pt-6 pb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text className="text-white text-lg font-bold">Asistente IA</Text>
          </View>
          <Pressable onPress={handleClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Mode selector */}
          <Text className="text-sm font-medium text-gray-700 mb-2">Modo</Text>
          <View className="flex-row gap-2 mb-4">
            {MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                className={`px-4 py-2 rounded-full border ${mode === m.key ? "bg-blue-700 border-blue-700" : "bg-white border-gray-300"}`}
              >
                <Text className={`text-sm font-medium ${mode === m.key ? "text-white" : "text-gray-700"}`}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Prompt */}
          <Text className="text-sm font-medium text-gray-700 mb-2">Instrucción</Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ej: Describe las fortalezas del estudiante en lectura comprensiva..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
            style={{ textAlignVertical: "top", minHeight: 80 }}
          />

          <Pressable
            onPress={handleGenerate}
            disabled={isStreaming || !prompt.trim()}
            className={`bg-blue-700 rounded-xl px-4 py-3 items-center flex-row justify-center gap-2 ${(isStreaming || !prompt.trim()) ? "opacity-50" : ""}`}
          >
            {isStreaming ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-semibold">Generando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text className="text-white font-semibold">Generar</Text>
              </>
            )}
          </Pressable>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {(streamedText || isStreaming) && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Resultado</Text>
              <View className="bg-white border border-gray-200 rounded-xl p-4 min-h-24">
                <Text className="text-gray-800 text-base leading-relaxed">{streamedText}</Text>
                {isStreaming && <Text className="text-blue-500 mt-1">▌</Text>}
              </View>

              {!isStreaming && streamedText && (
                <Pressable
                  onPress={handleInsert}
                  className="bg-green-600 rounded-xl px-4 py-3 items-center mt-3 flex-row justify-center gap-2"
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text className="text-white font-semibold">Insertar en sección</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
