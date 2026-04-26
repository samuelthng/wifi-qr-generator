import { Suspense } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QRGenerator } from '@/components/qr-generator';
import type { Metadata } from 'next';

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
	const params = await searchParams;
	const ssid = typeof params.ssid === 'string' ? params.ssid : '';

	if (!ssid) return {};

	// Build the API URL for the OG image
	const ogParams = new URLSearchParams();
	ogParams.set('ssid', ssid);
	if (typeof params.password === 'string') ogParams.set('password', params.password);
	if (typeof params.encryption === 'string') ogParams.set('encryption', params.encryption);
	if (typeof params.hidden === 'string') ogParams.set('hidden', params.hidden);
	if (typeof params.ecLevel === 'string') ogParams.set('ecLevel', params.ecLevel);
	if (typeof params.label === 'string') ogParams.set('label', params.label);
	if (typeof params.fgColor === 'string') ogParams.set('fgColor', params.fgColor);
	if (typeof params.bgColor === 'string') ogParams.set('bgColor', params.bgColor);
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
