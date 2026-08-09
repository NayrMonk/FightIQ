import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./client";
import type {
  ActivityEvent,
  AnalyticsSummary,
  Challenge,
  ChallengeDetail,
  ChatMessage,
  ChatResponse,
  CompleteSessionResponse,
  DashboardResponse,
  LeaderboardEntry,
  NotificationResponse,
  PersonalRecord,
  Profile,
  ProgrammeDetail,
  ProgrammeSummary,
  SessionTemplateDetail,
  UserSession,
  UserSessionDetail,
  UserSummary,
} from "../types/api";

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: () => api.get<DashboardResponse>("/dashboard") });
}

export function useProfile() {
  return useQuery({ queryKey: ["profile"], queryFn: () => api.get<Profile>("/profile/me") });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Profile>) => api.put<Profile>("/profile/me", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useProgrammes() {
  return useQuery({ queryKey: ["programmes"], queryFn: () => api.get<ProgrammeSummary[]>("/programmes") });
}

export function useProgramme(id: number) {
  return useQuery({
    queryKey: ["programme", id],
    queryFn: () => api.get<ProgrammeDetail>(`/programmes/${id}`),
    enabled: !!id,
  });
}

export function useSessionTemplate(id: number | undefined) {
  return useQuery({
    queryKey: ["session-template", id],
    queryFn: () => api.get<SessionTemplateDetail>(`/session-templates/${id}`),
    enabled: !!id,
  });
}

export function useUserSessionDetail(id: number | undefined) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => api.get<UserSessionDetail>(`/sessions/${id}`),
    enabled: !!id,
  });
}

export function useTodaySession() {
  return useQuery({
    queryKey: ["sessions", "today"],
    queryFn: () => api.get<UserSessionDetail | null>("/sessions/today"),
  });
}

export function useStartSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { session_template_id: number; scheduled_date: string }) =>
      api.post<UserSession>("/sessions", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", "today"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userSessionId,
      payload,
    }: {
      userSessionId: number;
      payload: { rounds_completed: number; total_duration_sec: number; perceived_intensity?: number; notes?: string };
    }) => api.post<CompleteSessionResponse>(`/sessions/${userSessionId}/complete`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", "today"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useHistory() {
  return useQuery({ queryKey: ["history"], queryFn: () => api.get<UserSession[]>("/history") });
}

export function useAnalyticsSummary() {
  return useQuery({ queryKey: ["analytics", "summary"], queryFn: () => api.get<AnalyticsSummary>("/analytics/summary") });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: ["analytics", "personal-records"],
    queryFn: () => api.get<PersonalRecord[]>("/analytics/personal-records"),
  });
}

export function useCoachChat() {
  return useMutation({
    mutationFn: (payload: { message: string; history: ChatMessage[] }) =>
      api.post<ChatResponse>("/coach/chat", payload),
  });
}

export function useFollowers() {
  return useQuery({ queryKey: ["social", "followers"], queryFn: () => api.get<UserSummary[]>("/social/followers") });
}

export function useFollowing() {
  return useQuery({ queryKey: ["social", "following"], queryFn: () => api.get<UserSummary[]>("/social/following") });
}

function invalidateSocial(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["social", "following"] });
  queryClient.invalidateQueries({ queryKey: ["social", "followers"] });
  queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
  queryClient.invalidateQueries({ queryKey: ["social", "leaderboard"] });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.post<UserSummary>(`/social/follow/${userId}`),
    onSuccess: () => invalidateSocial(queryClient),
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.delete<void>(`/social/follow/${userId}`),
    onSuccess: () => invalidateSocial(queryClient),
  });
}

export function useFeed(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["social", "feed", limit, offset],
    queryFn: () => api.get<ActivityEvent[]>(`/social/feed?limit=${limit}&offset=${offset}`),
  });
}

export function useLeaderboard(metric: "streak" | "sessions", scope: "global" | "following") {
  return useQuery({
    queryKey: ["social", "leaderboard", metric, scope],
    queryFn: () => api.get<LeaderboardEntry[]>(`/social/leaderboard?metric=${metric}&scope=${scope}`),
  });
}

export function useChallenges() {
  return useQuery({ queryKey: ["social", "challenges"], queryFn: () => api.get<Challenge[]>("/social/challenges") });
}

export function useChallenge(id: number | undefined) {
  return useQuery({
    queryKey: ["social", "challenges", id],
    queryFn: () => api.get<ChallengeDetail>(`/social/challenges/${id}`),
    enabled: !!id,
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      title: string;
      description?: string | null;
      metric: string;
      target_value: number;
      start_date: string;
      end_date: string;
    }) => api.post<Challenge>("/social/challenges", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "challenges"] }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotificationResponse[]>("/notifications"),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/notifications/mark-all-read"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: (expo_push_token: string) => api.post<void>("/notifications/register-token", { expo_push_token }),
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (challengeId: number) => api.post(`/social/challenges/${challengeId}/join`),
    onSuccess: (_data, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ["social", "challenges"] });
      queryClient.invalidateQueries({ queryKey: ["social", "challenges", challengeId] });
    },
  });
}
