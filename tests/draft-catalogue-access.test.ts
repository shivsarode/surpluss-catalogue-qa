import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from "@/lib/prisma";
import { GET } from "@/app/api/catalogues/[slug]/search/route";

describe("Draft catalogue access control", () => {
  it("does not expose draft catalogue products through the public search API", async () => {
    vi.mocked(getPrisma).mockReturnValue({
      catalogue: {
        findUnique: vi.fn().mockResolvedValue({
          id: "550e8400-e29b-41d4-a716-446655440010",
          status: "draft",
          expiresAt: null,
        }),
      },
      catalogueListing: {
        findMany: vi.fn().mockResolvedValue([
          {
            productId: "550e8400-e29b-41d4-a716-446655440011",
            product: {
              name: "Confidential Product",
              sku: "CONF-001",
              offerPrice: 100,
            },
          },
        ]),
      },
    } as never);

    const response = await GET(
      new Request(
        "http://localhost:3001/api/catalogues/festive-overstock-2026/search?q=product",
      ),
      {
        params: Promise.resolve({
          slug: "festive-overstock-2026",
        }),
      },
    );

    expect(response.status).toBe(403);
  });
});
