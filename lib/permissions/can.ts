import type { Enums } from '@/types/supabase'

type Role = Enums<'app_role'>

const roleHierarchy: Record<Role, number> = {
  reader: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
}

export function hasMinRole(role: Role, minRole: Role): boolean {
  return roleHierarchy[role] >= roleHierarchy[minRole]
}

export function isEditorOrAbove(role: Role): boolean {
  return hasMinRole(role, 'editor')
}

export function isAdminOrAbove(role: Role): boolean {
  return hasMinRole(role, 'admin')
}

export function isSuperAdmin(role: Role): boolean {
  return role === 'super_admin'
}


export function can(role: Role, action: string): boolean {
  const permissions: Record<string, Role> = {
    'read:contents': 'reader',
    'write:contents': 'editor',
    'delete:contents': 'admin',
    'read:study_plans': 'reader',
    'write:study_plans': 'editor',
    'delete:study_plans': 'admin',
    'manage:users': 'admin',
    'view:audit': 'admin',
    'manage:campaigns': 'editor',
    'manage:super_admin': 'super_admin',
  }

  const required = permissions[action]
  if (!required) return false
  return hasMinRole(role, required)
}
