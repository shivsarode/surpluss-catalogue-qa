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
import { deleteCatalogue } from "@/app/admin/actions";

describe("Server action access control", () => {
  it("should reject a Staff user from deleting a catalogue", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "staff-user",
        email: "staff@catalogue.test",
        role: "staff",
      },
    } as never);

    const deleteMock = vi.fn().mockResolvedValue({
      slug: "festive-overstock-2026",
      name: "Festive overstock 2026",
    });

    vi.mocked(getPrisma).mockReturnValue({
      catalogue: {
        delete: deleteMock,
      },
    } as never);

    const result = await deleteCatalogue(
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(result).toEqual({
      error: "Only an admin can delete a catalogue.",
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });
});
