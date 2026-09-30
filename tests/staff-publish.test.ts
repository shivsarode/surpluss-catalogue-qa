import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

vi.mock("@/lib/incomplete", () => ({
  findIncompleteProducts: vi.fn(),
  incompleteMessage: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { findIncompleteProducts } from "@/lib/incomplete";
import { PATCH } from "@/app/api/admin/catalogues/[id]/route";

describe("Staff catalogue publishing authorization", () => {
  it("should reject a Staff user from publishing a catalogue", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "staff-user",
        role: "staff",
      },
    } as never);

    vi.mocked(findIncompleteProducts).mockResolvedValue([]);

    const update = vi.fn().mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Festive overstock 2026",
      slug: "festive-overstock-2026",
      description: "Confidential catalogue",
      category: null,
      status: "published",
      banners: [],
      notifyNumber: null,
      expiresAt: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: {
        listings: 0,
        enquiries: 0,
      },
      listings: [],
    });

    vi.mocked(getPrisma).mockReturnValue({
      catalogue: {
        findUnique: vi.fn().mockResolvedValue({
          slug: "festive-overstock-2026",
          status: "draft",
        }),
        update,
      },
    } as never);

    const request = new Request(
      "http://localhost/api/admin/catalogues/550e8400-e29b-41d4-a716-446655440000",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Festive overstock 2026",
          slug: "festive-overstock-2026",
          description: "Confidential catalogue",
          category: "",
          notifyNumber: "",
          status: "published",
          validUntil: null,
          banners: [],
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: "550e8400-e29b-41d4-a716-446655440000",
      }),
    });

    expect(response.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });
});