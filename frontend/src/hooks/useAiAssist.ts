import { useCallback, useRef, useState } from "react";
import { getAiAssistUrl } from "../api/reports";
import { useAuthStore } from "../store/authStore";

interface UseAiAssistResult {
  streamedText: string;
  isStreaming: boolean;
  generate: (reportId: string, sectionKey: string, prompt: string, mode?: string) => Promise<void>;
  clear: () => void;
  error: string | null;
}

export function useAiAssist(): UseAiAssistResult {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (reportId: string, sectionKey: string, prompt: string, mode = "generate") => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setStreamedText("");
    setError(null);
    setIsStreaming(true);

    const token = useAuthStore.getState().token;
    const url = getAiAssistUrl(reportId, sectionKey);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, mode }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6);
            if (payload === "[DONE]") continue;
            // Chunks are JSON-encoded strings to preserve newlines in SSE
            const chunk = JSON.parse(payload) as string;
            setStreamedText((prev) => prev + chunk);
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message ?? "Error al conectar con el asistente IA");
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setStreamedText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return { streamedText, isStreaming, generate, clear, error };
}
