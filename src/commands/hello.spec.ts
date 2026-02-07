import { describe, expect, it, vi } from "vitest";
import { helloHandler } from "./hello";

describe("helloHandler", () => {
  it("should print greeting message", async () => {
    // Arrange
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Act
    await helloHandler({ name: "Miguel" });

    // Assert
    expect(spy).toHaveBeenCalledWith("Hello, Miguel");

    // Clean up
    spy.mockRestore();
  });
});
