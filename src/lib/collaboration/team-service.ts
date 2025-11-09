/**
 * Team Collaboration Service
 * Handles team management and scan sharing
 */

import { ScanResult } from "../scanner/scan-engine";
import { LocalStorageApiClient } from "../api/api-client";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "member" | "viewer";
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: Date;
  createdBy: string;
}

export interface SharedScan {
  id: string;
  scanId: string;
  teamId: string;
  sharedBy: string;
  sharedAt: Date;
  permissions: "read" | "write" | "admin";
}

export class TeamService {
  private static teams: Map<string, Team> = new Map();
  private static sharedScans: Map<string, SharedScan> = new Map();
  private static STORAGE_KEY_TEAMS = "teams";
  private static STORAGE_KEY_SHARED_SCANS = "shared_scans";

  /**
   * Initialize team service
   */
  static async initialize() {
    await this.loadTeams();
    await this.loadSharedScans();
  }

  /**
   * Load teams from storage
   */
  private static async loadTeams() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_TEAMS);
      if (data) {
        const teams = JSON.parse(data);
        teams.forEach((team: Team) => {
          this.teams.set(team.id, team);
        });
      }
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  }

  /**
   * Load shared scans from storage
   */
  private static async loadSharedScans() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_SHARED_SCANS);
      if (data) {
        const scans = JSON.parse(data);
        scans.forEach((scan: SharedScan) => {
          this.sharedScans.set(scan.id, scan);
        });
      }
    } catch (error) {
      console.error("Error loading shared scans:", error);
    }
  }

  /**
   * Save teams to storage
   */
  private static async saveTeams() {
    const teams = Array.from(this.teams.values());
    localStorage.setItem(this.STORAGE_KEY_TEAMS, JSON.stringify(teams));
  }

  /**
   * Save shared scans to storage
   */
  private static async saveSharedScans() {
    const scans = Array.from(this.sharedScans.values());
    localStorage.setItem(this.STORAGE_KEY_SHARED_SCANS, JSON.stringify(scans));
  }

  /**
   * Create a team
   */
  static async createTeam(
    name: string,
    description?: string,
    createdBy?: string
  ): Promise<Team> {
    const id = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const currentUser = createdBy || "user-1";

    const team: Team = {
      id,
      name,
      description,
      members: [
        {
          id: currentUser,
          email: "current@user.com",
          name: "Current User",
          role: "owner",
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      createdBy: currentUser,
    };

    this.teams.set(id, team);
    await this.saveTeams();

    return team;
  }

  /**
   * Get all teams
   */
  static getTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  /**
   * Get a team by ID
   */
  static getTeam(id: string): Team | undefined {
    return this.teams.get(id);
  }

  /**
   * Add member to team
   */
  static async addMember(
    teamId: string,
    member: Omit<TeamMember, "joinedAt">
  ): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    team.members.push({
      ...member,
      joinedAt: new Date(),
    });

    this.teams.set(teamId, team);
    await this.saveTeams();
  }

  /**
   * Remove member from team
   */
  static async removeMember(teamId: string, memberId: string): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    team.members = team.members.filter((m) => m.id !== memberId);
    this.teams.set(teamId, team);
    await this.saveTeams();
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    teamId: string,
    memberId: string,
    role: TeamMember["role"]
  ): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const member = team.members.find((m) => m.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    member.role = role;
    this.teams.set(teamId, team);
    await this.saveTeams();
  }

  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string): Promise<void> {
    this.teams.delete(teamId);
    await this.saveTeams();

    // Remove shared scans for this team
    const scansToRemove = Array.from(this.sharedScans.values()).filter(
      (scan) => scan.teamId === teamId
    );
    scansToRemove.forEach((scan) => {
      this.sharedScans.delete(scan.id);
    });
    await this.saveSharedScans();
  }

  /**
   * Share a scan with a team
   */
  static async shareScan(
    scanId: string,
    teamId: string,
    permissions: "read" | "write" | "admin" = "read",
    sharedBy?: string
  ): Promise<SharedScan> {
    const team = this.teams.get(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    const id = `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sharedScan: SharedScan = {
      id,
      scanId,
      teamId,
      sharedBy: sharedBy || "user-1",
      sharedAt: new Date(),
      permissions,
    };

    this.sharedScans.set(id, sharedScan);
    await this.saveSharedScans();

    return sharedScan;
  }

  /**
   * Get shared scans for a team
   */
  static getSharedScans(teamId: string): SharedScan[] {
    return Array.from(this.sharedScans.values()).filter(
      (scan) => scan.teamId === teamId
    );
  }

  /**
   * Get teams that have access to a scan
   */
  static getTeamsWithScanAccess(scanId: string): Team[] {
    const sharedScans = Array.from(this.sharedScans.values()).filter(
      (scan) => scan.scanId === scanId
    );
    return sharedScans
      .map((scan) => this.teams.get(scan.teamId))
      .filter((team): team is Team => team !== undefined);
  }

  /**
   * Unshare a scan from a team
   */
  static async unshareScan(scanId: string, teamId: string): Promise<void> {
    const scansToRemove = Array.from(this.sharedScans.values()).filter(
      (scan) => scan.scanId === scanId && scan.teamId === teamId
    );

    scansToRemove.forEach((scan) => {
      this.sharedScans.delete(scan.id);
    });

    await this.saveSharedScans();
  }

  /**
   * Check if user has permission for scan
   */
  static hasPermission(
    scanId: string,
    userId: string,
    requiredPermission: "read" | "write" | "admin"
  ): boolean {
    const sharedScans = Array.from(this.sharedScans.values()).filter(
      (scan) => scan.scanId === scanId
    );

    for (const sharedScan of sharedScans) {
      const team = this.teams.get(sharedScan.teamId);
      if (!team) continue;

      const member = team.members.find((m) => m.id === userId);
      if (!member) continue;

      const permissionLevel = {
        read: 1,
        write: 2,
        admin: 3,
      };

      const requiredLevel = permissionLevel[requiredPermission];
      const memberLevel = permissionLevel[sharedScan.permissions];

      if (memberLevel >= requiredLevel) {
        return true;
      }
    }

    return false;
  }
}

