"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

import { api, type MultiPanelDetail } from "../../../../../../lib/api";
import { useGuildMeta } from "../../../../../../lib/hooks/useGuildMeta";
import { usePanels } from "../../../../../../lib/hooks/usePanels";

type MultiPanelForm = {
  embedColor: string;
  title: string;
  content: string;
  authorName: string;
  authorIconUrl: string;
  authorUrl: string;
  channelId: string;
  useDropdown: boolean;
  panelConfigIds: string[];
  largeImgUrl: string;
  smallImgUrl: string;
  footer: string;
  footIconUrl: string;
};

const toHex = (value: number, fallback: string) => {
  if (!value) return fallback;
  return `#${value.toString(16).padStart(6, "0")}`;
};

export default function EditMultiPanelPage() {
  const router = useRouter();
  const params = useParams();
  const serverId = params.serverId as string;
  const multiPanelId = params.multiPanelId as string;

  const [form, setForm] = useState<MultiPanelForm>({
    embedColor: "#5865f2",
    title: "",
    content: "",
    authorName: "",
    authorIconUrl: "",
    authorUrl: "",
    channelId: "",
    useDropdown: false,
    panelConfigIds: ["", ""],
    largeImgUrl: "",
    smallImgUrl: "",
    footer: "",
    footIconUrl: "",
  });

  const {
    data: multiPanel,
    isLoading,
    error,
  } = useSWR<MultiPanelDetail>(
    serverId && multiPanelId ? [serverId, multiPanelId] : null,
    () => api.multiPanels.get(serverId, multiPanelId),
    { revalidateOnFocus: false },
  );

  const { channels } = useGuildMeta(serverId);
  const { panels } = usePanels(serverId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!multiPanel) return;

    const panelIds = (multiPanel.panelConfigIds ?? []).map(String);
    while (panelIds.length < 2) {
      panelIds.push("");
    }

    setForm({
      title: multiPanel.title ?? "",
      content: multiPanel.content ?? "",
      embedColor: toHex(multiPanel.embedColor ?? 0, "#5865f2"),
      authorName: "",
      authorIconUrl: "",
      authorUrl: "",
      channelId: multiPanel.channelId ?? "",
      useDropdown: multiPanel.useDropdown ?? false,
      panelConfigIds: panelIds,
      largeImgUrl: multiPanel.largeImgUrl ?? "",
      smallImgUrl: multiPanel.smallImgUrl ?? "",
      footer: multiPanel.footer ?? "",
      footIconUrl: multiPanel.footIconUrl ?? "",
    });
  }, [multiPanel]);

  const sortedPanels = useMemo(() => {
    return [...panels].sort((a, b) => a.Title.localeCompare(b.Title));
  }, [panels]);

  const handlePanelSelect = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.panelConfigIds];
      next[index] = value;
      return { ...prev, panelConfigIds: next };
    });
  };

  const handleAddPanel = () => {
    setForm((prev) => ({
      ...prev,
      panelConfigIds: [...prev.panelConfigIds, ""],
    }));
  };

  const handleRemovePanel = (index: number) => {
    setForm((prev) => {
      if (prev.panelConfigIds.length <= 2) return prev;
      const next = prev.panelConfigIds.filter((_, idx) => idx !== index);
      return { ...prev, panelConfigIds: next };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const embedColor = parseInt(form.embedColor.replace("#", ""), 16) || 0;

      const panelConfigIds = form.panelConfigIds
        .filter((value) => value !== "")
        .map((value) => Number(value));

      await api.multiPanels.update(serverId, multiPanelId, {
        title: form.title,
        content: form.content,
        embedColor,
        channelId: form.channelId,
        largeImgUrl: form.largeImgUrl,
        smallImgUrl: form.smallImgUrl,
        useDropdown: form.useDropdown,
        panelConfigIds,
        footer: form.footer,
        footIconUrl: form.footIconUrl,
      });

      router.push(`/servers/${serverId}/panels`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this multi panel?")) return;
    setDeleting(true);
    try {
      await api.multiPanels.delete(serverId, multiPanelId);
      router.push(`/servers/${serverId}/panels`);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading && !multiPanel) {
    return <p className="text-sm text-zinc-500">Loading multi panel...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load multi panel.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">
          Edit Multi Panel
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <label className="text-sm font-medium text-zinc-700">
          Channel
          <select
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.channelId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, channelId: event.target.value }))
            }
          >
            <option value="">Select a channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </label>

        <div className="text-sm font-medium text-zinc-700">
          Panels (minimum 2)
          <div className="mt-2 space-y-2">
            {form.panelConfigIds.map((panelId, index) => (
              <div
                key={`${index}-${panelId}`}
                className="flex items-center gap-2"
              >
                <select
                  className="w-full rounded-md border border-zinc-200 p-2 text-sm"
                  value={panelId}
                  onChange={(event) =>
                    handlePanelSelect(index, event.target.value)
                  }
                >
                  <option value="">Select panel</option>
                  {sortedPanels.map((panel) => (
                    <option key={panel.ID} value={panel.ID}>
                      {panel.Title}
                    </option>
                  ))}
                </select>
                {form.panelConfigIds.length > 2 && (
                  <button
                    type="button"
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                    onClick={() => handleRemovePanel(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
            onClick={handleAddPanel}
          >
            + Add Panel
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={form.useDropdown}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                useDropdown: event.target.checked,
              }))
            }
          />
          Use Dropdown Menu
        </label>
      </section>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">Message</div>

        <label className="text-sm font-medium text-zinc-700">
          Embed color
          <input
            type="color"
            className="mt-2 h-10 w-20 rounded-md border border-zinc-200"
            value={form.embedColor}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, embedColor: event.target.value }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Title
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            placeholder="Embed title (up to 256 characters)"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Description
          <textarea
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            rows={4}
            placeholder="Up to 4096 characters only"
            value={form.content}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, content: event.target.value }))
            }
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Author name
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.authorName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, authorName: event.target.value }))
              }
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Author icon URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.authorIconUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  authorIconUrl: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <label className="text-sm font-medium text-zinc-700">
          Author URL
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.authorUrl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, authorUrl: event.target.value }))
            }
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Large image URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.largeImgUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  largeImgUrl: event.target.value,
                }))
              }
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Small image URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.smallImgUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  smallImgUrl: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Footer text
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.footer}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, footer: event.target.value }))
              }
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Footer icon URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.footIconUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  footIconUrl: event.target.value,
                }))
              }
            />
          </label>
        </div>
      </section>
    </form>
  );
}
