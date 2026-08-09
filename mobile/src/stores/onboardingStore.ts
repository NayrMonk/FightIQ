import { create } from "zustand";

// ponytail: in-memory only; persisted to the backend profile on welcome-summary's continue actions.
interface OnboardingState {
  disciplines: string[];
  goal: string | null;
  experience: string | null;
  toggleDiscipline: (d: string) => void;
  setGoal: (g: string) => void;
  setExperience: (e: string) => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  disciplines: [],
  goal: null,
  experience: null,
  toggleDiscipline: (d) => {
    const current = get().disciplines;
    set({
      disciplines: current.includes(d) ? current.filter((x) => x !== d) : [...current, d],
    });
  },
  setGoal: (g) => set({ goal: g }),
  setExperience: (e) => set({ experience: e }),
}));
