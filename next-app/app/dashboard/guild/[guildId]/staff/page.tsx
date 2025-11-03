"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import GuildSidebar from "@/components/guild-sidebar";

type StaffMember = {
  id: string;
  role: string;
};

export default function StaffPage() {
  const params = useParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [guildName, setGuildName] = useState("Server Name");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [staffMembers] = useState<StaffMember[]>([
    { id: "1", role: "Founder" },
    { id: "2", role: "Admin" },
    { id: "3", role: "Moderator" },
    { id: "4", role: "Intern" },
    { id: "5", role: "Tutor" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const guildId = params?.guildId as string;

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
    [isDark]
  );

  return (
    <div style={styles.container} className="guild-layout">
      <GuildSidebar guildId={guildId} guildName={guildName} />

      <main style={styles.main}>
        <div style={styles.card} className="panel-card">
          <h1 style={styles.title} className="page-title">
            Staff Members
          </h1>

          {/* Manage Members Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader} className="section-header">
              <h2 style={styles.sectionTitle} className="section-title">
                Manage Members
              </h2>
              <div style={styles.searchContainer} className="search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                  placeholder="Search..."
                />
                <button style={styles.addButton}>+ New Panel</button>
              </div>
            </div>

            <div style={styles.memberList}>
              {staffMembers.map((member) => (
                <div key={member.id} style={styles.memberItem}>
                  <span style={styles.roleName}>{member.role}</span>
                  <button style={styles.editButton}>EDIT</button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Role Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Add Role</h2>
            {/* Add role functionality can be added here */}
          </div>
        </div>
      </main>
    </div>
  );
}
