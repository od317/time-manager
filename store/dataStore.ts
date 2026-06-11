// store/dataStore.ts
import { create } from "zustand";
import { Goal, Habit, Task } from "@/types";
import { todayService } from "@/lib/services/todayService";
import { goalService } from "@/lib/services/goalService";
import { habitService } from "@/lib/services/habitService";

interface DataState {
  // Today page data
  goals: Goal[];
  habits: Habit[];
  todayTasks: Task[];
  todayStats: {
    activeGoals: number;
    overdueGoals: number;
    totalGoals: number;
    habitsDue: number;
    activeTasks: number;
    completedToday: number;
    habitsCompletedToday: number;
  } | null;

  // Goals page data (all statuses)
  allGoals: Goal[];

  // Habits page data (all statuses)
  allHabits: Habit[];

  // Goal details cache
  goalDetails: Map<string, Goal>;

  // Loading states
  todayLoaded: boolean;
  allGoalsLoaded: boolean;
  allHabitsLoaded: boolean;

  // Actions
  fetchTodayData: () => Promise<void>;
  fetchAllGoals: () => Promise<void>;
  fetchAllHabits: () => Promise<void>;
  fetchGoalDetail: (id: string) => Promise<Goal>;

  // Local mutations (update cache without refetching)
  updateGoalInCache: (id: string, updates: Partial<Goal>) => void;
  updateTaskInCache: (taskId: string, updates: Partial<Task>) => void;
  addTaskToCache: (goalId: string, task: Task) => void;
  removeTaskFromCache: (taskId: string, goalId: string) => void;
  updateHabitInCache: (id: string, updates: Partial<Habit>) => void;

  // Helpers
  getGoal: (id: string) => Goal | undefined;
  getHabit: (id: string) => Habit | undefined;
  isTodayStale: () => boolean;
  isAllGoalsStale: () => boolean;
  isAllHabitsStale: () => boolean;
}

// Recursively update a goal in a nested goal tree
function updateGoalInTree(
  goals: Goal[],
  id: string,
  updates: Partial<Goal>,
): Goal[] {
  return goals.map((g) => {
    if (g.id === id) return { ...g, ...updates };
    if (g.children?.length) {
      return { ...g, children: updateGoalInTree(g.children, id, updates) };
    }
    return g;
  });
}

// Recursively find a goal by ID
function findGoalInTree(goals: Goal[], id: string): Goal | undefined {
  for (const g of goals) {
    if (g.id === id) return g;
    if (g.children?.length) {
      const found = findGoalInTree(g.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial state
  goals: [],
  habits: [],
  todayTasks: [],
  todayStats: null,
  allGoals: [],
  allHabits: [],
  goalDetails: new Map(),
  todayLoaded: false,
  allGoalsLoaded: false,
  allHabitsLoaded: false,

  // ==========================================================================
  // FETCH ACTIONS
  // ==========================================================================

  fetchTodayData: async () => {
    const response = await todayService.getAll();
    set({
      goals: response.goals,
      habits: response.habits,
      todayTasks: response.tasks,
      todayStats: response.stats,
      todayLoaded: true,
    });
  },

  fetchAllGoals: async () => {
    const allGoals = await goalService.getAllNoPagination();
    set({ allGoals, allGoalsLoaded: true });
  },

  fetchAllHabits: async () => {
    const allHabits = await habitService.getAll();
    set({ allHabits, allHabitsLoaded: true });
  },

  fetchGoalDetail: async (id: string) => {
    const goal = await goalService.getById(id);
    set((state) => {
      const newDetails = new Map(state.goalDetails);
      newDetails.set(id, goal);

      // Also update in allGoals and goals arrays
      const updatedAllGoals = updateGoalInTree(state.allGoals, id, goal);
      const updatedGoals = updateGoalInTree(state.goals, id, goal);

      return {
        goalDetails: newDetails,
        allGoals: updatedAllGoals,
        goals: updatedGoals,
      };
    });
    return goal;
  },

  // ==========================================================================
  // LOCAL MUTATIONS
  // ==========================================================================

  updateGoalInCache: (id, updates) =>
    set((state) => ({
      goals: updateGoalInTree(state.goals, id, updates),
      allGoals: updateGoalInTree(state.allGoals, id, updates),
    })),

  updateTaskInCache: (taskId, updates) =>
    set((state) => {
      const updateTasks = (tasks: Task[]) =>
        tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));

      const updateGoals = (goals: Goal[]): Goal[] =>
        goals.map((g) => ({
          ...g,
          tasks: g.tasks ? updateTasks(g.tasks) : g.tasks,
          children: g.children ? updateGoals(g.children) : g.children,
        }));

      return {
        goals: updateGoals(state.goals),
        allGoals: updateGoals(state.allGoals),
        todayTasks: updateTasks(state.todayTasks),
      };
    }),

  addTaskToCache: (goalId, task) =>
    set((state) => {
      const addTask = (goals: Goal[]): Goal[] =>
        goals.map((g) => {
          if (g.id === goalId) {
            return { ...g, tasks: [...(g.tasks || []), task] };
          }
          if (g.children?.length) {
            return { ...g, children: addTask(g.children) };
          }
          return g;
        });

      return {
        goals: addTask(state.goals),
        allGoals: addTask(state.allGoals),
      };
    }),

  removeTaskFromCache: (taskId, goalId) =>
    set((state) => {
      const removeTask = (goals: Goal[]): Goal[] =>
        goals.map((g) => {
          if (g.id === goalId) {
            return {
              ...g,
              tasks: (g.tasks || []).filter((t) => t.id !== taskId),
            };
          }
          if (g.children?.length) {
            return { ...g, children: removeTask(g.children) };
          }
          return g;
        });

      return {
        goals: removeTask(state.goals),
        allGoals: removeTask(state.allGoals),
        todayTasks: state.todayTasks.filter((t) => t.id !== taskId),
      };
    }),

  updateHabitInCache: (id, updates) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      allHabits: state.allHabits.map((h) =>
        h.id === id ? { ...h, ...updates } : h,
      ),
    })),

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  getGoal: (id) => {
    if (!id) return undefined; // Add this guard
    const state = get();
    return (
      state.goalDetails.get(id) ||
      findGoalInTree(state.allGoals, id) ||
      findGoalInTree(state.goals, id)
    );
  },

  getHabit: (id) => {
    const state = get();
    return (
      state.allHabits.find((h) => h.id === id) ||
      state.habits.find((h) => h.id === id)
    );
  },

  isTodayStale: () => !get().todayLoaded,
  isAllGoalsStale: () => !get().allGoalsLoaded,
  isAllHabitsStale: () => !get().allHabitsLoaded,
}));
