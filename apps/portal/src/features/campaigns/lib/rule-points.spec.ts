import { describe, expect, it } from "vitest";

import {
  meetsMinimumRuleText,
  parseRulePoints,
  serializeRulePoints,
} from "@/features/campaigns/lib/rule-points";

describe("rule-points", () => {
  it("parses newline and bullet lines into points", () => {
    const points = parseRulePoints("- Show product\n• Use natural light\nAvoid shaky cam");
    expect(points).toHaveLength(3);
    expect(points[0]?.text).toBe("Show product");
    expect(points[1]?.text).toBe("Use natural light");
    expect(points[2]?.text).toBe("Avoid shaky cam");
  });

  it("serializes points back to newline text", () => {
    const serialized = serializeRulePoints([
      { id: "1", text: "Open with hook" },
      { id: "2", text: "Tag the brand" },
    ]);
    expect(serialized).toBe("Open with hook\nTag the brand");
  });

  it("checks minimum total characters for point lists", () => {
    expect(meetsMinimumRuleText("short")).toBe(false);
    expect(meetsMinimumRuleText("long enough")).toBe(true);
    expect(meetsMinimumRuleText("Point one\nPoint two")).toBe(true);
  });
});
