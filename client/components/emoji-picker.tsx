"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData, Theme } from "emoji-picker-react";
import { ChevronDown, Smile } from "lucide-react";

import type { DiscordEmoji } from "@/lib/api";
import { DarkCheckbox } from "./DarkFormFields";

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
		if (isOpen && useCustom) setVisibleCount(64);
	}, [isOpen, useCustom]);

	useEffect(() => {
		onOpenChange?.(isOpen);
	}, [isOpen, onOpenChange]);

	const handleEmojiClick = (emojiData: EmojiClickData) => {
		onChange(emojiData.emoji);
		setIsOpen(false);
	};

	const handleCustomEmojiSelect = (emojiId: string) => {
		onCustomEmojiSelect(emojiId);
		setIsOpen(false);
	};

	const handleToggleCustom = (checked: boolean) => {
		onToggleCustom(checked);
		setIsOpen(false);
	};

	const visibleEmojis = useMemo(
		() => customEmojis.slice(0, visibleCount),
		[customEmojis, visibleCount],
	);

	return (
		<div className="space-y-2.5">
			<DarkCheckbox
				checked={useCustom}
				onChange={handleToggleCustom}
				label="Use server custom emoji"
			/>

			<div className={`relative ${isOpen ? "z-30" : ""}`}>
				{/* Trigger button */}
				<button
					type="button"
					onClick={() => setIsOpen((p) => !p)}
					className="w-full flex items-center justify-between gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-left transition-all hover:border-zinc-700/80 focus:outline-none focus:border-[#FF5A36]/50 focus:ring-1 focus:ring-[#FF5A36]/20"
				>
					<div className="flex items-center gap-2">
						{displayValue ? (
							<span className="text-lg leading-none">{!useCustom && displayValue}</span>
						) : (
							<Smile className="h-4 w-4 text-zinc-600" />
						)}
						<span className={displayValue ? "text-zinc-200 text-sm" : "text-zinc-600 text-sm"}>
							{displayValue || placeholder}
						</span>
					</div>
					<ChevronDown
						className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{/* Dropdown */}
				{isOpen && (
					<>
						<div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
						<div className="absolute z-20 mt-1.5 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
							{useCustom ? (
								customEmojis.length === 0 ? (
									<p className="px-4 py-6 text-center text-xs text-zinc-600">
										No custom emojis in this server.
									</p>
								) : (
									<div className="p-3 space-y-3">
										<div className="grid max-h-64 grid-cols-8 gap-1.5 overflow-y-auto">
											{visibleEmojis.map((emoji) => (
												<button
													key={emoji.id}
													type="button"
													onClick={() => handleCustomEmojiSelect(emoji.id)}
													title={emoji.name}
													className={`rounded-lg p-1.5 transition-all hover:bg-zinc-800/80 ${
														emoji.id === customEmojiId
															? "bg-[#FF5A36]/15 ring-1 ring-[#FF5A36]/40"
															: ""
													}`}
												>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={getEmojiUrl(emoji)}
														alt={emoji.name}
														className="h-7 w-7"
													/>
												</button>
											))}
										</div>
										{customEmojis.length > visibleCount && (
											<button
												type="button"
												className="w-full rounded-lg border border-zinc-800/60 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all"
												onClick={() => setVisibleCount((p) => p + 64)}
											>
												Show more ({customEmojis.length - visibleCount} remaining)
											</button>
										)}
										{selectedCustomEmoji && (
											<p className="text-xs text-zinc-500 text-center">
												Selected:{" "}
												<span className="text-zinc-300">:{selectedCustomEmoji.name}:</span>
											</p>
										)}
									</div>
								)
							) : (
								<Picker
									onEmojiClick={handleEmojiClick}
									theme={"dark" as Theme}
									searchPlaceHolder="Search emojis"
									width="100%"
									height="350px"
									previewConfig={{ showPreview: false }}
								/>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
