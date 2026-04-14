import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { virtualTryOn } from "./vton";

vi.mock("@gradio/client", () => ({
  Client: {
    connect: vi.fn(),
  },
}));

const { Client } = await import("@gradio/client");

const mockClient = {
  predict: vi.fn(),
};

describe("virtualTryOn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (Client.connect as any).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockFile = (name = "test.jpg") =>
    new File(["dummy-content"], name, { type: "image/jpeg" });

  it("should return success with resultUrl on valid response", async () => {
    mockClient.predict.mockResolvedValue({
      data: [{ url: "https://hf.space/result.jpg" }],
    });

    const personImage = createMockFile("person.jpg");
    const garmentImage = createMockFile("garment.jpg");

    const result = await virtualTryOn(personImage, garmentImage);

    expect(result.success).toBe(true);
    expect(result.resultUrl).toBe("https://hf.space/result.jpg");
    expect(Client.connect).toHaveBeenCalledWith("yisol/IDM-VTON");
    expect(mockClient.predict).toHaveBeenCalledWith("/tryon", [
      { background: personImage, layers: [], composite: null },
      garmentImage,
      null,
      true,
      false,
      30,
      42,
    ]);
  });

  it("should return error when model returns no result", async () => {
    mockClient.predict.mockResolvedValue({ data: [null] });

    const personImage = createMockFile("person.jpg");
    const garmentImage = createMockFile("garment.jpg");

    const result = await virtualTryOn(personImage, garmentImage);

    expect(result.success).toBe(false);
    expect(result.error).toBe("لم يتم إرجاع نتيجة من الموديل");
  });

  it("should return error when client connection fails", async () => {
    (Client.connect as any).mockRejectedValue(new Error("Connection failed"));

    const personImage = createMockFile("person.jpg");
    const garmentImage = createMockFile("garment.jpg");

    const result = await virtualTryOn(personImage, garmentImage);

    expect(result.success).toBe(false);
    expect(result.error).toBe("حدث خطأ أثناء معالجة الصور");
  });

  it("should fallback to secondary space on timeout", async () => {
    mockClient.predict.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 25000))
    );

    const personImage = createMockFile("person.jpg");
    const garmentImage = createMockFile("garment.jpg");

    const resultPromise = virtualTryOn(personImage, garmentImage);

    await vi.advanceTimersByTimeAsync(20000);

    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.error).toBe("الموديل مشغول حالياً، حاول مرة أخرى");
  });
});
