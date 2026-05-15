"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData, Theme } from "emoji-picker-react";

import type { DiscordEmoji } from "@/lib/api";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type EmojiPickerProps = {
  value: string;
  onChange: (value: string) => void;
  customEmojis: DiscordEmoji[];
  customEmojiId: string;
  onCustomEmojiSelect: (emojiId: string) => void;
  useCustom: boolean;
  onToggleCustom: (useCustom: boolean) => void;
  onOpenChange?: (open: boolean) => void;
};

const getEmojiUrl = (emoji: DiscordEmoji) => {
  const ext = emoji.animated ? "gif" : "png";
  return `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}`;
};

export default function EmojiPicker({
  value,
  onChange,
  customEmojis,
  customEmojiId,
  onCustomEmojiSelect,
  useCustom,
  onToggleCustom,
  onOpenChange,
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(64);

  const selectedCustomEmoji = useMemo(() => {
    return customEmojis.find((emoji) => emoji.id === customEmojiId);
  }, [customEmojis, customEmojiId]);

  const displayValue = useMemo(() => {
    if (useCustom) {
      return selectedCustomEmoji ? `:${selectedCustomEmoji.name}:` : "";
    }

    return value;
  }, [useCustom, selectedCustomEmoji, value]);

  const placeholder = useCustom ? "Select custom emoji" : "Select emoji";

  useEffect(() => {
    if (isOpen && useCustom) {
      setVisibleCount(64);
    }
  }, [isOpen, useCustom]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const handleCustomEmojiSelect = (emojiId: string) => {
    onCustomEmojiSelect(emojiId);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const handleToggleCustom = (checked: boolean) => {
    onToggleCustom(checked);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const handleOpenToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      onOpenChange?.(next);
      return next;
    });
  };

  const visibleEmojis = useMemo(() => {
    return customEmojis.slice(0, visibleCount);
  }, [customEmojis, visibleCount]);

  return (
    <div className="relative">
      <label className="mb-2 flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={useCustom}
          onChange={(event) => handleToggleCustom(event.target.checked)}
        />
        Use custom emoji
      </label>

      <input
        className="w-full cursor-pointer rounded-md border border-zinc-200 p-2 text-sm"
        readOnly
        value={displayValue}
        placeholder={placeholder}
        onClick={handleOpenToggle}
      />

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-zinc-200 bg-white p-2 shadow-lg">
          {useCustom ? (
            customEmojis.length === 0 ? (
              <p className="text-xs text-zinc-500">No custom emojis.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid max-h-72 grid-cols-8 gap-2 overflow-y-auto">
                  {visibleEmojis.map((emoji) => (
                    <button
                      key={emoji.id}
                      type="button"
                      onClick={() => handleCustomEmojiSelect(emoji.id)}
                      className={
                        emoji.id === customEmojiId
                          ? "rounded-md border border-zinc-900 bg-zinc-50 p-1"
                          : "rounded-md border border-zinc-200 p-1"
                      }
                      title={emoji.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getEmojiUrl(emoji)}
                        alt={emoji.name}
                        className="h-8 w-8"
                      />
                    </button>
                  ))}
                </div>
                {customEmojis.length > visibleCount && (
                  <button
                    type="button"
                    className="w-full rounded-md border border-zinc-200 py-1 text-xs text-zinc-600"
                    onClick={() => setVisibleCount((prev) => prev + 64)}
                  >
                    Show more
                  </button>
                )}
              </div>
            )
          ) : (
            <Picker
              onEmojiClick={handleEmojiClick}
              theme={"light" as Theme}
              searchPlaceHolder="Search emojis"
              width="100%"
              height="350px"
              previewConfig={{ showPreview: false }}
            />
          )}

          {useCustom && selectedCustomEmoji && (
            <p className="mt-2 text-xs text-zinc-500">
              Selected: {selectedCustomEmoji.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
