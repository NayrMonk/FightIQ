import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./client";
import type {
  AnalyticsSummary,
  CompleteSessionResponse,
  DashboardResponse,
  PersonalRecord,
  Profile,
  ProgrammeDetail,
  ProgrammeSummary,
  SessionTemplateDetail,
  UserSession,
  UserSessionDetail,
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
