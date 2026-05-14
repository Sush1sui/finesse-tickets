"use client";

import { useParams } from "next/navigation";

import { useMultiPanels, usePanels } from "../../../../lib/hooks/usePanels";

export default function PanelsPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { panels, isLoading: panelsLoading } = usePanels(serverId);
  const { multiPanels, isLoading: multiPanelsLoading } =
    useMultiPanels(serverId);

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
                  <button className="rounded-md border border-zinc-300 px-2 py-1 text-xs">
                    Edit
                  </button>
                  <button className="rounded-md border border-zinc-300 px-2 py-1 text-xs">
                    Send
                  </button>
                  <button className="rounded-md border border-zinc-300 px-2 py-1 text-xs">
                    Delete
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
          {multiPanelsLoading && (
            <span className="text-xs text-zinc-500">Loading...</span>
          )}
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
                  <button className="rounded-md border border-zinc-300 px-2 py-1 text-xs">
                    Edit
                  </button>
                  <button className="rounded-md border border-zinc-300 px-2 py-1 text-xs">
                    Send
                  </button>
                  <button className="rounded-md border border-zinc-300 px-2 py-1 text-xs">
                    Delete
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
