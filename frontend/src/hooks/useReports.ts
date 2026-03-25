import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as reportsApi from "../api/reports";
import type { ReportCreate } from "../types/report";

export function useReports() {
  return useQuery({ queryKey: ["reports"], queryFn: reportsApi.getReports });
}

export function useReport(id: string) {
  return useQuery({ queryKey: ["reports", id], queryFn: () => reportsApi.getReport(id), enabled: !!id });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportCreate) => reportsApi.createReport(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useUpdateReport(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ title: string; period: string; status: string }>) => reportsApi.updateReport(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["reports", id] });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportsApi.deleteReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useUpdateSection(reportId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionKey, content }: { sectionKey: string; content: string }) =>
      reportsApi.updateSection(reportId, sectionKey, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports", reportId] }),
  });
}

export function useTemplates() {
  return useQuery({ queryKey: ["templates"], queryFn: reportsApi.getTemplates });
}
