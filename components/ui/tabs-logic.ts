// components/ui/tabs-logic.ts
export function isTabActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}
