import { useState, useRef } from "react";
import { getAuthToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { getListOpenaiMessagesQueryKey } from "@workspace/api-client-react";

type Message = {
  id: number | string;
  role: string;
  content: string;
};

export function useChatStream(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();

  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return;

    // Add optimistic user message
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();
    
    setMessages(prev => [
      ...prev, 
      { id: userMsgId, role: "user", content },
      { id: assistantMsgId, role: "assistant", content: "" }
    ]);

    setIsStreaming(true);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) return;

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                // Done streaming
                break;
              } else if (data.content) {
                // Append text
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMsgId 
                    ? { ...msg, content: msg.content + data.content } 
                    : msg
                ));
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat streaming error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId 
          ? { ...msg, content: "Sorry, I encountered an error connecting to the AI." } 
          : msg
      ));
    } finally {
      setIsStreaming(false);
      // Invalidate to fetch actual persisted messages next time
      queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(conversationId) });
    }
  };

  return { messages, setMessages, sendMessage, isStreaming };
}
