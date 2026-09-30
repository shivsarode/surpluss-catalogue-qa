import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { PATCH } from "@/app/api/admin/catalogues/[id]/listings/[listingId]/route";

describe("ID tampering protection", () => {
  it("rejects a listing ID that belongs to another catalogue", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "staff-user",
        role: "staff",
      },
    } as never);

    const updateMany = vi.fn().mockResolvedValue({
      count: 1,
    });

    vi.mocked(getPrisma).mockReturnValue({
      catalogue: {
        findUnique: vi.fn().mockResolvedValue({
          slug: "catalogue-a",
        }),
      },
      catalogueListing: {
        updateMany,
      },
    } as never);

    const response = await PATCH(
      new Request(
        "http://localhost/api/admin/catalogues/catalogue-a/listings/listing-from-catalogue-b",
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            isVisible: false,
          }),
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440001",
          listingId: "550e8400-e29b-41d4-a716-446655440002",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(updateMany).not.toHaveBeenCalled();
  });
});
