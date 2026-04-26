'use client';

import { useQueryState } from 'nuqs';
import { qrParsers } from '@/lib/params';

export function QRLabel() {
	const [label, setLabel] = useQueryState('label', qrParsers.label);

	return (
		<div>
			<label htmlFor="qr-label" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
				Label (optional)
			</label>
			<input
				id="qr-label"
				type="text"
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				placeholder="e.g. Guest WiFi"
				className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
			/>
		</div>
	);
}

interface QRLabelDisplayProps {
	label: string;
}

export function QRLabelDisplay({ label }: QRLabelDisplayProps) {
	if (!label) return null;

	return (
		<p className="mt-2 text-center text-lg font-semibold text-zinc-800 dark:text-zinc-200 print:text-black">{label}</p>
	);
}
