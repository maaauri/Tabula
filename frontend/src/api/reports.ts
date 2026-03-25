import type { Report, ReportCreate, ReportTemplate } from "../types/report";
import { API_BASE_URL } from "../utils/constants";
import { useAuthStore } from "../store/authStore";
import apiClient from "./client";

export async function getReports(): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>("/reports");
  return data;
}

export async function getReport(id: string): Promise<Report> {
  const { data } = await apiClient.get<Report>(`/reports/${id}`);
  return data;
}

export async function createReport(payload: ReportCreate): Promise<Report> {
  const { data } = await apiClient.post<Report>("/reports", payload);
  return data;
}

export async function updateReport(id: string, payload: Partial<{ title: string; period: string; status: string }>): Promise<Report> {
  const { data } = await apiClient.put<Report>(`/reports/${id}`, payload);
  return data;
}

export async function deleteReport(id: string): Promise<void> {
  await apiClient.delete(`/reports/${id}`);
}

export async function updateSection(reportId: string, sectionKey: string, content: string): Promise<void> {
  await apiClient.put(`/reports/${reportId}/sections/${sectionKey}`, { content });
}

export async function getTemplates(): Promise<ReportTemplate[]> {
  const { data } = await apiClient.get<ReportTemplate[]>("/reports/templates");
  return data;
}

export function getPdfUrl(reportId: string): string {
  return `${API_BASE_URL}/reports/${reportId}/export/pdf`;
}

export function getAiAssistUrl(reportId: string, sectionKey: string): string {
  return `${API_BASE_URL}/reports/${reportId}/sections/${sectionKey}/ai-assist`;
}
