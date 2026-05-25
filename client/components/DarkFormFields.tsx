"use client";

import { useState, useMemo } from "react";
import { ChevronDown, X, Search, Check } from "lucide-react";

// ── Shared base classes ─────────────────────────────────────────────────────
const inputBase =
	"w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#FF5A36]/50 focus:ring-1 focus:ring-[#FF5A36]/20 transition-all";

// ── DarkInput ───────────────────────────────────────────────────────────────
export function DarkInput({
	value,
	onChange,
	placeholder,
	list,
	type = "text",
	min,
	onKeyDown,
	className = "",
	readOnly,
	onClick,
}: {
	value: string | number;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	list?: string;
	type?: string;
	min?: string;
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	className?: string;
	readOnly?: boolean;
	onClick?: () => void;
}) {
	return (
		<input
			type={type}
			list={list}
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			min={min}
			readOnly={readOnly}
			onClick={onClick}
			className={`${inputBase} ${readOnly ? "cursor-pointer" : ""} ${className}`}
		/>
	);
}

// ── DarkTextarea ────────────────────────────────────────────────────────────
export function DarkTextarea({
	value,
	onChange,
	placeholder,
	rows = 3,
	className = "",
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	rows?: number;
	className?: string;
}) {
	return (
		<textarea
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			rows={rows}
			className={`${inputBase} resize-none leading-relaxed ${className}`}
		/>
	);
}

