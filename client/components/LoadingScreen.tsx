"use client";

import React from "react";

interface LoadingScreenProps {
	text?: string;
}

export default function LoadingScreen({ text = "Rolling Sushi..." }: LoadingScreenProps) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-[#07090E] text-zinc-100 font-sans">
			<div className="relative flex h-16 w-16 items-center justify-center">
				<div className="absolute h-full w-full animate-ping rounded-full bg-[#FF5A36]/20"></div>
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF5A36] border-t-transparent"></div>
			</div>
			<p className="mt-4 text-xs font-semibold tracking-widest text-[#FF5A36]/80 uppercase animate-pulse">
				{text}
			</p>
		</div>
	);
}
