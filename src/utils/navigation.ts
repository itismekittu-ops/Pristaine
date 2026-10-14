export function isCurrentPath(target: string, path: string): boolean {
  return path === target || path.startsWith(`${target}/`);
}