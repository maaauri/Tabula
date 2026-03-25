import type { Token, User } from "../types/auth";
import apiClient from "./client";

export async function login(email: string, password: string): Promise<Token> {
  const { data } = await apiClient.post<Token>("/auth/login", { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function register(email: string, full_name: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", { email, full_name, password });
  return data;
}
