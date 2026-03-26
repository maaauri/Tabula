import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AiAssistPanel } from "../../../src/components/reports/AiAssistPanel";
import { useReport, useUpdateReport, useUpdateSection } from "../../../src/hooks/useReports";
import { useAuthStore } from "../../../src/store/authStore";
import type { ReportSection } from "../../../src/types/report";
import { getPdfUrl } from "../../../src/api/reports";

function SectionEditor({
  section,
  reportId,
  onRequestAi,
}: {
  section: ReportSection;
  reportId: string;
  onRequestAi: (key: string) => void;
}) {
  const [content, setContent] = useState(section.content);
  const [dirty, setDirty] = useState(false);
  const updateSection = useUpdateSection(reportId);

  const save = useCallback(async () => {
    if (!dirty) return;
    await updateSection.mutateAsync({ sectionKey: section.section_key, content });
    setDirty(false);
  }, [content, dirty, section.section_key]);

  useEffect(() => {
    setContent(section.content);
    setDirty(false);
  }, [section.content]);

  return (
    <View className="bg-white rounded-3xl mb-4 overflow-hidden border-2 border-brand-100">
      {/* Section header */}
      <View className="px-4 py-3 flex-row items-center justify-between border-b border-brand-50">
        <View className="flex-row items-center flex-1 gap-2">
          <View className="w-2 h-2 rounded-full bg-brand-500" />
          <Text className="font-bold text-brand-700 flex-1 text-sm" numberOfLines={1}>{section.title}</Text>
        </View>
        <Pressable
          onPress={() => onRequestAi(section.section_key)}
          className="flex-row items-center gap-1.5 bg-brand-600 px-3 py-1.5 rounded-xl"
        >
          <Ionicons name="sparkles" size={13} color="#fff" />
          <Text className="text-white text-xs font-bold">Asistente IA</Text>
        </Pressable>
      </View>

      <TextInput
        value={content}
        onChangeText={(t) => { setContent(t); setDirty(true); }}
        onBlur={save}
        multiline
        placeholder="Escribe el contenido de esta sección..."
        placeholderTextColor="#c4b5fd"
        className="px-4 py-3 text-sm text-brand-800 leading-relaxed"
        style={{ textAlignVertical: "top", minHeight: 110 }}
      />

      {dirty && (
        <Pressable onPress={save} className="mx-4 mb-3 bg-accent-500 rounded-xl py-2.5 items-center flex-row justify-center gap-2">
          {updateSection.isPending
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Ionicons name="save-outline" size={15} color="#fff" />
                <Text className="text-white text-sm font-bold">Guardar</Text>
              </>
          }
        </Pressable>
      )}
    </View>
  );
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { data: report, isLoading } = useReport(id!);
  const updateReport = useUpdateReport(id!);
  const updateSection = useUpdateSection(id!);
  const token = useAuthStore((s) => s.token);

  const [aiSectionKey, setAiSectionKey] = useState<string | null>(null);
  const [aiVisible, setAiVisible] = useState(false);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({});

  useEffect(() => {
    if (report) {
      navigation.setOptions({ title: report.title });
      const m: Record<string, string> = {};
      report.sections.forEach((s) => { m[s.section_key] = s.content; });
      setSectionContents(m);
    }
  }, [report]);

  const handleExportPdf = async () => {
    try {
      const dest = FileSystem.documentDirectory + `informe_${id}.pdf`;
      const res = await FileSystem.downloadAsync(getPdfUrl(id!), dest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Sharing.shareAsync(res.uri, { mimeType: "application/pdf" });
    } catch {
      Alert.alert("Error", "No se pudo exportar el PDF");
    }
  };

  const handleAiInsert = async (sectionKey: string, text: string) => {
    setSectionContents((prev) => ({ ...prev, [sectionKey]: text }));
    await updateSection.mutateAsync({ sectionKey, content: text });
  };

  if (isLoading) return <ActivityIndicator className="mt-16" color="#7c3aed" size="large" />;
  if (!report) return <Text className="text-center mt-16 text-brand-400">Informe no encontrado</Text>;

  const completed = report.status === "completed";
  const activeSection = report.sections.find((s) => s.section_key === aiSectionKey);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-brand-50">
      {/* Toolbar */}
      <View className="bg-white border-b-2 border-brand-50 px-4 py-3 flex-row items-center justify-between">
        <View className={`rounded-full px-3 py-1 border ${completed ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <Text className={`text-xs font-bold ${completed ? "text-green-700" : "text-amber-600"}`}>
            {completed ? "✓ Completado" : "● Borrador"}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => updateReport.mutate({ status: completed ? "draft" : "completed" })}
            className="bg-brand-100 rounded-xl px-3 py-2"
          >
            <Text className="text-brand-700 text-xs font-bold">{completed ? "Reabrir" : "Completar"}</Text>
          </Pressable>
          <Pressable onPress={handleExportPdf} className="bg-accent-500 rounded-xl px-3 py-2 flex-row items-center gap-1.5">
            <Ionicons name="download-outline" size={15} color="#fff" />
            <Text className="text-white text-xs font-bold">PDF</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {report.period && (
          <View className="flex-row items-center gap-1.5 mb-4">
            <Ionicons name="calendar-outline" size={14} color="#a78bfa" />
            <Text className="text-brand-400 text-sm font-semibold">{report.period}</Text>
          </View>
        )}

        {report.sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={{ ...section, content: sectionContents[section.section_key] ?? section.content }}
            reportId={id!}
            onRequestAi={(key) => { setAiSectionKey(key); setAiVisible(true); }}
          />
        ))}
        <View className="h-8" />
      </ScrollView>

      {aiVisible && activeSection && (
        <AiAssistPanel
          visible={aiVisible}
          onClose={() => setAiVisible(false)}
          onInsert={(text) => handleAiInsert(aiSectionKey!, text)}
          reportId={id!}
          sectionKey={aiSectionKey!}
        />
      )}
    </KeyboardAvoidingView>
  );
}
