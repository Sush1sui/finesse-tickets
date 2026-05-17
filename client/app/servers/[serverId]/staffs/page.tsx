"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import { api, type StaffMember, type StaffRole } from "../../../../lib/api";
import useAuth from "../../../../lib/context/auth";
import { useStaff } from "../../../../lib/hooks/useStaff";

type ListItem = {
  id: string;
  label: string;
  sublabel?: string;
  color?: number;
  avatarUrl?: string;
};

function SearchDropdown({
  items,
  selectedIds,
  onSelect,
  placeholder,
}: {
  items: ListItem[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items
      .filter((item) => !selectedIds.has(item.id))
      .filter((item) => {
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          item.sublabel?.toLowerCase().includes(q)
        );
      })
      .slice(0, 10);
  }, [items, query, selectedIds]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={() => {
                onSelect(item.id);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
            >
              {item.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.avatarUrl}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full"
                />
              )}
              {item.color !== undefined && (
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-zinc-200"
                  style={{ backgroundColor: `#${item.color.toString(16).padStart(6, "0")}` }}
                />
              )}
              <span className="truncate">{item.label}</span>
              {item.sublabel && (
                <span className="truncate text-xs text-zinc-400">
                  {item.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChipList({
  items,
  onRemove,
  emptyMessage,
}: {
  items: ListItem[];
  onRemove: (id: string) => void;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-400">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            {item.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.avatarUrl}
                alt=""
                className="h-6 w-6 shrink-0 rounded-full"
              />
            )}
            {item.color !== undefined && (
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-zinc-200"
                style={{ backgroundColor: `#${item.color.toString(16).padStart(6, "0")}` }}
              />
            )}
            <span className="text-sm text-zinc-900">{item.label}</span>
            {item.sublabel && (
              <span className="text-xs text-zinc-400">{item.sublabel}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default function StaffPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const serverId = params.serverId as string;

  const {
    members: allMembers,
    roles: allRoles,
    authorizedMemberIds,
    authorizedRoleIds,
    isLoading,
    refresh,
  } = useStaff(serverId);

  const [saving, setSaving] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  const initSelections = useCallback(() => {
    if (!initialized && authorizedMemberIds.length > 0) {
      setSelectedMemberIds([...authorizedMemberIds]);
      setInitialized(true);
    }
  }, [initialized, authorizedMemberIds]);

  if (!initialized && authorizedMemberIds.length > 0) {
    initSelections();
  }

  const authorizedMembers = useMemo(
    () =>
      selectedMemberIds
        .map((id) => allMembers.find((m: StaffMember) => m.id === id))
        .filter((m): m is StaffMember => m !== undefined)
        .map((m: StaffMember) => ({
          id: m.id,
          label: m.globalName || m.username,
          sublabel: m.globalName ? m.username : undefined,
          avatarUrl: m.avatarUrl || undefined,
        })),
    [selectedMemberIds, allMembers],
  );

  const authorizedRoles = useMemo(
    () =>
      selectedRoleIds
        .map((id) => allRoles.find((r: StaffRole) => r.id === id))
        .filter((r): r is StaffRole => r !== undefined)
        .map((r: StaffRole) => ({
          id: r.id,
          label: r.name,
          color: r.color,
        })),
    [selectedRoleIds, allRoles],
  );

  const allMemberItems = useMemo(
    () =>
      allMembers.map((m: StaffMember) => ({
        id: m.id,
        label: m.globalName || m.username,
        sublabel: m.globalName ? m.username : undefined,
        avatarUrl: m.avatarUrl || undefined,
      })),
    [allMembers],
  );

  const allRoleItems = useMemo(
    () =>
      allRoles.map((r: StaffRole) => ({
        id: r.id,
        label: r.name,
        color: r.color,
      })),
    [allRoles],
  );

  const selectedMemberIdSet = useMemo(
    () => new Set(selectedMemberIds),
    [selectedMemberIds],
  );
  const selectedRoleIdSet = useMemo(
    () => new Set(selectedRoleIds),
    [selectedRoleIds],
  );

  const addMember = useCallback(
    (id: string) => {
      setSelectedMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [],
  );

  const removeMember = useCallback((id: string) => {
    setSelectedMemberIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const addRole = useCallback(
    (id: string) => {
      setSelectedRoleIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [],
  );

  const removeRole = useCallback((id: string) => {
    setSelectedRoleIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.staff.update(serverId, {
        authorizedMemberIds: selectedMemberIds,
        authorizedRoleIds: selectedRoleIds,
      });
      refresh();
    } catch {
      alert("Failed to save staff settings");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/servers");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/servers" className="text-zinc-500 hover:text-zinc-700">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Staff Members</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 space-y-8">
        <div>
          <h2 className="text-sm font-medium text-zinc-700 mb-3">
            Authorized Members
          </h2>
          <SearchDropdown
            items={allMemberItems}
            selectedIds={selectedMemberIdSet}
            onSelect={addMember}
            placeholder="Search members..."
          />
          <div className="mt-3">
            <ChipList
              items={authorizedMembers}
              onRemove={removeMember}
              emptyMessage="No authorized members yet"
            />
          </div>
        </div>

        <div className="border-t border-zinc-100" />

        <div>
          <h2 className="text-sm font-medium text-zinc-700 mb-3">
            Authorized Roles
          </h2>
          <SearchDropdown
            items={allRoleItems}
            selectedIds={selectedRoleIdSet}
            onSelect={addRole}
            placeholder="Search roles..."
          />
          <div className="mt-3">
            <ChipList
              items={authorizedRoles}
              onRemove={removeRole}
              emptyMessage="No authorized roles yet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
