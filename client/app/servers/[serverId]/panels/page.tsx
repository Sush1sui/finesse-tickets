"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { api } from "../../../../lib/api";
import { useMultiPanels, usePanels } from "../../../../lib/hooks/usePanels";

export default function PanelsPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { panels, isLoading: panelsLoading, refresh } = usePanels(serverId);
  const {
    multiPanels,
    isLoading: multiPanelsLoading,
    refresh: refreshMultiPanels,
  } = useMultiPanels(serverId);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingMultiId, setDeletingMultiId] = useState<number | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [sendingMultiId, setSendingMultiId] = useState<number | null>(null);

  const handleDelete = async (panelId: number) => {
    if (!window.confirm("Delete this panel?")) return;
    setDeletingId(panelId);
    try {
      await api.panels.delete(serverId, panelId.toString());
      await refresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMulti = async (panelId: number) => {
    if (!window.confirm("Delete this multi panel?")) return;
    setDeletingMultiId(panelId);
    try {
      await api.multiPanels.delete(serverId, panelId.toString());
      await refreshMultiPanels();
    } finally {
      setDeletingMultiId(null);
    }
  };

  const handleSend = async (panelId: number) => {
    setSendingId(panelId);
    try {
      await api.panels.send(serverId, panelId.toString());
    } catch (err) {
      console.error(err);
      window.alert("Failed to send panel.");
    } finally {
      setSendingId(null);
    }
  };

  const handleSendMulti = async (panelId: number) => {
    setSendingMultiId(panelId);
    try {
      await api.multiPanels.send(serverId, panelId.toString());
    } catch (err) {
      console.error(err);
      window.alert("Failed to send multi panel.");
    } finally {
      setSendingMultiId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900">Ticket Panels</h1>
          <div className="flex items-center gap-3">
            {panelsLoading && (
              <span className="text-xs text-zinc-500">Loading...</span>
            )}
            <a
              href={`/servers/${serverId}/panels/create`}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
            >
              Create
            </a>
          </div>
        </div>
        <div className="grid grid-cols-[2fr_2fr_1fr] gap-3 text-sm font-medium text-zinc-600">
          <span>PanelTitle</span>
          <span>Channel</span>
          <span>Actions</span>
        </div>
        <div className="mt-2 space-y-2">
          {panels.length === 0 ? (
            <p className="text-sm text-zinc-500">No panels yet.</p>
          ) : (
            panels.map((panel) => (
              <div
                key={panel.ID}
                className="grid grid-cols-[2fr_2fr_1fr] items-center gap-3 rounded-md border border-zinc-100 px-3 py-2 text-sm"
              >
                <span className="text-zinc-900">{panel.Title}</span>
                <span className="text-zinc-600">{panel.ChannelID}</span>
                <div className="flex gap-2">
                  <a
                    href={`/servers/${serverId}/panels/${panel.ID}/edit`}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                  >
                    Edit
                  </a>
                  <button
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50"
                    onClick={() => handleSend(panel.ID)}
                    disabled={sendingId === panel.ID}
                  >
                    {sendingId === panel.ID ? "Sending..." : "Send"}
                  </button>
                  <button
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50"
                    onClick={() => handleDelete(panel.ID)}
                    disabled={deletingId === panel.ID}
                  >
                    {deletingId === panel.ID ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Multi Panels</h2>
          <div className="flex items-center gap-3">
            {multiPanelsLoading && (
              <span className="text-xs text-zinc-500">Loading...</span>
            )}
            <a
              href={`/servers/${serverId}/multi-panels/create`}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
            >
              Create
            </a>
          </div>
        </div>
        <div className="grid grid-cols-[2fr_2fr_1fr] gap-3 text-sm font-medium text-zinc-600">
          <span>PanelTitle</span>
          <span>Channel</span>
          <span>Actions</span>
        </div>
        <div className="mt-2 space-y-2">
          {multiPanels.length === 0 ? (
            <p className="text-sm text-zinc-500">No multi panels yet.</p>
          ) : (
            multiPanels.map((panel) => (
              <div
                key={panel.ID}
                className="grid grid-cols-[2fr_2fr_1fr] items-center gap-3 rounded-md border border-zinc-100 px-3 py-2 text-sm"
              >
                <span className="text-zinc-900">{panel.Title}</span>
                <span className="text-zinc-600">{panel.ChannelID}</span>
                <div className="flex gap-2">
                  <a
                    href={`/servers/${serverId}/multi-panels/${panel.ID}/edit`}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                  >
                    Edit
                  </a>
                  <button
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50"
                    onClick={() => handleSendMulti(panel.ID)}
                    disabled={sendingMultiId === panel.ID}
                  >
                    {sendingMultiId === panel.ID ? "Sending..." : "Send"}
                  </button>
                  <button
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50"
                    onClick={() => handleDeleteMulti(panel.ID)}
                    disabled={deletingMultiId === panel.ID}
                  >
                    {deletingMultiId === panel.ID ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
