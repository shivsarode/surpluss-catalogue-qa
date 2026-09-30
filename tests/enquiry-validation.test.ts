import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
  notifyTeam: vi.fn(),
}));

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");

  return {
    ...actual,
    after: vi.fn(),
  };
});

import { getPrisma } from "@/lib/prisma";
import { POST } from "@/app/api/enquiries/route";

const catalogueId = "550e8400-e29b-41d4-a716-446655440000";
const productId = "550e8400-e29b-41d4-a716-446655440001";

function mockDatabase() {
  const create = vi.fn().mockResolvedValue({
    id: "enquiry-1",
  });

  vi.mocked(getPrisma).mockReturnValue({
    catalogueListing: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "listing-1",
          productId,
          product: {
            name: "Atlas cabin trolley",
            sku: "TRV-1024",
            brand: "Atlas",
            offerPrice: 900,
            priceOnRequest: false,
            moq: 20,
            quantity: 240,
          },
        },
      ]),
    },
    catalogue: {
      findUnique: vi.fn().mockResolvedValue({
        notifyNumber: null,
      }),
    },
    enquiry: {
      create,
    },
  } as never);

  return { create };
}

function makeRequest(quantity: number) {
  return new Request("http://localhost:3001/api/enquiries", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      catalogueId,
      name: "Test Buyer",
      email: "buyer@example.com",
      items: [
        {
          productId,
          quantity,
        },
      ],
    }),
  });
}

describe("Enquiry validation", () => {
  it("rejects a quantity below MOQ", async () => {
    const { create } = mockDatabase();

    const response = await POST(makeRequest(19));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("accepts a quantity equal to MOQ", async () => {
    const { create } = mockDatabase();

    const response = await POST(makeRequest(20));

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalled();
  });

  it("accepts a quantity equal to available stock", async () => {
    const { create } = mockDatabase();

    const response = await POST(makeRequest(240));

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalled();
  });

  it("rejects a quantity above available stock", async () => {
    const { create } = mockDatabase();

    const response = await POST(makeRequest(241));

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects an enquiry without phone or email", async () => {
    const { create } = mockDatabase();

    const request = new Request("http://localhost:3001/api/enquiries", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        catalogueId,
        name: "Test Buyer",
        items: [
          {
            productId,
            quantity: 20,
          },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});