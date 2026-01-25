"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/toast";
import {
  useGuildData,
  useGuildMembers,
  useGuildInfo,
} from "@/hooks/useGuildQueries";
import { useQuery } from "@tanstack/react-query";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import Image from "next/image";

type Member = {
  userId: string;
  username: string;
  discriminator: string;
  displayName: string;
  avatar: string;
  bot: boolean;
};

type Role = {
  roleId: string;
  roleName: string;
};

type StaffConfig = {
  users: string[];
  roles: string[];
};

export default function StaffPage() {
  const params = useParams();
  const { resolvedTheme } = useTheme();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  // State
  const [authorizedUsers, setAuthorizedUsers] = useState<string[]>([]);
  const [authorizedRoles, setAuthorizedRoles] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch current user ID
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.user?.discordId))
      .catch((err) => console.error("Failed to fetch current user:", err));
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = useMemo(() => params?.guildId as string, [params?.guildId]);

  // Fetch data using React Query
  const { data: guildInfo, isLoading: guildInfoLoading } =
    useGuildInfo(guildId);
  const { data: guildData, isLoading: guildDataLoading } =
    useGuildData(guildId);
  const { data: members, isLoading: membersLoading } = useGuildMembers(guildId);

  const roles = useMemo(() => guildData?.roles || [], [guildData]);
  const loading = guildInfoLoading || guildDataLoading || membersLoading;

  // Fetch permitted servers with React Query for caching
  const { data: permittedData } = useQuery({
    queryKey: ["permitted-servers"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/permitted-servers");
      if (!res.ok) throw new Error("Failed to fetch permitted servers");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
  });

  // Check if current user has admin permissions
  const hasAdminPermissions = useMemo(() => {
    if (!permittedData?.permittedServers || !guildId) return false;
    const guild = permittedData.permittedServers.find(
      (g: { id: string; permissions?: string }) => g.id === guildId,
    );
    if (!guild?.permissions) return false;
    const perms = BigInt(guild.permissions);
    const PERM_ADMIN = BigInt(1) << BigInt(3);
    return (perms & PERM_ADMIN) !== BigInt(0);
  }, [permittedData, guildId]);

  // Fetch current staff configuration
  useEffect(() => {
    if (!guildId) return;

    const fetchStaffConfig = async () => {
      try {
        const response = await fetch(`/api/dashboard/guild/${guildId}/staff`);
        if (response.ok) {
          const data = await response.json();
          setAuthorizedUsers(data.users || []);
          setAuthorizedRoles(data.roles || []);
        }
      } catch (error) {
        console.error("Error fetching staff config:", error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaffConfig();
  }, [guildId]);

  const handleAddUser = useCallback(() => {
    if (!selectedMember || authorizedUsers.includes(selectedMember)) {
      return;
    }
    setAuthorizedUsers([...authorizedUsers, selectedMember]);
    setSelectedMember("");
  }, [selectedMember, authorizedUsers]);

  const handleRemoveUser = useCallback(
    (userId: string) => {
      setAuthorizedUsers(authorizedUsers.filter((id) => id !== userId));
    },
    [authorizedUsers],
  );

  const handleAddRole = useCallback(() => {
    if (!selectedRole || authorizedRoles.includes(selectedRole)) {
      return;
    }
    setAuthorizedRoles([...authorizedRoles, selectedRole]);
    setSelectedRole("");
  }, [selectedRole, authorizedRoles]);

  const handleRemoveRole = useCallback(
    (roleId: string) => {
      setAuthorizedRoles(authorizedRoles.filter((id) => id !== roleId));
    },
    [authorizedRoles],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard/guild/${guildId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: authorizedUsers,
          roles: authorizedRoles,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to save staff configuration:", error);
        throw new Error("Failed to save staff configuration");
      }

      const data = await response.json();
      // Update state with server response to ensure consistency
      setAuthorizedUsers(data.users || []);
      setAuthorizedRoles(data.roles || []);

      toast.success("Staff configuration saved successfully!");
    } catch (error) {
      console.error("Error saving staff config:", error);
      toast.error("Failed to save staff configuration");
    } finally {
      setSaving(false);
    }
  }, [guildId, authorizedUsers, authorizedRoles, toast]);

  const getMemberById = useCallback(
    (userId: string) => members?.find((m) => m.userId === userId),
    [members],
  );

  const getRoleById = useCallback(
    (roleId: string) => roles?.find((r) => r.roleId === roleId),
    [roles],
  );

  // Prepare options for searchable selects
  const memberOptions: SearchableSelectOption[] = useMemo(
    () =>
      members
        ?.filter((m) => !m.bot)
        .map((member) => ({
          value: member.userId,
          label: member.displayName,
          subtitle: `@${member.username}`,
          avatar: member.avatar
            ? `https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}.png?size=64`
            : undefined,
        })) || [],
    [members],
  );

  const roleOptions: SearchableSelectOption[] = useMemo(
    () =>
      roles?.map((role) => ({
        value: role.roleId,
        label: `@${role.roleName}`,
      })) || [],
    [roles],
  );

  const styles = useMemo(
    () => ({
      container: {
        minHeight: "60vh",
        display: "flex",
        gap: "2rem",
        padding: "1rem",
      } as React.CSSProperties,
      main: {
        flex: 1,
      } as React.CSSProperties,
      card: {
        padding: "2rem",
        border: isDark
          ? "2px solid rgba(255,255,255,0.1)"
          : "2px solid rgba(0,0,0,0.1)",
        borderRadius: "12px",
      } as React.CSSProperties,
      title: {
        fontSize: "1.875rem",
        fontWeight: "700",
        marginBottom: "2rem",
      } as React.CSSProperties,
      section: {
        marginBottom: "2rem",
      } as React.CSSProperties,
      sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
      } as React.CSSProperties,
      sectionTitle: {
        fontSize: "1.25rem",
        fontWeight: "600",
      } as React.CSSProperties,
      searchContainer: {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
      } as React.CSSProperties,
      searchInput: {
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
        color: isDark ? "#fff" : "#000",
        minWidth: "250px",
      } as React.CSSProperties,
      addButton: {
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: isDark
          ? "2px solid rgba(255,255,255,0.2)"
          : "2px solid rgba(0,0,0,0.2)",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.875rem",
        fontWeight: "600",
        cursor: "pointer",
      } as React.CSSProperties,
      memberList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      } as React.CSSProperties,
      memberItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderRadius: "8px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.1)",
      } as React.CSSProperties,
      roleName: {
        fontSize: "0.95rem",
        fontWeight: "500",
      } as React.CSSProperties,
      editButton: {
        padding: "0.35rem 1rem",
        borderRadius: "4px",
        border: isDark
          ? "1px solid rgba(255,255,255,0.2)"
          : "1px solid rgba(0,0,0,0.2)",
        background: "transparent",
        color: isDark ? "#fff" : "#000",
        fontSize: "0.875rem",
        cursor: "pointer",
      } as React.CSSProperties,
    }),
    [isDark],
  );

  if (loading || loadingStaff || !mounted) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div style={styles.container} className="guild-layout">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <GuildSidebar
        guildId={guildId}
        guildName={guildInfo?.name || "Server"}
        guildIcon={guildInfo?.icon || undefined}
      />

      <main style={styles.main}>
        <div style={styles.card} className="panel-card">
          <h1 style={styles.title} className="page-title">
            Staff Management
          </h1>

          {/* Authorized Members Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Authorized Members</h2>
            <div
              style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
            >
              <SearchableSelect
                value={selectedMember}
                onChange={setSelectedMember}
                options={memberOptions}
                placeholder="Select a member..."
                isDark={isDark}
                showAvatars={true}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddUser}
                disabled={
                  !selectedMember || authorizedUsers.includes(selectedMember)
                }
                style={{
                  ...styles.addButton,
                  opacity:
                    !selectedMember || authorizedUsers.includes(selectedMember)
                      ? 0.5
                      : 1,
                  cursor:
                    !selectedMember || authorizedUsers.includes(selectedMember)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Add Member
              </button>
            </div>

            <div style={styles.memberList}>
              {authorizedUsers.length === 0 ? (
                <div
                  style={{ textAlign: "center", opacity: 0.6, padding: "2rem" }}
                >
                  No authorized members yet
                </div>
              ) : (
                authorizedUsers.map((userId) => {
                  const member = getMemberById(userId);
                  if (!member) return null;
                  const isCurrentUser = userId === currentUserId;
                  const canRemove = hasAdminPermissions || !isCurrentUser;
                  return (
                    <div key={userId} style={styles.memberItem}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {member.avatar && (
                          <Image
                            src={`https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}.png?size=64`}
                            alt={member.displayName}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        <div>
                          <div style={styles.roleName}>
                            {member.displayName}
                          </div>
                          <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                            {member.username}#{member.discriminator}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveUser(userId)}
                        disabled={!canRemove}
                        style={{
                          ...styles.editButton,
                          opacity: canRemove ? 1 : 0.4,
                          cursor: canRemove ? "pointer" : "not-allowed",
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Authorized Roles Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Authorized Roles</h2>
            <div
              style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
            >
              <SearchableSelect
                value={selectedRole}
                onChange={setSelectedRole}
                options={roleOptions}
                placeholder="Select a role..."
                isDark={isDark}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddRole}
                disabled={
                  !selectedRole || authorizedRoles.includes(selectedRole)
                }
                style={{
                  ...styles.addButton,
                  opacity:
                    !selectedRole || authorizedRoles.includes(selectedRole)
                      ? 0.5
                      : 1,
                  cursor:
                    !selectedRole || authorizedRoles.includes(selectedRole)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Add Role
              </button>
            </div>

            <div style={styles.memberList}>
              {authorizedRoles.length === 0 ? (
                <div
                  style={{ textAlign: "center", opacity: 0.6, padding: "2rem" }}
                >
                  No authorized roles yet
                </div>
              ) : (
                authorizedRoles.map((roleId) => {
                  const role = getRoleById(roleId);
                  if (!role) return null;
                  return (
                    <div key={roleId} style={styles.memberItem}>
                      <span style={styles.roleName}>@{role.roleName}</span>
                      <button
                        onClick={() => handleRemoveRole(roleId)}
                        style={styles.editButton}
                      >
                        REMOVE
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...styles.addButton,
              width: "100%",
              padding: "1rem",
              marginTop: "2rem",
              background: "linear-gradient(135deg, #5865F2 0%, #4752C4 100%)",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "600",
              opacity: saving ? 0.6 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </main>
    </div>
  );
}
