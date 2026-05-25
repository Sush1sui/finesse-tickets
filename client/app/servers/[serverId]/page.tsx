"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import useAuth from "../../../lib/context/auth";
import { useServerConfig } from "../../../lib/hooks/useServers";
import { Save } from "lucide-react";
import {
	DarkInput,
	DarkToggle,
	DarkCheckbox,
	DarkCombobox,
	SectionCard,
	FormLabel,
} from "../../../components/DarkFormFields";

type FormData = {
	TicketNameStyle: string;
	TicketTranscripts: string;
	MaxTicketsPerUser: string | number;
	TicketPermissionsAttachFiles: boolean;
	TicketPermissionsEmbedLinks: boolean;
	TicketPermissionsAddReactions: boolean;
	AutoClose: boolean;
	AutoCloseOnUserLeave: boolean;
	AutoCloseNoResponseDays: string;
	AutoCloseNoResponseHours: string;
	AutoCloseNoResponseMins: string;
	AutoCloseSinceLastMessageDays: string;
	AutoCloseSinceLastMessageHours: string;
	AutoCloseSinceLastMessageMins: string;
};

function TimeInput({
	days,
	hours,
	mins,
	onChangeDays,
	onChangeHours,
	onChangeMins,
}: {
	days: string;
	hours: string;
	mins: string;
	onChangeDays: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onChangeHours: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onChangeMins: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	const blockInvalid = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (["e", "E", "-", "+", "."].includes(e.key)) e.preventDefault();
	};
	return (
		<div className="flex items-center gap-3">
			{[
				{ value: days, onChange: onChangeDays, label: "days" },
				{ value: hours, onChange: onChangeHours, label: "hrs" },
				{ value: mins, onChange: onChangeMins, label: "min" },
			].map(({ value, onChange, label }) => (
				<div key={label} className="flex items-center gap-2">
					<DarkInput
						type="number"
						min="0"
						value={value}
						onChange={onChange}
						onKeyDown={blockInvalid}
						className="w-16 text-center"
					/>
					<span className="text-xs text-zinc-500 w-6">{label}</span>
				</div>
			))}
		</div>
	);
}

