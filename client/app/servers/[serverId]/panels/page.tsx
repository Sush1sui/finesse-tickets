"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { api } from "../../../../lib/api";
import { useMultiPanels, usePanels } from "../../../../lib/hooks/usePanels";
import {
	Plus,
	Send,
	Pencil,
	Trash2,
	LayoutGrid,
	Layers,
	Hash,
} from "lucide-react";
import { SectionCard } from "../../../../components/DarkFormFields";
import DarkConfirmModal from "../../../../components/DarkConfirmModal";

function PanelRow({
	title,
	channelId,
	onEdit,
	onSend,
	onDelete,
	sending,
	deleting,
}: {
	title: string;
	channelId: string;
	onEdit: () => void;
	onSend: () => void;
	onDelete: () => void;
	sending: boolean;
	deleting: boolean;
}) {
	return (
		<div className="group flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 px-4 py-3.5 hover:border-zinc-700/60 hover:bg-zinc-900/40 transition-all">
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-zinc-100 truncate">{title}</p>
				<div className="flex items-center gap-1 mt-0.5">
					<Hash className="h-3 w-3 text-zinc-600" />
					<p className="text-xs font-mono text-zinc-600 truncate">{channelId}</p>
				</div>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<button
					onClick={onEdit}
					className="flex items-center gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
				>
					<Pencil className="h-3 w-3" />
					Edit
				</button>
				<button
					onClick={onSend}
					disabled={sending}
					className="flex items-center gap-1.5 rounded-lg border border-[#5865F2]/40 bg-[#5865F2]/10 px-2.5 py-1.5 text-xs font-semibold text-[#7289DA] hover:bg-[#5865F2]/20 hover:border-[#5865F2]/60 transition-all disabled:opacity-50"
				>
					<Send className="h-3 w-3" />
					{sending ? "Sending..." : "Send"}
				</button>
				<button
					onClick={onDelete}
					disabled={deleting}
					className="flex items-center gap-1.5 rounded-lg border border-red-900/40 bg-red-950/20 px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-950/40 hover:border-red-800/60 transition-all disabled:opacity-50"
				>
					<Trash2 className="h-3 w-3" />
					{deleting ? "Deleting..." : "Delete"}
				</button>
			</div>
		</div>
	);
}

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

	// State for custom modal
	const [modalOpen, setModalOpen] = useState(false);
	const [modalConfig, setModalConfig] = useState<{
		title: string;
		message: string;
		type: "danger" | "warning" | "info";
		confirmText?: string;
		onConfirm: () => void;
	}>({
		title: "",
		message: "",
		type: "danger",
		onConfirm: () => {},
	});

	const showConfirm = (config: {
		title: string;
		message: string;
		type: "danger" | "warning" | "info";
		confirmText?: string;
		onConfirm: () => void;
	}) => {
		setModalConfig(config);
		setModalOpen(true);
	};

	const handleDelete = (panelId: number) => {
		showConfirm({
			title: "Delete Panel",
			message: "Are you sure you want to permanently delete this panel? This action cannot be undone.",
			type: "danger",
			confirmText: "Delete",
			onConfirm: async () => {
				setDeletingId(panelId);
				try {
					await api.panels.delete(serverId, panelId.toString());
					await refresh();
				} finally {
					setDeletingId(null);
				}
			}
		});
	};

	const handleDeleteMulti = (panelId: number) => {
		showConfirm({
			title: "Delete Multi Panel",
			message: "Are you sure you want to permanently delete this multi panel? This action cannot be undone.",
			type: "danger",
			confirmText: "Delete",
			onConfirm: async () => {
				setDeletingMultiId(panelId);
				try {
					await api.multiPanels.delete(serverId, panelId.toString());
					await refreshMultiPanels();
				} finally {
					setDeletingMultiId(null);
				}
			}
		});
	};

	const handleSend = async (panelId: number) => {
		setSendingId(panelId);
		try {
			await api.panels.send(serverId, panelId.toString());
		} catch (err) {
			console.error(err);
			showConfirm({
				title: "Send Failed",
				message: "Failed to send panel to Discord. Please check your bot configurations or server permissions.",
				type: "warning",
				confirmText: "OK",
				onConfirm: () => {}
			});
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
			showConfirm({
				title: "Send Failed",
				message: "Failed to send multi panel to Discord. Please check your bot configurations or server permissions.",
				type: "warning",
				confirmText: "OK",
				onConfirm: () => {}
			});
		} finally {
			setSendingMultiId(null);
		}
	};

	return (
		<div className="space-y-5 pb-6">
			{/* Page header */}
			<div className="mb-2">
				<h1 className="text-xl font-black tracking-tight text-white">Ticket Panels</h1>
				<p className="text-xs text-zinc-500 mt-0.5">
					Panels are buttons posted in your Discord channels that users click to open tickets.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
				{/* Single Panels */}
				<SectionCard
					title="Single Panels"
					description="One button per panel."
					action={
						<Link
							href={`/servers/${serverId}/panels/create`}
							className="flex items-center gap-1.5 rounded-lg border border-[#FF5A36]/40 bg-[#FF5A36]/10 px-3 py-1.5 text-xs font-bold text-[#FF5A36] hover:bg-[#FF5A36]/20 hover:border-[#FF5A36]/60 transition-all"
						>
							<Plus className="h-3.5 w-3.5" />
							Create
						</Link>
					}
				>
					{panelsLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="h-5 w-5 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
						</div>
					) : panels.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
								<LayoutGrid className="h-5 w-5 text-zinc-600" />
							</div>
							<div>
								<p className="text-sm font-semibold text-zinc-400">No panels yet</p>
								<p className="text-xs text-zinc-600 mt-0.5">Create your first ticket panel.</p>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{panels.map((panel) => (
								<PanelRow
									key={panel.ID}
									title={panel.Title}
									channelId={panel.ChannelID}
									onEdit={() =>
										(window.location.href = `/servers/${serverId}/panels/${panel.ID}/edit`)
									}
									onSend={() => handleSend(panel.ID)}
									onDelete={() => handleDelete(panel.ID)}
									sending={sendingId === panel.ID}
									deleting={deletingId === panel.ID}
								/>
							))}
						</div>
					)}
				</SectionCard>

				{/* Multi Panels */}
				<SectionCard
					title="Multi Panels"
					description="Multiple buttons in one panel."
					action={
						<Link
							href={`/servers/${serverId}/multi-panels/create`}
							className="flex items-center gap-1.5 rounded-lg border border-[#FF5A36]/40 bg-[#FF5A36]/10 px-3 py-1.5 text-xs font-bold text-[#FF5A36] hover:bg-[#FF5A36]/20 hover:border-[#FF5A36]/60 transition-all"
						>
							<Plus className="h-3.5 w-3.5" />
							Create
						</Link>
					}
				>
					{multiPanelsLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="h-5 w-5 rounded-full border-2 border-zinc-700 border-t-[#FF5A36] animate-spin" />
						</div>
					) : multiPanels.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
								<Layers className="h-5 w-5 text-zinc-600" />
							</div>
							<div>
								<p className="text-sm font-semibold text-zinc-400">No multi panels yet</p>
								<p className="text-xs text-zinc-600 mt-0.5">Group multiple ticket types into one panel.</p>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{multiPanels.map((panel) => (
								<PanelRow
									key={panel.ID}
									title={panel.Title}
									channelId={panel.ChannelID}
									onEdit={() =>
										(window.location.href = `/servers/${serverId}/multi-panels/${panel.ID}/edit`)
									}
									onSend={() => handleSendMulti(panel.ID)}
									onDelete={() => handleDeleteMulti(panel.ID)}
									sending={sendingMultiId === panel.ID}
									deleting={deletingMultiId === panel.ID}
								/>
							))}
						</div>
					)}
				</SectionCard>
			</div>

			<DarkConfirmModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				onConfirm={modalConfig.onConfirm}
				title={modalConfig.title}
				message={modalConfig.message}
				confirmText={modalConfig.confirmText}
				type={modalConfig.type}
			/>
		</div>
	);
}
