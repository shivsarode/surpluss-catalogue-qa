import { describe, expect, it } from "vitest";
import { effectiveStatus } from "../src/lib/catalogue-status";

describe("Catalogue lifecycle", () => {
  it("keeps a draft catalogue as draft", () => {
    expect(
      effectiveStatus("draft", null),
    ).toBe("draft");
  });

  it("keeps a published catalogue without expiry as published", () => {
    expect(
      effectiveStatus("published", null),
    ).toBe("published");
  });

  it("keeps a published catalogue with a future expiry as published", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    expect(
      effectiveStatus("published", futureDate),
    ).toBe("published");
  });

  it("marks a published catalogue with a past expiry as expired", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    expect(
      effectiveStatus("published", pastDate),
    ).toBe("expired");
  });
});