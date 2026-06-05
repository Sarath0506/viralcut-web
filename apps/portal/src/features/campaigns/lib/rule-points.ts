export type RulePoint = {
  id: string;
  text: string;
};

export function createRulePoint(text = ""): RulePoint {
  return { id: crypto.randomUUID(), text };
}

export function parseRulePoints(value: string): RulePoint[] {
  if (!value.trim()) return [];

  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-–*]+/, "").trim())
    .filter(Boolean)
    .map((text) => createRulePoint(text));
}

export function serializeRulePoints(points: RulePoint[]): string {
  return points
    .map((point) => point.text.trim())
    .filter(Boolean)
    .join("\n");
}

export function meetsMinimumRuleText(value: string, minLength = 10): boolean {
  return value.trim().length >= minLength;
}
