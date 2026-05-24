"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { api, type DiscordEmoji, type DiscordRole } from "../../../../../lib/api";
import EmojiPicker from "@/components/emoji-picker";
import { useGuildEmojis, useGuildMeta } from "../../../../../lib/hooks/useGuildMeta";
import {
	DarkInput,
	DarkTextarea,
	DarkSelect,
	DarkMultiRolePicker,
	SectionCard,
	FormLabel,
} from "../../../../../components/DarkFormFields";
import { Save, Plus, Trash2 } from "lucide-react";

const buttonColorOptions = [
	{ value: "blue", label: "🔵  Blurple" },
	{ value: "green", label: "🟢  Green" },
	{ value: "red", label: "🔴  Red" },
	{ value: "gray", label: "⚫  Gray" },
];

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

	const sortedRoles = useMemo(
		() => [...roles].sort((a, b) => b.position - a.position),
		[roles],
	);

	const toggleMentionRole = (roleId: string) => {
		setForm((prev) => {
			const next = prev.mentionRoles.includes(roleId)
				? prev.mentionRoles.filter((id) => id !== roleId)
				: [...prev.mentionRoles, roleId];
			return { ...prev, mentionRoles: next };
		});
	};

	const selectedCustomEmoji = useMemo<DiscordEmoji | undefined>(
		() => emojis.find((emoji) => emoji.id === form.customEmojiId),
		[emojis, form.customEmojiId],
	);

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

	const channelOptions = channels.map((c) => ({ value: c.id, label: `#${c.name}` }));
	const categoryOptions = [
		{ value: "", label: "No category" },
		...categories.map((c) => ({ value: c.id, label: c.name })),
	];

	return (
		<form onSubmit={handleSubmit} className="space-y-5 pb-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<div>
					<h1 className="text-xl font-black tracking-tight text-white">Create Panel</h1>
					<p className="text-xs text-zinc-500 mt-0.5">
						Configure the ticket panel that appears in your Discord channel.
					</p>
				</div>
				<button
					type="submit"
					disabled={saving || isLoading}
					className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold bg-[#FF5A36] hover:bg-[#FF6B4A] text-white shadow-[0_0_16px_rgba(255,90,54,0.25)] transition-all duration-200 active:scale-95 disabled:opacity-60"
				>
					<Save className="h-3.5 w-3.5" />
					{saving ? "Saving..." : "Create Panel"}
				</button>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center py-12">
					<div className="flex flex-col items-center gap-3">
						<div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
						<p className="text-xs text-zinc-500">Loading server data...</p>
					</div>
				</div>
			)}

			{/* Panel Settings */}
			<SectionCard title="Panel Settings" description="The embed message posted in your Discord channel.">
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FormLabel label="Send to channel">
							<DarkSelect
								value={form.channelId}
								onChange={(v) => setForm((p) => ({ ...p, channelId: v }))}
								options={channelOptions}
								placeholder="Select channel..."
							/>
						</FormLabel>
						<FormLabel label="Panel title">
							<DarkInput
								value={form.title}
								onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
								placeholder="Support Tickets"
							/>
						</FormLabel>
						<FormLabel label="Panel color">
							<div className="flex items-center gap-2">
								<input
									type="color"
									value={form.color}
									onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
									className="h-10 w-12 rounded-lg border border-zinc-800/80 bg-zinc-900/60 cursor-pointer p-1"
								/>
								<DarkInput
									value={form.color}
									onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
									placeholder="#5865F2"
									className="flex-1"
								/>
							</div>
						</FormLabel>
					</div>

					<FormLabel label="Panel description">
						<DarkTextarea
							value={form.content}
							onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
							placeholder="Click the button below to open a ticket."
							rows={3}
						/>
					</FormLabel>

					<div className="grid grid-cols-2 gap-4">
						<FormLabel label="Large image URL" hint="optional">
							<DarkInput
								value={form.largeImageUrl}
								onChange={(e) => setForm((p) => ({ ...p, largeImageUrl: e.target.value }))}
								placeholder="https://..."
							/>
						</FormLabel>
						<FormLabel label="Small image URL" hint="optional">
							<DarkInput
								value={form.smallImageUrl}
								onChange={(e) => setForm((p) => ({ ...p, smallImageUrl: e.target.value }))}
								placeholder="https://..."
							/>
						</FormLabel>
					</div>
				</div>
			</SectionCard>

			{/* Button */}
			<SectionCard title="Button" description="The button users click to open a ticket.">
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormLabel label="Button text">
							<DarkInput
								value={form.buttonText}
								onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))}
								placeholder="Open Ticket"
							/>
						</FormLabel>
						<FormLabel label="Button color">
							<DarkSelect
								value={form.buttonColor}
								onChange={(v) => setForm((p) => ({ ...p, buttonColor: v }))}
								options={buttonColorOptions}
							/>
						</FormLabel>
					</div>
					<FormLabel label="Button emoji" hint="optional">
						{emojisLoading && form.customEmoji ? (
							<p className="text-xs text-zinc-500 py-2">Loading server emojis...</p>
						) : (
							<EmojiPicker
								value={form.emoji}
								onChange={(value) => setForm((p) => ({ ...p, emoji: value }))}
								customEmojis={emojis}
								customEmojiId={form.customEmojiId}
								onCustomEmojiSelect={(emojiId) => {
									const picked = emojis.find((e) => e.id === emojiId);
									setForm((p) => ({
										...p,
										customEmojiId: emojiId,
										customEmojiToken: picked
											? `${picked.name}:${picked.id}`
											: p.customEmojiToken,
									}));
								}}
								useCustom={form.customEmoji}
								onToggleCustom={(useCustom) =>
									setForm((p) => ({ ...p, customEmoji: useCustom }))
								}
								onOpenChange={setEmojiPickerOpen}
							/>
						)}
					</FormLabel>
				</div>
			</SectionCard>

			<SectionCard title="Ticket Channel" description="Where tickets are created.">
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormLabel label="Ticket category">
							<DarkSelect
								value={form.categoryId}
								onChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}
								options={categoryOptions}
							/>
						</FormLabel>
						<FormLabel label="Mention roles on open" hint="optional">
							<DarkMultiRolePicker
								roles={sortedRoles.map((r: DiscordRole) => ({
									id: r.id,
									name: r.name,
									color: r.color,
								}))}
								selectedIds={form.mentionRoles}
								onToggle={toggleMentionRole}
							/>
						</FormLabel>
					</div>
				</div>
			</SectionCard>

			{/* Questions */}
			<SectionCard
				title="Questions"
				description="Users answer these when opening a ticket."
				action={
					<button
						type="button"
						onClick={() =>
							setForm((p) => ({ ...p, questions: [...p.questions, ""] }))
						}
						className="flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
					>
						<Plus className="h-3.5 w-3.5" />
						Add Question
					</button>
				}
			>
				<div className="space-y-2.5">
					{form.questions.map((question, index) => (
						<div key={index} className="flex items-center gap-2">
							<span className="text-xs font-mono text-zinc-600 w-5 shrink-0 text-right">
								{index + 1}.
							</span>
							<DarkInput
								value={question}
								onChange={(e) => {
									const next = [...form.questions];
									next[index] = e.target.value;
									setForm((p) => ({ ...p, questions: next }));
								}}
								placeholder={`Question ${index + 1}...`}
								className="flex-1"
							/>
							<button
								type="button"
								onClick={() => {
									const next = form.questions.filter((_, i) => i !== index);
									setForm((p) => ({ ...p, questions: next.length ? next : [""] }));
								}}
								className="p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all"
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						</div>
					))}
					{form.questions.length === 0 && (
						<p className="text-xs text-zinc-600 text-center py-4">
							No questions yet — click "Add Question" above.
						</p>
					)}
				</div>
			</SectionCard>

			{/* Welcome Message */}
			<SectionCard
				title="Welcome Message"
				description="Embed sent inside the ticket channel when it's opened."
			>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormLabel label="Title">
							<DarkInput
								value={form.welcomeMessage.title}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										welcomeMessage: { ...p.welcomeMessage, title: e.target.value },
									}))
								}
								placeholder="Your ticket is open!"
							/>
						</FormLabel>
						<FormLabel label="Embed color">
							<div className="flex items-center gap-2">
								<input
									type="color"
									value={form.welcomeMessage.embedColor}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											welcomeMessage: { ...p.welcomeMessage, embedColor: e.target.value },
										}))
									}
									className="h-10 w-12 rounded-lg border border-zinc-800/80 bg-zinc-900/60 cursor-pointer p-1"
								/>
								<DarkInput
									value={form.welcomeMessage.embedColor}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											welcomeMessage: { ...p.welcomeMessage, embedColor: e.target.value },
										}))
									}
									className="flex-1"
								/>
							</div>
						</FormLabel>
					</div>

					<FormLabel label="Description">
						<DarkTextarea
							value={form.welcomeMessage.description}
							onChange={(e) =>
								setForm((p) => ({
									...p,
									welcomeMessage: { ...p.welcomeMessage, description: e.target.value },
								}))
							}
							placeholder="A staff member will be with you shortly."
							rows={3}
						/>
					</FormLabel>

					<FormLabel label="Title URL" hint="optional">
						<DarkInput
							value={form.welcomeMessage.titleUrl}
							onChange={(e) =>
								setForm((p) => ({
									...p,
									welcomeMessage: { ...p.welcomeMessage, titleUrl: e.target.value },
								}))
							}
							placeholder="https://..."
						/>
					</FormLabel>

					<div className="grid grid-cols-2 gap-4">
						<FormLabel label="Large image URL" hint="optional">
							<DarkInput
								value={form.welcomeMessage.largeImgUrl}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										welcomeMessage: { ...p.welcomeMessage, largeImgUrl: e.target.value },
									}))
								}
								placeholder="https://..."
							/>
						</FormLabel>
						<FormLabel label="Small image URL" hint="optional">
							<DarkInput
								value={form.welcomeMessage.smallImgUrl}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										welcomeMessage: { ...p.welcomeMessage, smallImgUrl: e.target.value },
									}))
								}
								placeholder="https://..."
							/>
						</FormLabel>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormLabel label="Footer text" hint="optional">
							<DarkInput
								value={form.welcomeMessage.footerText}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										welcomeMessage: { ...p.welcomeMessage, footerText: e.target.value },
									}))
								}
								placeholder="Sushi Tickets"
							/>
						</FormLabel>
						<FormLabel label="Footer icon URL" hint="optional">
							<DarkInput
								value={form.welcomeMessage.footerIconUrl}
								onChange={(e) =>
									setForm((p) => ({
										...p,
										welcomeMessage: { ...p.welcomeMessage, footerIconUrl: e.target.value },
									}))
								}
								placeholder="https://..."
							/>
						</FormLabel>
					</div>
				</div>
			</SectionCard>
		</form>
	);
}
