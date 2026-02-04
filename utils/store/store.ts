import { create } from "zustand";

export interface FilterTabState {
    tabs: "all" | "income" | "expense";
    setTabs: (tabs: "all" | "income" | "expense") => void;
}

export const useFilterTabStore = create<FilterTabState>((set) => ({
    tabs: "all",
    setTabs: (tabs: "all" | "income" | "expense") => set({ tabs }),
}))

export interface MonthYearState {
    date: Date;
    setDate: (date: Date) => void;
}

export const useMonthYearStore = create<MonthYearState>((set) => ({
    date: new Date(),
    setDate: (date: Date) => set({ date }),
}));