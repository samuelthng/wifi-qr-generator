import { Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QRGenerator } from '@/components/qr-generator';
import { decodeState } from '@/lib/codec';
import type { Metadata } from 'next';

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const params = await searchParams;

	let ssid: string;
	let password: string | undefined;
	let encryption: string | undefined;
	let hidden: string | undefined;
	let ecLevel: string | undefined;
	let label: string | undefined;
	let fgColor: string | undefined;
	let bgColor: string | undefined;

	// Decode compressed ?q= payload when present; fall back to individual params.
	const q = typeof params.q === 'string' ? params.q : null;
	if (q) {
		const state = await decodeState(q);
		ssid = state.ssid ?? '';
		if (!ssid) return {};
		password = state.password;
		encryption = state.encryption;
		hidden = state.hidden != null ? String(state.hidden) : undefined;
		ecLevel = state.ecLevel;
		label = state.label;
		fgColor = state.fgColor;
		bgColor = state.bgColor;
	} else {
		ssid = typeof params.ssid === 'string' ? params.ssid : '';
		if (!ssid) return {};
		password = typeof params.password === 'string' ? params.password : undefined;
		encryption = typeof params.encryption === 'string' ? params.encryption : undefined;
		hidden = typeof params.hidden === 'string' ? params.hidden : undefined;
		ecLevel = typeof params.ecLevel === 'string' ? params.ecLevel : undefined;
		label = typeof params.label === 'string' ? params.label : undefined;
		fgColor = typeof params.fgColor === 'string' ? params.fgColor : undefined;
		bgColor = typeof params.bgColor === 'string' ? params.bgColor : undefined;
	}

	// Build the API URL for the OG image
	const ogParams = new URLSearchParams();
	ogParams.set('ssid', ssid);
	if (password) ogParams.set('password', password);
	if (encryption) ogParams.set('encryption', encryption);
	if (hidden) ogParams.set('hidden', hidden);
	if (ecLevel) ogParams.set('ecLevel', ecLevel);
	if (label) ogParams.set('label', label);
	if (fgColor) ogParams.set('fgColor', fgColor);
	if (bgColor) ogParams.set('bgColor', bgColor);
	ogParams.set('size', '600');

	return {
		openGraph: {
			title: `WiFi QR: ${ssid}`,
			description: `Scan to connect to "${ssid}"`,
			images: [`/api/qr?${ogParams.toString()}`],
		},
	};
}

export default function Home() {
	return (
		<NuqsAdapter>
			<div className="flex flex-col flex-1 font-sans">
				<header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 print:hidden">
					<div className="mx-auto max-w-5xl px-4 py-4">
						<h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">WiFi QR Code Generator</h1>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">Create styled QR codes for your WiFi network</p>
					</div>
				</header>

				<main className="flex-1">
					<Suspense
						fallback={
							<div className="flex items-center justify-center py-20">
								<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
							</div>
						}
					>
						<QRGenerator />
					</Suspense>
				</main>

				<footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 print:hidden">
					<div className="mx-auto max-w-5xl px-4 py-3 text-center text-xs text-zinc-400">
						WiFi QR codes use the standard WIFI: format supported by iOS and Android cameras.
					</div>
				</footer>
			</div>
		</NuqsAdapter>
	);
}
