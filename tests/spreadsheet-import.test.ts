import { describe, expect, it } from "vitest";
import {
  autoMap,
  validateRows,
  type ParsedFile,
} from "../src/lib/import-mapping";

describe("Spreadsheet import mapping and validation", () => {
  it("maps common spreadsheet headers to the correct fields", () => {
    const mapping = autoMap([
      "SKU",
      "Product Name",
      "Brand",
      "Available Quantity",
      "Offer Price",
      "MRP",
    ]);

    expect(mapping["SKU"]).toBe("sku");
    expect(mapping["Product Name"]).toBe("name");
    expect(mapping["Brand"]).toBe("brand");
    expect(mapping["Available Quantity"]).toBe("quantity");
    expect(mapping["Offer Price"]).toBe("offerPrice");
    expect(mapping["MRP"]).toBe("mrp");
  });

  it("accepts a valid product row", () => {
    const file: ParsedFile = {
      name: "products.csv",
      sizeKB: 10,
      headers: ["SKU", "Product Name", "Available Quantity"],
      rows: [
        {
          SKU: "TRV-1024",
          "Product Name": "Atlas cabin trolley",
          "Available Quantity": "480",
        },
      ],
    };

    const mapping = autoMap(file.headers);
    const result = validateRows(file, mapping);

    expect(result.issues).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].sku).toBe("TRV-1024");
    expect(result.rows[0].quantity).toBe(480);
  });

  it("rejects a row when SKU is missing", () => {
    const file: ParsedFile = {
      name: "products.csv",
      sizeKB: 10,
      headers: ["SKU", "Product Name", "Available Quantity"],
      rows: [
        {
          SKU: "",
          "Product Name": "Atlas cabin trolley",
          "Available Quantity": "480",
        },
      ],
    };

    const result = validateRows(file, autoMap(file.headers));

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].message).toContain("SKU is missing");
    expect(result.issues[0].blocking).toBe(true);
  });

  it("rejects a row when quantity is negative or not a whole number", () => {
    const file: ParsedFile = {
      name: "products.csv",
      sizeKB: 10,
      headers: ["SKU", "Product Name", "Available Quantity"],
      rows: [
        {
          SKU: "TEST-001",
          "Product Name": "Test Product",
          "Available Quantity": "-5",
        },
        {
          SKU: "TEST-002",
          "Product Name": "Test Product 2",
          "Available Quantity": "10.5",
        },
      ],
    };

    const result = validateRows(file, autoMap(file.headers));

    expect(result.issues).toHaveLength(2);
    expect(result.issues.every((issue) => issue.blocking)).toBe(true);
  });
});