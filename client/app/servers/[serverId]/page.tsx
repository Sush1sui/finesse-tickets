"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type ServerConfig } from "../../../lib/api";
import useAuth from "../../../lib/context/auth";
import { useServerConfig } from "../../../lib/hooks/useServers";

type FormData = {
  TicketNameStyle: string;
  TicketTranscripts: string;
  MaxTicketsPerUser: number;
  TicketPermissionsAttachFiles: boolean;
  TicketPermissionsEmbedLinks: boolean;
  TicketPermissionsAddReactions: boolean;
  AutoClose: boolean;
  AutoCloseOnUserLeave: boolean;
  AutoCloseNoResponseDays: number;
  AutoCloseNoResponseHours: number;
  AutoCloseNoResponseMins: number;
  AutoCloseSinceLastMessageDays: number;
  AutoCloseSinceLastMessageHours: number;
  AutoCloseSinceLastMessageMins: number;
};

export default function ServerSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { config, channels, isLoading } = useServerConfig(params.serverId as string, true);
  const [saving, setSaving] = useState(false);
  const serverId = params.serverId as string;

  const [formData, setFormData] = useState<FormData>({
    TicketNameStyle: "number",
    TicketTranscripts: "",
    MaxTicketsPerUser: 1,
    TicketPermissionsAttachFiles: false,
    TicketPermissionsEmbedLinks: false,
    TicketPermissionsAddReactions: false,
    AutoClose: false,
    AutoCloseOnUserLeave: false,
    AutoCloseNoResponseDays: 0,
    AutoCloseNoResponseHours: 0,
    AutoCloseNoResponseMins: 0,
    AutoCloseSinceLastMessageDays: 0,
    AutoCloseSinceLastMessageHours: 0,
    AutoCloseSinceLastMessageMins: 0,
  });

  useEffect(() => {
    if (!config) return;
    setFormData({
      TicketNameStyle: config.TicketNameStyle || "number",
      TicketTranscripts: config.TicketTranscripts || "",
      MaxTicketsPerUser: config.MaxTicketsPerUser || 1,
      TicketPermissionsAttachFiles: config.TicketPermissionsAttachFiles || false,
      TicketPermissionsEmbedLinks: config.TicketPermissionsEmbedLinks || false,
      TicketPermissionsAddReactions: config.TicketPermissionsAddReactions || false,
      AutoClose: config.AutoClose || false,
      AutoCloseOnUserLeave: config.AutoCloseOnUserLeave || false,
      AutoCloseNoResponseDays: config.AutoCloseNoResponseDays || 0,
      AutoCloseNoResponseHours: config.AutoCloseNoResponseHours || 0,
      AutoCloseNoResponseMins: config.AutoCloseNoResponseMins || 0,
      AutoCloseSinceLastMessageDays: config.AutoCloseSinceLastMessageDays || 0,
      AutoCloseSinceLastMessageHours: config.AutoCloseSinceLastMessageHours || 0,
      AutoCloseSinceLastMessageMins: config.AutoCloseSinceLastMessageMins || 0,
    });
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.config.update(serverId, formData);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleNumberInput = (field: keyof FormData, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      setFormData((prev) => ({ ...prev, [field]: 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: num }));
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
          <Link
            href="/servers"
            className="text-zinc-500 hover:text-zinc-700"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Server Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Ticket Name Style
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ticketNameStyle"
                value="number"
                checked={formData.TicketNameStyle === "number"}
                onChange={() =>
                  setFormData((p) => ({ ...p, TicketNameStyle: "number" }))
                }
                className="text-indigo-600"
              />
              <span className="text-sm text-zinc-700">By Number</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ticketNameStyle"
                value="name"
                checked={formData.TicketNameStyle === "name"}
                onChange={() =>
                  setFormData((p) => ({ ...p, TicketNameStyle: "name" }))
                }
                className="text-indigo-600"
              />
              <span className="text-sm text-zinc-700">By Name</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Ticket Transcripts
          </label>
          <input
            type="text"
            list="transcript-options"
            value={formData.TicketTranscripts}
            onChange={(e) =>
              setFormData((p) => ({ ...p, TicketTranscripts: e.target.value }))
            }
            placeholder="Select or type a channel"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <datalist id="transcript-options">
            {channels
              .filter((ch) => ch.type === 0)
              .map((ch) => (
                <option key={ch.id} value={ch.name} />
              ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Max Tickets Per User
          </label>
          <input
            type="number"
            min="1"
            value={formData.MaxTicketsPerUser}
            onKeyDown={(e) => {
              if (
                e.key === "e" ||
                e.key === "E" ||
                e.key === "-" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
            onChange={(e) =>
              handleNumberInput("MaxTicketsPerUser", e.target.value)
            }
            className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Ticket Permissions
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.TicketPermissionsAttachFiles}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    TicketPermissionsAttachFiles: e.target.checked,
                  }))
                }
                className="text-indigo-600"
              />
              <span className="text-sm text-zinc-700">Attach Files</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.TicketPermissionsEmbedLinks}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    TicketPermissionsEmbedLinks: e.target.checked,
                  }))
                }
                className="text-indigo-600"
              />
              <span className="text-sm text-zinc-700">Embed Links</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.TicketPermissionsAddReactions}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    TicketPermissionsAddReactions: e.target.checked,
                  }))
                }
                className="text-indigo-600"
              />
              <span className="text-sm text-zinc-700">Add Reactions</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.AutoClose}
              onChange={(e) =>
                setFormData((p) => ({ ...p, AutoClose: e.target.checked }))
              }
              className="text-indigo-600"
            />
            <span className="text-sm font-medium text-zinc-700">
              Auto Close
            </span>
          </label>
        </div>

        {formData.AutoClose && (
          <div className="ml-6 space-y-4 border-l-2 border-zinc-100 pl-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.AutoCloseOnUserLeave}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    AutoCloseOnUserLeave: e.target.checked,
                  }))
                }
                className="text-indigo-600"
              />
              <span className="text-sm text-zinc-700">
                Close when user leave
              </span>
            </label>

            <div>
              <p className="text-sm text-zinc-700 mb-2">
                Since open with no response
              </p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.AutoCloseNoResponseDays}
                    onKeyDown={(e) => {
                      if (
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNumberInput(
                        "AutoCloseNoResponseDays",
                        e.target.value,
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-zinc-500">days</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.AutoCloseNoResponseHours}
                    onKeyDown={(e) => {
                      if (
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNumberInput(
                        "AutoCloseNoResponseHours",
                        e.target.value,
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-zinc-500">hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.AutoCloseNoResponseMins}
                    onKeyDown={(e) => {
                      if (
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNumberInput(
                        "AutoCloseNoResponseMins",
                        e.target.value,
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-zinc-500">mins</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-zinc-700 mb-2">Since last message</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.AutoCloseSinceLastMessageDays}
                    onKeyDown={(e) => {
                      if (
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNumberInput(
                        "AutoCloseSinceLastMessageDays",
                        e.target.value,
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-zinc-500">days</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.AutoCloseSinceLastMessageHours}
                    onKeyDown={(e) => {
                      if (
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNumberInput(
                        "AutoCloseSinceLastMessageHours",
                        e.target.value,
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-zinc-500">hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.AutoCloseSinceLastMessageMins}
                    onKeyDown={(e) => {
                      if (
                        e.key === "e" ||
                        e.key === "E" ||
                        e.key === "-" ||
                        e.key === "+"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNumberInput(
                        "AutoCloseSinceLastMessageMins",
                        e.target.value,
                      )
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                  <span className="text-xs text-zinc-500">mins</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
