import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCoachChat } from "../../src/api/hooks";
import type { ChatMessage } from "../../src/types/api";

const SUGGESTIONS = [
  "Why am I struggling in the later rounds?",
  "What should I focus on this week?",
  "Create a conditioning session for me.",
  "How has my training changed lately?",
];

interface DisplayMessage extends ChatMessage {
  id: string;
}

export default function CoachScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const chat = useCoachChat();
  const listRef = useRef<FlatList>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;

    const userMessage: DisplayMessage = { id: `${Date.now()}-u`, role: "user", content: trimmed };
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await chat.mutateAsync({ message: trimmed, history });
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: "assistant",
          content: "Coach IQ is unavailable right now — try again in a moment.",
        },
      ]);
    } finally {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-surface-high border border-white/10 items-center justify-center mb-3">
            <Text className="text-brand text-3xl">🤖</Text>
          </View>
          <Text className="text-white text-2xl font-bold">Coach IQ</Text>
          <Text className="text-white/50 text-sm mt-1 mb-6">Always in your corner</Text>

          <View className="flex-row flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => send(s)}
                accessibilityRole="button"
                accessibilityLabel={s}
                className="border border-white/10 bg-surface rounded-full px-3 py-2"
              >
                <Text className="text-white/70 text-xs font-bold">{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) =>
            item.role === "user" ? (
              <View className="items-end">
                <View className="bg-brand rounded-xl rounded-tr-sm px-4 py-3 max-w-[85%] border border-white/10">
                  <Text className="text-white">{item.content}</Text>
                </View>
              </View>
            ) : (
              <View className="items-start flex-row gap-2">
                <View className="w-8 h-8 rounded-full bg-surface-high border border-white/10 items-center justify-center mt-1">
                  <Text className="text-brand text-sm">🤖</Text>
                </View>
                <View className="bg-surface border border-white/10 rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                  <Text className="text-white">{item.content}</Text>
                </View>
              </View>
            )
          }
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {chat.isPending && (
        <View className="flex-row items-center gap-2 px-4 pb-2">
          <ActivityIndicator size="small" color="#FF2E4D" />
          <Text className="text-white/40 text-xs">Coach IQ is thinking...</Text>
        </View>
      )}

      <View className="p-4 border-t border-white/10">
        <View className="relative flex-row items-center">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Coach IQ..."
            placeholderTextColor="#666"
            className="flex-1 bg-background border border-white/10 text-white rounded-xl pl-4 pr-12 py-3"
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            accessibilityLabel="Message to Coach IQ"
          />
          <Pressable
            onPress={() => send(input)}
            disabled={chat.isPending || !input.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: chat.isPending || !input.trim(), busy: chat.isPending }}
            className="absolute right-3 items-center justify-center active:opacity-80"
          >
            <Text className="text-brand text-lg">➤</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