export default function ServerSettingsPage() {
	const params = useParams();
	const router = useRouter();
	const { user, authLoading } = useAuth();
	const { config, channels, isLoading } = useServerConfig(
		params.serverId as string,
		true,
	);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const serverId = params.serverId as string;

	const [formData, setFormData] = useState<FormData>({
		TicketNameStyle: "number",
		TicketTranscripts: "",
		MaxTicketsPerUser: "1",
		TicketPermissionsAttachFiles: false,
		TicketPermissionsEmbedLinks: false,
		TicketPermissionsAddReactions: false,
		AutoClose: false,
		AutoCloseOnUserLeave: false,
		AutoCloseNoResponseDays: "0",
		AutoCloseNoResponseHours: "0",
		AutoCloseNoResponseMins: "0",
		AutoCloseSinceLastMessageDays: "0",
		AutoCloseSinceLastMessageHours: "0",
		AutoCloseSinceLastMessageMins: "0",
	});

	useEffect(() => {
		if (!config) return;
		const transcriptChannel = channels.find((ch) => ch.id === config.TicketTranscriptCid);
		const transcriptName = transcriptChannel
			? transcriptChannel.name
			: config.TicketTranscriptCid || "";

		setFormData((prev) => ({
			...prev,
			TicketNameStyle: config.TicketNameStyle || "number",
			TicketTranscripts: transcriptName,
			MaxTicketsPerUser: String(config.MaxTicketsPerUser ?? 1),
			TicketPermissionsAttachFiles: config.TicketPermissionsAttachFiles || false,
			TicketPermissionsEmbedLinks: config.TicketPermissionsEmbedLinks || false,
			TicketPermissionsAddReactions: config.TicketPermissionsAddReactions || false,
			AutoClose: config.AutoClose || false,
			AutoCloseOnUserLeave: config.AutoCloseOnUserLeave || false,
			AutoCloseNoResponseDays: String(config.AutoCloseNoResponseDays ?? 0),
			AutoCloseNoResponseHours: String(config.AutoCloseNoResponseHours ?? 0),
			AutoCloseNoResponseMins: String(config.AutoCloseNoResponseMins ?? 0),
			AutoCloseSinceLastMessageDays: String(config.AutoCloseSinceLastMessageDays ?? 0),
			AutoCloseSinceLastMessageHours: String(config.AutoCloseSinceLastMessageHours ?? 0),
			AutoCloseSinceLastMessageMins: String(config.AutoCloseSinceLastMessageMins ?? 0),
		}));
	}, [config, channels]);

	const handleSave = async () => {
		setSaving(true);
		try {
			const transcriptChannelId =
				channels.find((ch) => ch.name === formData.TicketTranscripts)?.id ||
				formData.TicketTranscripts;

			const toInt = (v: string) => Math.max(0, parseInt(v, 10) || 0);

			await api.config.update(serverId, {
				...formData,
				TicketTranscripts: transcriptChannelId,
				MaxTicketsPerUser: typeof formData.MaxTicketsPerUser === "string" ? toInt(formData.MaxTicketsPerUser) : formData.MaxTicketsPerUser,
				AutoCloseNoResponseDays: toInt(formData.AutoCloseNoResponseDays),
				AutoCloseNoResponseHours: toInt(formData.AutoCloseNoResponseHours),
				AutoCloseNoResponseMins: toInt(formData.AutoCloseNoResponseMins),
				AutoCloseSinceLastMessageDays: toInt(formData.AutoCloseSinceLastMessageDays),
				AutoCloseSinceLastMessageHours: toInt(formData.AutoCloseSinceLastMessageHours),
				AutoCloseSinceLastMessageMins: toInt(formData.AutoCloseSinceLastMessageMins),
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} catch {
			alert("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const handleNumberInput = (field: keyof FormData, value: string) => {
		// Allow blank (so user can clear) and non-negative integers only
		if (value === "" || /^[0-9]+$/.test(value)) {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}
	};

	if (authLoading || isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="flex flex-col items-center gap-3">
					<div className="h-6 w-6 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
					<p className="text-xs text-zinc-500">Loading settings...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		router.push("/servers");
		return null;
	}

	return (
		<div className="space-y-5 pb-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-2">
				<div>
					<h1 className="text-xl font-black tracking-tight text-white">Server Settings</h1>
					<p className="text-xs text-zinc-500 mt-0.5">Configure how tickets work in this server.</p>
				</div>
				<button
					onClick={handleSave}
					disabled={saving}
					className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-60 ${saved
						? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
						: "bg-[#FF5A36] hover:bg-[#FF6B4A] text-white shadow-[0_0_16px_rgba(255,90,54,0.25)]"
						}`}
				>
					<Save className="h-3.5 w-3.5" />
					{saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
				</button>
			</div>

			{/* Ticket Name Style */}
			<SectionCard
				title="Ticket Name Style"
				description="How ticket channels are named when opened."
			>
				<div className="flex gap-3">
					{[
						{ value: "number", label: "By Number", example: "ticket-1" },
						{ value: "name", label: "By Username", example: "ticket-sush1sui" },
					].map(({ value, label, example }) => (
						<button
							key={value}
							type="button"
							onClick={() => setFormData((p) => ({ ...p, TicketNameStyle: value }))}
							className={`flex-1 rounded-xl border p-4 text-left transition-all duration-150 ${formData.TicketNameStyle === value
								? "border-[#FF5A36]/50 bg-[#FF5A36]/8"
								: "border-zinc-800/60 hover:border-zinc-700/60"
								}`}
						>
							<div className="flex items-center gap-2 mb-1.5">
								<div
									className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.TicketNameStyle === value ? "border-[#FF5A36]" : "border-zinc-600"
										}`}
								>
									{formData.TicketNameStyle === value && (
										<div className="h-1.5 w-1.5 rounded-full bg-[#FF5A36]" />
									)}
								</div>
								<span className="text-sm font-semibold text-zinc-100">{label}</span>
							</div>
							<p className="text-xs font-mono text-zinc-500 pl-5.5">#{example}</p>
						</button>
					))}
				</div>
			</SectionCard>

			{/* Transcript Channel */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{/* Transcript Channel */}
				<SectionCard
					title="Transcript Channel"
					description="Ticket logs are sent here when a ticket is closed."
				>
					<FormLabel label="Channel" hint="Leave blank to disable">
						<DarkCombobox
							value={formData.TicketTranscripts}
							onChange={(v) =>
								setFormData((p) => ({ ...p, TicketTranscripts: v }))
							}
							options={channels
								.filter((ch) => ch.type === 0)
								.map((ch) => ({ value: ch.id, label: ch.name }))}
							placeholder="Search for a channel..."
							className="w-full"
						/>
					</FormLabel>
				</SectionCard>

				{/* Max tickets */}
				<SectionCard
					title="Max Open Tickets Per User"
					description="How many tickets a single user can have open at once."
				>
					<div className="flex flex-col justify-center h-full">
						<FormLabel label="Limit">
							<div className="flex items-center gap-4">
								<DarkInput
									type="number"
									min="1"
									value={formData.MaxTicketsPerUser}
									onChange={(e) => handleNumberInput("MaxTicketsPerUser", e.target.value)}
									onKeyDown={(e) => {
										if (["e", "E", "-", "+", "."].includes(e.key)) e.preventDefault();
									}}
									className="w-24"
								/>
								<p className="text-xs text-zinc-500">
									ticket{formData.MaxTicketsPerUser !== 1 ? "s" : ""} per user
								</p>
							</div>
						</FormLabel>
					</div>
				</SectionCard>
			</div>

			{/* Permissions */}
			<SectionCard
				title="Ticket Permissions"
				description="Extra permissions granted to users inside their ticket channel."
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<DarkCheckbox
						checked={formData.TicketPermissionsAttachFiles}
						onChange={(v) => setFormData((p) => ({ ...p, TicketPermissionsAttachFiles: v }))}
						label="Allow attaching files"
					/>
					<DarkCheckbox
						checked={formData.TicketPermissionsEmbedLinks}
						onChange={(v) => setFormData((p) => ({ ...p, TicketPermissionsEmbedLinks: v }))}
						label="Allow embedding links"
					/>
					<DarkCheckbox
						checked={formData.TicketPermissionsAddReactions}
						onChange={(v) => setFormData((p) => ({ ...p, TicketPermissionsAddReactions: v }))}
						label="Allow adding reactions"
					/>
				</div>
			</SectionCard>

			{/* Auto Close */}
			<SectionCard
				title="Auto-Close"
				description="Automatically close tickets based on inactivity."
			>
				<div className="space-y-5">
					<DarkToggle
						checked={formData.AutoClose}
						onChange={(v) => setFormData((p) => ({ ...p, AutoClose: v }))}
						label="Enable Auto-Close"
						description="Tickets will close automatically based on the rules below."
					/>

					{formData.AutoClose && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800/50">
							<div className="md:col-span-2 py-1">
								<DarkCheckbox
									checked={formData.AutoCloseOnUserLeave}
									onChange={(v) =>
										setFormData((p) => ({ ...p, AutoCloseOnUserLeave: v }))
									}
									label="Close when the user leaves the server"
								/>
							</div>

							<div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 space-y-4">
								<div>
									<h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
										No Response Since Opening
									</h4>
									<p className="text-[11px] text-zinc-500 mt-0.5">
										Close ticket if creator does not send any message after opening.
									</p>
								</div>
								<div className="flex items-center gap-3">
									<TimeInput
										days={formData.AutoCloseNoResponseDays}
										hours={formData.AutoCloseNoResponseHours}
										mins={formData.AutoCloseNoResponseMins}
										onChangeDays={(e) =>
											handleNumberInput("AutoCloseNoResponseDays", e.target.value)
										}
										onChangeHours={(e) =>
											handleNumberInput("AutoCloseNoResponseHours", e.target.value)
										}
										onChangeMins={(e) =>
											handleNumberInput("AutoCloseNoResponseMins", e.target.value)
										}
									/>
								</div>
							</div>

							<div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 space-y-4">
								<div>
									<h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
										Inactivity Timeout
									</h4>
									<p className="text-[11px] text-zinc-500 mt-0.5">
										Close ticket if no new messages are sent for this duration.
									</p>
								</div>
								<div className="flex items-center gap-3">
									<TimeInput
										days={formData.AutoCloseSinceLastMessageDays}
										hours={formData.AutoCloseSinceLastMessageHours}
										mins={formData.AutoCloseSinceLastMessageMins}
										onChangeDays={(e) =>
											handleNumberInput("AutoCloseSinceLastMessageDays", e.target.value)
										}
										onChangeHours={(e) =>
											handleNumberInput("AutoCloseSinceLastMessageHours", e.target.value)
										}
										onChangeMins={(e) =>
											handleNumberInput("AutoCloseSinceLastMessageMins", e.target.value)
										}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</SectionCard>
		</div>
	);
}
