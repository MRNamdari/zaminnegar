import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ProjectMember } from '../entities/project-member.entity';
import { execute, firstRow, rows } from '../utils/sql';

export interface MemberRow {
  projectId: string;
  userId: string;
  username: string;
  phone: string | null;
  email: string | null;
  roleId: string;
  roleName: string;
  roleIsSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MEMBER_SELECT = `
  SELECT pm.project_id AS "projectId", pm.user_id AS "userId", u.username, u.phone, u.email,
         pm.role_id AS "roleId", r.name AS "roleName", r.is_system AS "roleIsSystem",
         pm.created_at AS "createdAt", pm.updated_at AS "updatedAt"
  FROM project_members pm
  JOIN users u ON u.id = pm.user_id
  JOIN roles r ON r.id = pm.role_id`;

@Injectable()
export class ProjectMemberRepository {
  constructor(@InjectRepository(ProjectMember) private readonly repository: Repository<ProjectMember>) {}

  listByProject(projectId: string): Promise<MemberRow[]> {
    return rows<MemberRow>(this.repository.manager, `${MEMBER_SELECT} WHERE pm.project_id = $1 ORDER BY u.username`, [projectId]);
  }

  findOne(projectId: string, userId: string, manager: EntityManager): Promise<MemberRow | undefined> {
    return firstRow<MemberRow>(manager, `${MEMBER_SELECT} WHERE pm.project_id = $1 AND pm.user_id = $2`, [projectId, userId]);
  }

  /** Locks every membership row of the project, so owner-count checks and changes cannot interleave. */
  async lockProjectMembers(projectId: string, manager: EntityManager): Promise<void> {
    await rows(manager, `SELECT user_id FROM project_members WHERE project_id = $1 ORDER BY user_id FOR UPDATE`, [projectId]);
  }

  /** Locks the project row against deletion. Returns false when the project does not exist. */
  async lockProject(projectId: string, manager: EntityManager): Promise<boolean> {
    return (await rows(manager, `SELECT id FROM projects WHERE id = $1 FOR SHARE`, [projectId])).length > 0;
  }

  /** Returns false when the user already is a member. */
  async insert(projectId: string, userId: string, roleId: string, manager: EntityManager): Promise<boolean> {
    const inserted = await rows(
      manager,
      `INSERT INTO project_members (project_id, user_id, role_id) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, project_id) DO NOTHING RETURNING user_id`,
      [projectId, userId, roleId],
    );
    return inserted.length > 0;
  }

  async updateRole(projectId: string, userId: string, roleId: string, manager: EntityManager): Promise<void> {
    await execute(manager, `UPDATE project_members SET role_id = $3, updated_at = now() WHERE project_id = $1 AND user_id = $2`, [
      projectId,
      userId,
      roleId,
    ]);
  }

  async remove(projectId: string, userId: string, manager: EntityManager): Promise<boolean> {
    return (await execute(manager, `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`, [projectId, userId])) > 0;
  }

  async countWithRole(projectId: string, roleId: string, manager: EntityManager): Promise<number> {
    const row = await firstRow<{ count: number }>(
      manager,
      `SELECT count(*)::int AS count FROM project_members WHERE project_id = $1 AND role_id = $2`,
      [projectId, roleId],
    );
    return row?.count ?? 0;
  }

  async roleInUse(roleId: string, manager: EntityManager): Promise<boolean> {
    return (await rows(manager, `SELECT 1 FROM project_members WHERE role_id = $1 LIMIT 1`, [roleId])).length > 0;
  }
}