// ── DarkSelect ──────────────────────────────────────────────────────────────
export function DarkSelect({
	value,
	onChange,
	options,
	placeholder = "Select...",
}: {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	placeholder?: string;
}) {
	const [open, setOpen] = useState(false);
	const selected = options.find((o) => o.value === value);

	return (
		<div className={`relative ${open ? "z-30" : ""}`}>
			<button
				type="button"
				onClick={() => setOpen((p) => !p)}
				className="w-full flex items-center justify-between gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-left transition-all hover:border-zinc-700/80 focus:outline-none focus:border-[#FF5A36]/50 focus:ring-1 focus:ring-[#FF5A36]/20"
			>
				<span className={selected ? "text-zinc-100" : "text-zinc-600"}>
					{selected?.label ?? placeholder}
				</span>
				<ChevronDown
					className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<>
					{/* Backdrop */}
					<div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
					<div className="absolute z-20 mt-1.5 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
						<div className="max-h-52 overflow-y-auto py-1">
							{options.map((opt) => (
								<button
									key={opt.value}
									type="button"
									onClick={() => {
										onChange(opt.value);
										setOpen(false);
									}}
									className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
										opt.value === value
											? "text-white bg-[#FF5A36]/10"
											: "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
									}`}
								>
									{opt.label}
									{opt.value === value && (
										<Check className="h-3.5 w-3.5 text-[#FF5A36] shrink-0" />
									)}
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

// ── DarkCombobox ─────────────────────────────────────────────────────────────
// Searchable + typeable input with custom styled dropdown (replaces datalist)
export function DarkCombobox({
	value,
	onChange,
	options,
	placeholder = "Search...",
	className = "",
}: {
	value: string;
	onChange: (value: string) => void;
	options: { value: string; label: string }[];
	placeholder?: string;
	className?: string;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		if (!q) return options.slice(0, 20);
		return options
			.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
			.slice(0, 20);
	}, [options, query]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
		onChange(e.target.value);
		setOpen(true);
	};

	const handleSelect = (opt: { value: string; label: string }) => {
		onChange(opt.label);
		setQuery("");
		setOpen(false);
	};

	return (
		<div className={`relative ${open ? "z-30" : ""} ${className}`}>
			<div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2.5 transition-all focus-within:border-[#FF5A36]/50 focus-within:ring-1 focus-within:ring-[#FF5A36]/20">
				<Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
				<input
					type="text"
					value={query || value}
					onChange={handleChange}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 150)}
					placeholder={placeholder}
					className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
				/>
				{(query || value) && (
					<button
						type="button"
						onClick={() => { onChange(""); setQuery(""); }}
						className="text-zinc-600 hover:text-zinc-400 transition-colors"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
			</div>

			{open && filtered.length > 0 && (
				<div className="absolute z-20 mt-1.5 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
					<div className="max-h-52 overflow-y-auto py-1">
						{filtered.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onMouseDown={() => handleSelect(opt)}
								className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
									opt.label === value
										? "text-white bg-[#FF5A36]/10"
										: "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
								}`}
							>
								<span className="flex items-center gap-2">
									<span className="text-zinc-500">#</span>
									{opt.label}
								</span>
								{opt.label === value && (
									<Check className="h-3.5 w-3.5 text-[#FF5A36] shrink-0" />
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}



// ── DarkMultiRolePicker ─────────────────────────────────────────────────────
// Replaces the old checkbox-list-in-a-scrollable-div for role multi-select
export function DarkMultiRolePicker({
	roles,
	selectedIds,
	onToggle,
}: {
	roles: { id: string; name: string; color?: number }[];
	selectedIds: string[];
	onToggle: (id: string) => void;
}) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		return roles.filter((r) => r.name.toLowerCase().includes(q));
	}, [roles, query]);

	const selectedRoles = roles.filter((r) => selectedIds.includes(r.id));

	return (
		<div className="space-y-2.5">
			{/* Selected chips */}
			{selectedRoles.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{selectedRoles.map((role) => {
						const hex = role.color
							? `#${role.color.toString(16).padStart(6, "0")}`
							: "#52525b";
						return (
							<span
								key={role.id}
								className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 text-xs font-semibold"
								style={{ color: hex }}
							>
								<span
									className="h-2 w-2 rounded-full shrink-0"
									style={{ backgroundColor: hex }}
								/>
								@{role.name}
								<button
									type="button"
									onClick={() => onToggle(role.id)}
									className="ml-0.5 text-zinc-500 hover:text-zinc-200 transition-colors"
								>
									<X className="h-3 w-3" />
								</button>
							</span>
						);
					})}
				</div>
			)}

			{/* Trigger */}
			<div className={`relative ${open ? "z-30" : ""}`}>
				<button
					type="button"
					onClick={() => setOpen((p) => !p)}
					className="w-full flex items-center justify-between gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-left transition-all hover:border-zinc-700/80 focus:outline-none focus:border-[#FF5A36]/50 focus:ring-1 focus:ring-[#FF5A36]/20"
				>
					<span className="text-zinc-600">
						{selectedIds.length === 0
							? "Select roles..."
							: `${selectedIds.length} role${selectedIds.length > 1 ? "s" : ""} selected`}
					</span>
					<ChevronDown
						className={`h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
					/>
				</button>

				{open && (
					<>
						<div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
						<div className="absolute z-20 mt-1.5 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
							{/* Search */}
							<div className="flex items-center gap-2 border-b border-zinc-800/60 px-3 py-2">
								<Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
								<input
									type="text"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									placeholder="Search roles..."
									className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
									autoFocus
								/>
							</div>
							<div className="max-h-52 overflow-y-auto py-1">
								{filtered.length === 0 ? (
									<p className="px-3 py-2.5 text-xs text-zinc-600">No roles found.</p>
								) : (
									filtered.map((role) => {
										const checked = selectedIds.includes(role.id);
										const hex = role.color
											? `#${role.color.toString(16).padStart(6, "0")}`
											: "#52525b";
										return (
											<button
												key={role.id}
												type="button"
												onClick={() => onToggle(role.id)}
												className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-zinc-800/60"
											>
												<span
													className="h-2.5 w-2.5 rounded-full shrink-0"
													style={{ backgroundColor: hex }}
												/>
												<span className="flex-1 text-left text-zinc-200">
													@{role.name}
												</span>
												{checked && (
													<Check className="h-3.5 w-3.5 text-[#FF5A36] shrink-0" />
												)}
											</button>
										);
									})
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

// ── DarkSearchDropdown (staff member/role search) ───────────────────────────
export type DropdownItem = {
	id: string;
	label: string;
	sublabel?: string;
	color?: number;
	avatarUrl?: string;
};

export function DarkSearchDropdown({
	items,
	selectedIds,
	onSelect,
	placeholder,
}: {
	items: DropdownItem[];
	selectedIds: Set<string>;
	onSelect: (id: string) => void;
	placeholder: string;
}) {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		return items
			.filter((item) => !selectedIds.has(item.id))
			.filter((item) => {
				if (!q) return true;
				return (
					item.label.toLowerCase().includes(q) ||
					item.sublabel?.toLowerCase().includes(q)
				);
			})
			.slice(0, 12);
	}, [items, query, selectedIds]);

	return (
		<div className={`relative ${open ? "z-30" : ""}`}>
			<div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-2.5 transition-all focus-within:border-[#FF5A36]/50 focus-within:ring-1 focus-within:ring-[#FF5A36]/20">
				<Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
				<input
					type="text"
					value={query}
					onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 150)}
					placeholder={placeholder}
					className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
				/>
			</div>

			{open && filtered.length > 0 && (
				<div className="absolute z-20 mt-1.5 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden">
					<div className="max-h-56 overflow-y-auto py-1">
						{filtered.map((item) => {
							const hex = item.color
								? `#${item.color.toString(16).padStart(6, "0")}`
								: undefined;
							return (
								<button
									key={item.id}
									type="button"
									onMouseDown={() => {
										onSelect(item.id);
										setQuery("");
										setOpen(false);
									}}
									className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors hover:bg-zinc-800/60"
								>
									{item.avatarUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={item.avatarUrl}
											alt=""
											className="h-6 w-6 shrink-0 rounded-full ring-1 ring-zinc-700/50"
										/>
									) : hex ? (
										<span
											className="h-3 w-3 shrink-0 rounded-full border border-zinc-700/50"
											style={{ backgroundColor: hex }}
										/>
									) : null}
									<span className="flex-1 truncate text-zinc-200">{item.label}</span>
									{item.sublabel && (
										<span className="truncate text-xs text-zinc-600">
											{item.sublabel}
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

// ── DarkChipList ────────────────────────────────────────────────────────────
export function DarkChipList({
	items,
	onRemove,
	emptyMessage,
}: {
	items: DropdownItem[];
	onRemove: (id: string) => void;
	emptyMessage: string;
}) {
	if (items.length === 0) {
		return (
			<p className="py-5 text-center text-xs text-zinc-600">{emptyMessage}</p>
		);
	}

	return (
		<div className="space-y-1.5">
			{items.map((item) => {
				const hex = item.color
					? `#${item.color.toString(16).padStart(6, "0")}`
					: undefined;
				return (
					<div
						key={item.id}
						className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-3 py-2.5"
					>
						{/* Avatar or color swatch */}
						{item.avatarUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={item.avatarUrl}
								alt=""
								className="h-6 w-6 shrink-0 rounded-full ring-1 ring-zinc-700/50"
							/>
						) : hex ? (
							<span
								className="h-3 w-3 shrink-0 rounded-full border border-zinc-700/50"
								style={{ backgroundColor: hex }}
							/>
						) : null}
						{/* Label + sublabel — left aligned, fills remaining space */}
						<span className="flex-1 text-sm font-medium text-zinc-200 truncate">
							{item.label}
						</span>
						{item.sublabel && (
							<span className="shrink-0 text-xs text-zinc-500 font-mono">
								{item.sublabel}
							</span>
						)}
						{/* Remove button */}
						<button
							type="button"
							onClick={() => onRemove(item.id)}
							className="shrink-0 rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-300 transition-all"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				);
			})}
		</div>
	);
}

// ── DarkToggle ──────────────────────────────────────────────────────────────
export function DarkToggle({
	checked,
	onChange,
	label,
	description,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
	description?: string;
}) {
	return (
		<label className="flex items-start gap-3 cursor-pointer group">
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/30 ${
					checked ? "bg-[#FF5A36]" : "bg-zinc-700"
				}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
						checked ? "translate-x-4" : "translate-x-0"
					}`}
				/>
			</button>
			<div>
				<p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
					{label}
				</p>
				{description && (
					<p className="text-xs text-zinc-500 mt-0.5">{description}</p>
				)}
			</div>
		</label>
	);
}

// ── DarkCheckbox ────────────────────────────────────────────────────────────
export function DarkCheckbox({
	checked,
	onChange,
	label,
	description,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
	description?: string;
}) {
	return (
		<label className="flex items-start gap-2.5 cursor-pointer group">
			<button
				type="button"
				role="checkbox"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`mt-0.5 shrink-0 rounded border transition-all duration-150 flex items-center justify-center ${
					checked
						? "bg-[#FF5A36] border-[#FF5A36]"
						: "bg-zinc-900 border-zinc-700 group-hover:border-zinc-500"
				}`}
				style={{ height: "1.125rem", width: "1.125rem" }}
			>
				{checked && (
					<Check className="h-3 w-3 text-white" strokeWidth={3} />
				)}
			</button>
			<div>
				<span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
					{label}
				</span>
				{description && (
					<p className="text-xs text-zinc-500 mt-0.5">{description}</p>
				)}
			</div>
		</label>
	);
}

// ── SectionCard ─────────────────────────────────────────────────────────────
export function SectionCard({
	title,
	description,
	children,
	action,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	action?: React.ReactNode;
}) {
	return (
		<div className="relative z-10 rounded-xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-sm transition-all focus-within:z-20">
			<div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-800/50 rounded-t-xl bg-zinc-900/20">
				<div>
					<h2 className="text-sm font-bold text-zinc-100">{title}</h2>
					{description && (
						<p className="text-xs text-zinc-500 mt-0.5">{description}</p>
					)}
				</div>
				{action && <div className="shrink-0">{action}</div>}
			</div>
			<div className="p-5">{children}</div>
		</div>
	);
}

// ── FormLabel ───────────────────────────────────────────────────────────────
export function FormLabel({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-baseline justify-between">
				<label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
					{label}
				</label>
				{hint && <span className="text-xs text-zinc-600">{hint}</span>}
			</div>
			{children}
		</div>
	);
}
