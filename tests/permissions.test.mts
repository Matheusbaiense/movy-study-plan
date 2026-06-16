import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { hasMinRole, isEditorOrAbove, isAdminOrAbove, isSuperAdmin, can } from '../lib/permissions/can.ts'

describe('hasMinRole', () => {
  it('reader satisfies reader', () => assert.equal(hasMinRole('reader', 'reader'), true))
  it('reader does not satisfy editor', () => assert.equal(hasMinRole('reader', 'editor'), false))
  it('reader does not satisfy admin', () => assert.equal(hasMinRole('reader', 'admin'), false))
  it('editor satisfies reader', () => assert.equal(hasMinRole('editor', 'reader'), true))
  it('editor satisfies editor', () => assert.equal(hasMinRole('editor', 'editor'), true))
  it('editor does not satisfy admin', () => assert.equal(hasMinRole('editor', 'admin'), false))
  it('admin satisfies editor', () => assert.equal(hasMinRole('admin', 'editor'), true))
  it('admin satisfies admin', () => assert.equal(hasMinRole('admin', 'admin'), true))
  it('super_admin satisfies admin', () => assert.equal(hasMinRole('super_admin', 'admin'), true))
  it('super_admin satisfies super_admin', () => assert.equal(hasMinRole('super_admin', 'super_admin'), true))
})

describe('isEditorOrAbove', () => {
  it('reader → false', () => assert.equal(isEditorOrAbove('reader'), false))
  it('editor → true', () => assert.equal(isEditorOrAbove('editor'), true))
  it('admin → true', () => assert.equal(isEditorOrAbove('admin'), true))
  it('super_admin → true', () => assert.equal(isEditorOrAbove('super_admin'), true))
})

describe('isAdminOrAbove', () => {
  it('reader → false', () => assert.equal(isAdminOrAbove('reader'), false))
  it('editor → false', () => assert.equal(isAdminOrAbove('editor'), false))
  it('admin → true', () => assert.equal(isAdminOrAbove('admin'), true))
  it('super_admin → true', () => assert.equal(isAdminOrAbove('super_admin'), true))
})

describe('isSuperAdmin', () => {
  it('admin → false', () => assert.equal(isSuperAdmin('admin'), false))
  it('super_admin → true', () => assert.equal(isSuperAdmin('super_admin'), true))
})

describe('can', () => {
  it('reader can read:contents', () => assert.equal(can('reader', 'read:contents'), true))
  it('reader can read:study_plans', () => assert.equal(can('reader', 'read:study_plans'), true))
  it('reader cannot write:contents', () => assert.equal(can('reader', 'write:contents'), false))
  it('reader cannot delete:contents', () => assert.equal(can('reader', 'delete:contents'), false))
  it('reader cannot manage:users', () => assert.equal(can('reader', 'manage:users'), false))
  it('editor can write:contents', () => assert.equal(can('editor', 'write:contents'), true))
  it('editor can write:study_plans', () => assert.equal(can('editor', 'write:study_plans'), true))
  it('editor cannot delete:contents', () => assert.equal(can('editor', 'delete:contents'), false))
  it('admin can delete:contents', () => assert.equal(can('admin', 'delete:contents'), true))
  it('admin can manage:users', () => assert.equal(can('admin', 'manage:users'), true))
  it('admin cannot manage:super_admin', () => assert.equal(can('admin', 'manage:super_admin'), false))
  it('super_admin can manage:super_admin', () => assert.equal(can('super_admin', 'manage:super_admin'), true))
  it('unknown action → false', () => assert.equal(can('admin', 'nonexistent:action'), false))
})
