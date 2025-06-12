const COLOR_TABLE: number[] = [0, 60, 120, 180, 240, 300];
function simpleHash(input: number): number {
  return COLOR_TABLE[input % COLOR_TABLE.length]!;
}

export default function generateUserColor(userId: number): string {
  const hash = simpleHash(userId);
  const hue = hash % 360;
  return `hsl(${hue}, 90%, 45%)`;
}
