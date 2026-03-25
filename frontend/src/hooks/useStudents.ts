import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as studentsApi from "../api/students";
import type { StudentCreate, StudentUpdate } from "../types/student";

export function useStudents() {
  return useQuery({ queryKey: ["students"], queryFn: studentsApi.getStudents });
}

export function useStudent(id: string) {
  return useQuery({ queryKey: ["students", id], queryFn: () => studentsApi.getStudent(id), enabled: !!id });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentCreate) => studentsApi.createStudent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StudentUpdate) => studentsApi.updateStudent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["students", id] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsApi.deleteStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}
