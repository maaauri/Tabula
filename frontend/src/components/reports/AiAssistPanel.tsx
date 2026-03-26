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
  { key: "generate",  label: "Redactar",  icon: "create-outline" as const },
  { key: "improve",   label: "Mejorar",   icon: "trending-up-outline" as const },
  { key: "summarize", label: "Resumir",   icon: "contract-outline" as const },
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
      <View className="flex-1 bg-brand-50">

        {/* Header */}
        <View className="bg-brand-700 px-5 pt-6 pb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
            <View>
              <Text className="text-white text-lg font-black">Asistente IA</Text>
              <Text className="text-brand-300 text-xs">Powered by GPT-4o</Text>
            </View>
          </View>
          <Pressable onPress={handleClose} className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4 pt-5">

          {/* Mode selector */}
          <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-3">Modo</Text>
          <View className="flex-row gap-2 mb-5">
            {MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMode(m.key)}
                className={`flex-1 items-center py-3 rounded-2xl border-2 gap-1 ${mode === m.key ? "bg-brand-600 border-brand-600" : "bg-white border-brand-100"}`}
              >
                <Ionicons name={m.icon} size={18} color={mode === m.key ? "#fff" : "#7c3aed"} />
                <Text className={`text-xs font-bold ${mode === m.key ? "text-white" : "text-brand-600"}`}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Prompt */}
          <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-2">Instrucción</Text>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Ej: Describe las fortalezas del estudiante en lectura comprensiva..."
            placeholderTextColor="#c4b5fd"
            multiline
            numberOfLines={3}
            className="bg-white border-2 border-brand-200 rounded-2xl px-4 py-3 text-sm text-brand-800 mb-4"
            style={{ textAlignVertical: "top", minHeight: 90 }}
          />

          <Pressable
            onPress={handleGenerate}
            disabled={isStreaming || !prompt.trim()}
            className={`bg-brand-600 rounded-2xl py-4 items-center flex-row justify-center gap-2 ${(isStreaming || !prompt.trim()) ? "opacity-50" : "active:opacity-80"}`}
          >
            {isStreaming ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-bold">Generando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={17} color="#fff" />
                <Text className="text-white font-bold">Generar texto</Text>
              </>
            )}
          </Pressable>

          {error && (
            <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mt-4">
              <Text className="text-red-600 text-sm font-medium">{error}</Text>
            </View>
          )}

          {(streamedText || isStreaming) && (
            <View className="mt-5">
              <Text className="text-xs font-black text-brand-500 uppercase tracking-widest mb-2">Resultado</Text>
              <View className="bg-white border-2 border-brand-100 rounded-2xl p-4 min-h-28">
                <Text className="text-brand-800 text-sm leading-relaxed">{streamedText}</Text>
                {isStreaming && <Text className="text-brand-400 mt-1 font-bold">▌</Text>}
              </View>

              {!isStreaming && streamedText && (
                <Pressable
                  onPress={handleInsert}
                  className="bg-accent-500 rounded-2xl py-4 items-center mt-3 flex-row justify-center gap-2 active:opacity-80"
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text className="text-white font-bold">Insertar en sección</Text>
                </Pressable>
              )}
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
}
