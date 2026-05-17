"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  api,
  type DiscordEmoji,
  type DiscordRole,
} from "../../../../../lib/api";
import EmojiPicker from "@/components/emoji-picker";
import {
  useGuildEmojis,
  useGuildMeta,
} from "../../../../../lib/hooks/useGuildMeta";

const buttonColors = ["red", "blue", "green", "gray"] as const;

type PanelForm = {
  mentionRoles: string[];
  categoryId: string;
  title: string;
  content: string;
  questions: string[];
  welcomeMessage: {
    embedColor: string;
    title: string;
    description: string;
    titleUrl: string;
    largeImgUrl: string;
    smallImgUrl: string;
    footerText: string;
    footerIconUrl: string;
  };
  color: string;
  channelId: string;
  buttonColor: string;
  buttonText: string;
  emoji: string;
  customEmoji: boolean;
  customEmojiId: string;
  customEmojiToken: string;
  largeImageUrl: string;
  smallImageUrl: string;
};

export default function CreatePanelPage() {
  const router = useRouter();
  const params = useParams();
  const serverId = params.serverId as string;

  const [form, setForm] = useState<PanelForm>({
    mentionRoles: [],
    categoryId: "",
    title: "",
    content: "",
    questions: [""],
    welcomeMessage: {
      embedColor: "#57f287",
      title: "",
      description: "",
      titleUrl: "",
      largeImgUrl: "",
      smallImgUrl: "",
      footerText: "",
      footerIconUrl: "",
    },
    color: "#5865f2",
    channelId: "",
    buttonColor: "blue",
    buttonText: "Open Ticket",
    emoji: "",
    customEmoji: false,
    customEmojiId: "",
    customEmojiToken: "",
    largeImageUrl: "",
    smallImageUrl: "",
  });
  const { roles, channels, categories, isLoading } = useGuildMeta(serverId);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { emojis, isLoading: emojisLoading } = useGuildEmojis(
    serverId,
    form.customEmoji && emojiPickerOpen,
  );
  const [saving, setSaving] = useState(false);

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => b.position - a.position);
  }, [roles]);

  const toggleMentionRole = (roleId: string) => {
    setForm((prev) => {
      const next = prev.mentionRoles.includes(roleId)
        ? prev.mentionRoles.filter((id) => id !== roleId)
        : [...prev.mentionRoles, roleId];
      return { ...prev, mentionRoles: next };
    });
  };

  const selectedCustomEmoji = useMemo<DiscordEmoji | undefined>(() => {
    return emojis.find((emoji) => emoji.id === form.customEmojiId);
  }, [emojis, form.customEmojiId]);

  const buildEmojiValue = (emoji: DiscordEmoji | undefined) => {
    if (form.customEmojiToken) return form.customEmojiToken;
    if (!emoji) return "";
    return `${emoji.name}:${emoji.id}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const embedColor = parseInt(form.color.replace("#", ""), 16) || 0;
      const emojiValue = form.customEmoji
        ? buildEmojiValue(selectedCustomEmoji)
        : form.emoji;

      await api.panels.create(serverId, {
        mentionRolesOnOpen: form.mentionRoles,
        categoryId: form.categoryId,
        title: form.title,
        content: form.content,
        embedColor,
        channelId: form.channelId,
        btnColor: form.buttonColor,
        btnTxt: form.buttonText,
        btnEmoji: emojiValue,
        largeImgUrl: form.largeImageUrl,
        smallImgUrl: form.smallImageUrl,
        questions: form.questions.filter((q) => q.trim() !== ""),
        welcomeMessage: {
          embedColor:
            parseInt(form.welcomeMessage.embedColor.replace("#", ""), 16) || 0,
          title: form.welcomeMessage.title,
          description: form.welcomeMessage.description,
          titleUrl: form.welcomeMessage.titleUrl,
          largeImgUrl: form.welcomeMessage.largeImgUrl,
          smallImgUrl: form.welcomeMessage.smallImgUrl,
          footerText: form.welcomeMessage.footerText,
          footerIconUrl: form.welcomeMessage.footerIconUrl,
        },
      });

      router.push(`/servers/${serverId}/panels`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Create Panel</h1>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <label className="text-sm font-medium text-zinc-700">
          Mention on open
          {form.mentionRoles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.mentionRoles.map((roleId) => {
                const role = sortedRoles.find((item) => item.id === roleId);
                return (
                  <span
                    key={roleId}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs"
                  >
                    @{role?.name ?? roleId}
                    <button
                      type="button"
                      className="text-zinc-600 hover:text-zinc-900"
                      onClick={() => toggleMentionRole(roleId)}
                      aria-label={`Remove ${role?.name ?? "role"}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <div className="mt-2 grid max-h-40 gap-2 overflow-y-auto rounded-md border border-zinc-200 p-2 text-sm">
            {sortedRoles.map((role: DiscordRole) => (
              <label key={role.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.mentionRoles.includes(role.id)}
                  onChange={() => toggleMentionRole(role.id)}
                />
                <span>{role.name}</span>
              </label>
            ))}
          </div>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Ticket category
          <select
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.categoryId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, categoryId: event.target.value }))
            }
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Panel title
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Panel content
          <textarea
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            rows={4}
            value={form.content}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, content: event.target.value }))
            }
          />
        </label>

        <div className="text-sm font-medium text-zinc-700">
          Questions
          <div className="mt-2 space-y-2">
            {form.questions.map((question, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="w-full rounded-md border border-zinc-200 p-2 text-sm"
                  value={question}
                  onChange={(event) => {
                    const next = [...form.questions];
                    next[index] = event.target.value;
                    setForm((prev) => ({ ...prev, questions: next }));
                  }}
                />
                <button
                  type="button"
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                  onClick={() => {
                    const next = form.questions.filter((_, i) => i != index);
                    setForm((prev) => ({
                      ...prev,
                      questions: next.length ? next : [""],
                    }));
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 rounded-md border border-zinc-300 px-2 py-1 text-xs"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                questions: [...prev.questions, ""],
              }))
            }
          >
            Add question
          </button>
        </div>

        <label className="text-sm font-medium text-zinc-700">
          Panel color
          <input
            type="color"
            className="mt-2 h-10 w-20 rounded-md border border-zinc-200"
            value={form.color}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, color: event.target.value }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Panel channel
          <select
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.channelId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, channelId: event.target.value }))
            }
          >
            <option value="">Select channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Button color
          <select
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.buttonColor}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, buttonColor: event.target.value }))
            }
          >
            {buttonColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Button text
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.buttonText}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, buttonText: event.target.value }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Emoji
          <div className="mt-2">
            {emojisLoading && form.customEmoji ? (
              <p className="text-xs text-zinc-500">Loading emojis...</p>
            ) : (
              <EmojiPicker
                value={form.emoji}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, emoji: value }))
                }
                customEmojis={emojis}
                customEmojiId={form.customEmojiId}
                onCustomEmojiSelect={(emojiId) => {
                  const picked = emojis.find((emoji) => emoji.id === emojiId);
                  setForm((prev) => ({
                    ...prev,
                    customEmojiId: emojiId,
                    customEmojiToken: picked
                      ? `${picked.name}:${picked.id}`
                      : prev.customEmojiToken,
                  }));
                }}
                useCustom={form.customEmoji}
                onToggleCustom={(useCustom) =>
                  setForm((prev) => ({ ...prev, customEmoji: useCustom }))
                }
                onOpenChange={setEmojiPickerOpen}
              />
            )}
          </div>
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Large image URL
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.largeImageUrl}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                largeImageUrl: event.target.value,
              }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Small image URL
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.smallImageUrl}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                smallImageUrl: event.target.value,
              }))
            }
          />
        </label>
      </section>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="text-sm font-semibold text-zinc-900">
          Welcome Message
        </div>

        <label className="text-sm font-medium text-zinc-700">
          Embed color
          <input
            type="color"
            className="mt-2 h-10 w-20 rounded-md border border-zinc-200"
            value={form.welcomeMessage.embedColor}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                welcomeMessage: {
                  ...prev.welcomeMessage,
                  embedColor: event.target.value,
                },
              }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Title
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.welcomeMessage.title}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                welcomeMessage: {
                  ...prev.welcomeMessage,
                  title: event.target.value,
                },
              }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Description
          <textarea
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            rows={3}
            value={form.welcomeMessage.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                welcomeMessage: {
                  ...prev.welcomeMessage,
                  description: event.target.value,
                },
              }))
            }
          />
        </label>

        <label className="text-sm font-medium text-zinc-700">
          Title URL
          <input
            className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
            value={form.welcomeMessage.titleUrl}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                welcomeMessage: {
                  ...prev.welcomeMessage,
                  titleUrl: event.target.value,
                },
              }))
            }
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-zinc-700">
            Large image URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.welcomeMessage.largeImgUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  welcomeMessage: {
                    ...prev.welcomeMessage,
                    largeImgUrl: event.target.value,
                  },
                }))
              }
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Small image URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.welcomeMessage.smallImgUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  welcomeMessage: {
                    ...prev.welcomeMessage,
                    smallImgUrl: event.target.value,
                  },
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
              value={form.welcomeMessage.footerText}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  welcomeMessage: {
                    ...prev.welcomeMessage,
                    footerText: event.target.value,
                  },
                }))
              }
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Footer icon URL
            <input
              className="mt-2 w-full rounded-md border border-zinc-200 p-2 text-sm"
              value={form.welcomeMessage.footerIconUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  welcomeMessage: {
                    ...prev.welcomeMessage,
                    footerIconUrl: event.target.value,
                  },
                }))
              }
            />
          </label>
        </div>
      </section>

      {isLoading && (
        <p className="text-sm text-zinc-500">Loading server data...</p>
      )}
    </form>
  );
}
