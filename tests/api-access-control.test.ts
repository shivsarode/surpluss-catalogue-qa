import { describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

import { auth } from "@/auth";
import { GET } from "@/app/api/admin/catalogues/[id]/route";

describe("API access control", () => {
  it("rejects signed-out users from the admin catalogue API", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const response = await GET(
      new Request(
        "http://localhost:3001/api/admin/catalogues/550e8400-e29b-41d4-a716-446655440000",
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(401);
  });
});
