// components/ui/skeleton-logic.ts
export function skeletonRows(count: number): number[] {
  const n = Math.max(1, Math.floor(count))
  return Array.from({ length: n }, (_, i) => i)
}
