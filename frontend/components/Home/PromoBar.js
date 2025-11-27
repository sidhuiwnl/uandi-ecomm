"use client";

import React, { useState } from "react";

export default function PromoBar({
	headline = "Launch Offer",
	subtext = "50% OFF on all products",
	code = "LAUNCH50",
}) {
	const [visible, setVisible] = useState(true);

	if (!visible) return null;

	return (
		<div
			role="region"
			aria-label="Promotional banner"
			className="w-full bg-linear-to-r from-[#D8234B] to-[#FFD3D5] text-white py-2 px-4 text-sm md:text-base flex items-center justify-center relative"
		>
			<div className="flex items-center gap-3 flex-wrap justify-center">
				<span className="font-semibold drop-shadow-sm">
					{headline}
				</span>
				<span className="opacity-90" aria-hidden>
					|
				</span>
				<span className="opacity-95">
					{subtext}
				</span>
				{/* <span className="opacity-90" aria-hidden>
					|
				</span> */}
				{/* <span className="opacity-95">
					Use code <strong className="uppercase tracking-wide">{code}</strong>
				</span> */}
			</div>

			<button
				onClick={() => setVisible(false)}
				aria-label="Close promotional banner"
				className="absolute right-2 top-1 text-white bg-transparent text-xl leading-none p-1"
			>
				×
			</button>
		</div>
	);
}
