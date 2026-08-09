export interface Profile {
  display_name: string | null;
  weight_class: string | null;
  primary_discipline: string | null;
  experience_level: string | null;
  primary_goal: string | null;
  onboarding_completed_at: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  avatar_url: string | null;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string | null;
  default_instructions: string | null;
}

export interface RoundExercise {
  id: number;
  order_index: number;
  reps: number | null;
  duration_sec: number | null;
  notes: string | null;
  exercise: Exercise;
}

export interface Round {
  id: number;
  round_number: number;
  round_type: string;
  work_duration_sec: number;
  rest_duration_sec: number;
  round_exercises: RoundExercise[];
}

export interface SessionTemplateSummary {
  id: number;
  name: string;
  discipline: string;
  estimated_duration_min: number;
  intensity: string;
  description: string | null;
}

export interface SessionTemplateDetail extends SessionTemplateSummary {
  rounds: Round[];
}

export interface ScheduledSession {
  id: number;
  day_of_week: number;
  session_template: SessionTemplateSummary;
}

export interface ProgrammeWeek {
  id: number;
  week_number: number;
  scheduled_sessions: ScheduledSession[];
}

export interface ProgrammeSummary {
  id: number;
  name: string;
  discipline: string;
  description: string | null;
  duration_weeks: number;
  level: string;
}

export interface ProgrammeDetail extends ProgrammeSummary {
  weeks: ProgrammeWeek[];
}

export interface SessionResult {
  rounds_completed: number;
  total_duration_sec: number;
  perceived_intensity: number | null;
  notes: string | null;
}

export interface UserSession {
  id: number;
  scheduled_date: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  started_at: string | null;
  completed_at: string | null;
  session_template: SessionTemplateSummary;
  result: SessionResult | null;
}

export interface UserSessionDetail extends Omit<UserSession, "session_template"> {
  session_template: SessionTemplateDetail;
}

export interface PersonalRecord {
  record_type: string;
  value: number;
  achieved_at: string;
}

export interface DashboardResponse {
  today_session: UserSession | null;
  weekly_sessions_completed: number;
  weekly_sessions_scheduled: number;
  current_streak_days: number;
  recent_sessions: UserSession[];
  avg_recent_intensity: number | null;
}

export interface AnalyticsSummary {
  total_sessions_completed: number;
  sessions_last_7_days: number;
  sessions_last_30_days: number;
  avg_session_duration_sec: number;
  avg_perceived_intensity: number | null;
  round_completion_rate: number;
  current_streak_days: number;
  consistency_pct_last_4_weeks: number;
}

export interface CompleteSessionResponse {
  session: UserSession;
  new_personal_records: PersonalRecord[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export interface Follow {
  follower_id: number;
  followee_id: number;
  created_at: string;
}

export interface UserSummary {
  id: number;
  display_name: string | null;
}

export interface ActivityEvent {
  id: number;
  user: UserSummary;
  event_type: "session_completed" | "personal_record";
  payload: Record<string, unknown>;
  created_at: string;
}

export interface LeaderboardEntry {
  user: UserSummary;
  rank: number;
  value: number;
  metric: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string | null;
  metric: "total_sessions" | "total_rounds" | "streak_days";
  target_value: number;
  start_date: string;
  end_date: string;
  creator: UserSummary;
  participant_count: number;
}

export interface ChallengeParticipantEntry {
  user: UserSummary;
  current_value: number;
  completed_at: string | null;
}

export interface ChallengeDetail extends Challenge {
  participants: ChallengeParticipantEntry[];
}

export interface NotificationResponse {
  id: number;
  type: "session_reminder" | "streak_risk" | "new_activity" | (string & {});
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}
