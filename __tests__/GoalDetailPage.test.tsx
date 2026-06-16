import { render, screen, waitFor } from "@testing-library/react";
import { act, Suspense } from "react";
import { useDataStore } from "@/store/dataStore";

jest.mock("@/store/dataStore", () => ({
  useDataStore: jest.fn(),
}));

describe("GoalDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle undefined goal without crashing", async () => {
    (useDataStore as unknown as jest.Mock).mockReturnValue({
      getGoal: jest.fn().mockReturnValue(undefined),
      fetchGoalDetail: jest.fn().mockRejectedValue(new Error("Network error")),
    });

    const { default: GoalDetailPage } =
      await import("@/app/(app)/goals/[id]/page");

    expect(() =>
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <GoalDetailPage params={Promise.resolve({ id: "test-id" })} />
        </Suspense>,
      ),
    ).not.toThrow();
  });

  it("should show error state when fetch fails", async () => {
    (useDataStore as unknown as jest.Mock).mockReturnValue({
      getGoal: jest.fn().mockReturnValue(undefined),
      fetchGoalDetail: jest.fn().mockRejectedValue(new Error("Network error")),
    });

    const { default: GoalDetailPage } =
      await import("@/app/(app)/goals/[id]/page");

    await act(async () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <GoalDetailPage params={Promise.resolve({ id: "test-id" })} />
        </Suspense>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load goal details"),
      ).toBeInTheDocument();
    });
  });
});
