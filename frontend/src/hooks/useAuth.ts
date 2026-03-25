import { router } from "expo-router";
import { getMe, login as apiLogin } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore();

  async function login(email: string, password: string) {
    const tokenData = await apiLogin(email, password);
    // Temporarily set token to fetch /me
    useAuthStore.setState({ token: tokenData.access_token });
    const me = await getMe();
    setAuth(tokenData.access_token, me);
    router.replace("/(app)");
  }

  function logout() {
    clearAuth();
    router.replace("/(auth)/login");
  }

  return { token, user, login, logout, isAuthenticated: !!token };
}
