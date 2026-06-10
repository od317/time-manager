import { todayService } from "@/lib/services/todayService";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
  CancelKeys: {
    TODAY: "today:get",
  },
}));

it("should throw when api fails", async () => {
  (api.get as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));
  await expect(todayService.getAll()).rejects.toThrow("Network Error");
});

it("should return data when api succeeds", async () => {
  const mockData = { goals: [], habits: [], tasks: [], stats: [] };
  (api.get as jest.Mock).mockResolvedValueOnce(mockData);
  const result = await todayService.getAll();
  expect(result).toBe(mockData);
});
