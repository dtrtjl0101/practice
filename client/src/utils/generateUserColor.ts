function simpleHash(input: number): number {
  let hash = 0;
  const str = input.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export default function generateUserColor(userId: number): string {
  const hash = simpleHash(userId);
  const hue = hash % 360;
  return `hsl(${hue}, 90%, 45%)`;
}
