import { describe, expect, it } from "vitest";
import { estimateReading, splitTextIntoChunks, textMetrics } from "./chawavoice";

describe("ChawaVoice text and duration rules", () => {
  it("counts 10 characters and 2 words in the concrete sample", () => {
    expect(textMetrics("Olá, mundo")).toEqual({ characters: 10, words: 2 });
  });

  it("splits a text longer than 1800 characters into pieces within the chunk size", () => {
    const chunks = splitTextIntoChunks("a".repeat(3601));
    expect(chunks.map((chunk) => chunk.length)).toEqual([1800, 1800, 1]);
  });

  it("warns rather than silently setting a playback speed above 1.35x", () => {
    expect(estimateReading(310, 60, 1).tooFast).toBe(true);
  });

  it("accepts the requested five-minute reading duration at 155 words per minute", () => {
    expect(estimateReading(775, 300, 1).effectiveRate).toBe(1);
  });
});
