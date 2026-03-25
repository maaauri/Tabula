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
import { API_BASE_URL } from "../../../src/utils/constants";

function SectionEditor({
  section,
  reportId,
  onRequestAi,
}: {
  section: ReportSection;
  reportId: string;
  onRequestAi: (sectionKey: string) => void;
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
    <View className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
      <View className="bg-gray-50 px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <Text className="font-semibold text-gray-700 flex-1" numberOfLines={1}>{section.title}</Text>
        <Pressable onPress={() => onRequestAi(section.section_key)} className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
          <Ionicons name="sparkles" size={14} color="#1d4ed8" />
          <Text className="text-blue-700 text-xs font-semibold">IA</Text>
        </Pressable>
      </View>
      <TextInput
        value={content}
        onChangeText={(t) => { setContent(t); setDirty(true); }}
        onBlur={save}
        multiline
        placeholder="Escribe el contenido de esta sección..."
        placeholderTextColor="#9ca3af"
        className="px-4 py-3 text-base text-gray-800"
        style={{ textAlignVertical: "top", minHeight: 120 }}
      />
      {dirty && (
        <Pressable onPress={save} className="mx-4 mb-3 bg-blue-700 rounded-lg py-2 items-center">
          {updateSection.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white text-sm font-semibold">Guardar</Text>
          )}
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
  const token = useAuthStore((s) => s.token);

  const [aiSectionKey, setAiSectionKey] = useState<string | null>(null);
  const [aiVisible, setAiVisible] = useState(false);
  const [sectionContents, setSectionContents] = useState<Record<string, string>>({});
  const updateSection = useUpdateSection(id!);

  useEffect(() => {
    if (report) {
      navigation.setOptions({ title: report.title });
      const contents: Record<string, string> = {};
      report.sections.forEach((s) => { contents[s.section_key] = s.content; });
      setSectionContents(contents);
    }
  }, [report]);

  const handleExportPdf = async () => {
    const url = getPdfUrl(id!);
    try {
      const dest = FileSystem.documentDirectory + `informe_${id}.pdf`;
      const result = await FileSystem.downloadAsync(url, dest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Sharing.shareAsync(result.uri, { mimeType: "application/pdf" });
    } catch (err: any) {
      Alert.alert("Error", "No se pudo exportar el PDF");
    }
  };

  const handleAiInsert = async (sectionKey: string, text: string) => {
    setSectionContents((prev) => ({ ...prev, [sectionKey]: text }));
    await updateSection.mutateAsync({ sectionKey, content: text });
  };

  const handleMarkComplete = () => {
    updateReport.mutate({ status: report?.status === "completed" ? "draft" : "completed" });
  };

  if (isLoading) return <ActivityIndicator className="mt-12" color="#1d4ed8" />;
  if (!report) return <Text className="text-center mt-12 text-gray-500">Informe no encontrado</Text>;

  const activeSection = report.sections.find((s) => s.section_key === aiSectionKey);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-slate-50">
      {/* Header actions */}
      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center justify-between">
        <View className={`rounded-full px-3 py-1 ${report.status === "completed" ? "bg-green-100" : "bg-amber-100"}`}>
          <Text className={`text-xs font-semibold ${report.status === "completed" ? "text-green-700" : "text-amber-700"}`}>
            {report.status === "completed" ? "Completado" : "Borrador"}
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable onPress={handleMarkComplete} className="bg-gray-100 rounded-lg px-3 py-2">
            <Text className="text-gray-700 text-sm font-medium">
              {report.status === "completed" ? "Reabrir" : "Completar"}
            </Text>
          </Pressable>
          <Pressable onPress={handleExportPdf} className="bg-blue-700 rounded-lg px-3 py-2 flex-row items-center gap-1">
            <Ionicons name="download-outline" size={16} color="#fff" />
            <Text className="text-white text-sm font-semibold">PDF</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {report.period && (
          <Text className="text-gray-500 text-sm mb-4">Período: {report.period}</Text>
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
