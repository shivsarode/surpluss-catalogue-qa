import { describe, expect, it } from "vitest";
import { discountPercent } from "../src/lib/pricing";

describe("discountPercent", () => {
  it("calculates the discount percentage correctly", () => {
    expect(
      discountPercent({
        priceOnRequest: false,
        mrp: 1000,
        offerPrice: 900,
      }),
    ).toBe(10);
  });

  it("returns 0 when price is on request", () => {
    expect(
      discountPercent({
        priceOnRequest: true,
        mrp: 1000,
        offerPrice: 500,
      }),
    ).toBe(0);
  });

  it("returns 0 when MRP or offer price is missing", () => {
    expect(
      discountPercent({
        priceOnRequest: false,
        mrp: null,
        offerPrice: 500,
      }),
    ).toBe(0);

    expect(
      discountPercent({
        priceOnRequest: false,
        mrp: 1000,
        offerPrice: null,
      }),
    ).toBe(0);
  });

  it("returns 0 when prices are not finite numbers", () => {
    expect(
      discountPercent({
        priceOnRequest: false,
        mrp: Infinity,
        offerPrice: 500,
      }),
    ).toBe(0);
  });
});