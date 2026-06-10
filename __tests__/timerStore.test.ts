import { useTimerStore } from "@/store/timerStore";
import { timeEntryService } from "@/lib/services";
import { timerStateService } from "@/lib/services/timerStateService";

// Mock the services so no real API calls happen
jest.mock("@/lib/services", () => ({
  timeEntryService: {
    bulkLog: jest.fn().mockResolvedValue([]),
    completePomodoroSession: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/lib/services/timerStateService", () => ({
  timerStateService: {
    save: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue(null),
    clear: jest.fn().mockResolvedValue({}),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn().mockReturnValue(null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Reset the store before each test
beforeEach(() => {
  useTimerStore.setState({
    runningTimer: null,
    elapsed: 0,
    sessionStartTime: null,
    accumulatedBeforePause: 0,
    selectedTask: null,
    timerMode: "SIMPLE",
    sessionHistory: [],
    syncInterval: null,
  });
  jest.clearAllMocks();
});

describe("Timer Store - start()", () => {
  it("should throw error if no task selected", async () => {
    await expect(useTimerStore.getState().start()).rejects.toThrow(
      "Please select a task first",
    );
  });

  it("should set running timer when task is selected", async () => {
    useTimerStore.setState({
      selectedTask: { id: "task-1", title: "Test Task", color: "#000" } as any,
    });

    await useTimerStore.getState().start();

    const state = useTimerStore.getState();
    expect(state.runningTimer).not.toBeNull();
    expect(state.runningTimer?.status).toBe("RUNNING");
    expect(state.elapsed).toBe(0);
  });
});

describe("Timer Store - pause()", () => {
  it("should calculate elapsed time on pause", () => {
    const now = Date.now();
    useTimerStore.setState({
      runningTimer: { id: "local-test", status: "RUNNING" } as any,
      sessionStartTime: now - 5000,
      accumulatedBeforePause: 0,
    });

    useTimerStore.getState().pause();

    const state = useTimerStore.getState();
    expect(state.runningTimer?.status).toBe("PAUSED");
    expect(state.accumulatedBeforePause).toBeGreaterThanOrEqual(5);
  });
});

describe("Timer Store - stop()", () => {
  it("should clear timer state on stop", async () => {
    useTimerStore.setState({
      runningTimer: { id: "local-test", status: "RUNNING" } as any,
      elapsed: 10,
      selectedTask: { id: "task-1", title: "Test", color: "#000" } as any,
      sessionHistory: [
        {
          taskId: "task-1",
          taskTitle: "Test",
          startTime: Date.now() - 10000,
          endTime: Date.now(),
          color: "#000",
        },
      ],
    });

    await useTimerStore.getState().stop();

    const state = useTimerStore.getState();
    expect(state.runningTimer).toBeNull();
    expect(state.elapsed).toBe(0);
    expect(state.sessionHistory).toEqual([]);
  });

  it("should call bulkLog with session entries", async () => {
    const now = Date.now();
    useTimerStore.setState({
      runningTimer: { id: "local-test", status: "RUNNING" } as any,
      elapsed: 10,
      selectedTask: { id: "task-1", title: "Test", color: "#000" } as any,
      sessionHistory: [
        {
          taskId: "task-1",
          taskTitle: "Test",
          startTime: now - 10000,
          endTime: now,
          color: "#000",
        },
      ],
    });

    await useTimerStore.getState().stop();

    expect(timeEntryService.bulkLog).toHaveBeenCalled();
  });
});
