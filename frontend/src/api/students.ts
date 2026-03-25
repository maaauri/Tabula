import type { Student, StudentCreate, StudentUpdate } from "../types/student";
import apiClient from "./client";

export async function getStudents(): Promise<Student[]> {
  const { data } = await apiClient.get<Student[]>("/students");
  return data;
}

export async function getStudent(id: string): Promise<Student> {
  const { data } = await apiClient.get<Student>(`/students/${id}`);
  return data;
}

export async function createStudent(payload: StudentCreate): Promise<Student> {
  const { data } = await apiClient.post<Student>("/students", payload);
  return data;
}

export async function updateStudent(id: string, payload: StudentUpdate): Promise<Student> {
  const { data } = await apiClient.put<Student>(`/students/${id}`, payload);
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  await apiClient.delete(`/students/${id}`);
}
