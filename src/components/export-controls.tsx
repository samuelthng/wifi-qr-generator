'use client';

import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { downloadQR, type QRInstance } from '@/lib/qr';
import { PRINT_LAYOUTS } from '@/lib/constants';
import { useState, useMemo } from 'react';
import type { ShareUrlResult } from '@/hooks/useCompressedParams';

interface ExportControlsProps {
	qrRef: React.RefObject<QRInstance | null>;
	ssid: string;
	logo: string | null;
	getShareUrl: (logo: string | null) => Promise<ShareUrlResult>;
}

export function ExportControls({ qrRef, ssid, logo, getShareUrl }: ExportControlsProps) {
	const [copied, setCopied] = useState(false);
	const [embedCopied, setEmbedCopied] = useState(false);
	const [logoInShareLink, setLogoInShareLink] = useState<boolean | null>(null);
	const [params, setParams] = useQueryStates(
		{
			printLayout: qrParsers.printLayout,
			printPassword: qrParsers.printPassword,
			size: qrParsers.size,
			password: qrParsers.password,
			encryption: qrParsers.encryption,
			hidden: qrParsers.hidden,
			ecLevel: qrParsers.ecLevel,
			fgColor: qrParsers.fgColor,
			bgColor: qrParsers.bgColor,
			label: qrParsers.label,
		},
		{ shallow: false }
	);

	const filename = ssid ? `wifi-${ssid.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}` : 'wifi-qr';

	const embedUrl = useMemo(() => {
		if (!ssid) return '';
		const p = new URLSearchParams();
		p.set('ssid', ssid);
		if (params.password) p.set('password', params.password);
		if (params.encryption !== 'WPA') p.set('encryption', params.encryption);
		if (params.hidden) p.set('hidden', 'true');
		if (params.ecLevel !== 'M') p.set('ecLevel', params.ecLevel);
		if (params.fgColor !== '#000000') p.set('fgColor', params.fgColor);
		if (params.bgColor !== '#ffffff') p.set('bgColor', params.bgColor);
		if (params.label) p.set('label', params.label);
		p.set('size', String(params.size));
		return `/api/qr?${p.toString()}`;
	}, [ssid, params]);

	async function handleDownload(format: 'svg' | 'png') {
		if (!qrRef.current) return;
		await downloadQR(qrRef.current, format, filename, format === 'png' ? params.size : undefined);
	}

	async function handleCopyUrl() {
		const { url, logoIncluded } = await getShareUrl(logo);
		await navigator.clipboard.writeText(url);
		setLogoInShareLink(logo ? logoIncluded : null);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	function handlePrint() {
		window.print();
	}

	return (
		<div className="space-y-4 print:hidden">
			{/* Primary actions: Download */}
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={() => handleDownload('png')}
					disabled={!ssid}
					className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					Save as PNG
				</button>
				<button
					type="button"
					onClick={() => handleDownload('svg')}
					disabled={!ssid}
					className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-zinc-700"
				>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
					Save as SVG
				</button>
			</div>

			{/* Secondary actions: Print & Share */}
			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={handlePrint}
					disabled={!ssid}
					className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
				>
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
						/>
					</svg>
					Print
				</button>
				<button
					type="button"
					onClick={handleCopyUrl}
					className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
				>
					{copied ? (
						<>
							<svg
								className="h-4 w-4 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							Copied!
						</>
					) : (
						<>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
							</svg>
							Copy Link
						</>
					)}
				</button>
			</div>

			{/* Print options */}
			<div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
				<div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
					Print Options
				</div>

				<div className="flex items-center gap-3">
					<label className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Layout:</label>
					<div className="flex gap-1">
						{PRINT_LAYOUTS.map((layout) => (
							<button
								key={layout.value}
								type="button"
								onClick={() => setParams({ printLayout: layout.value })}
								className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
									params.printLayout === layout.value
										? 'bg-blue-600 text-white'
										: 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
								}`}
							>
								{layout.label}
							</button>
						))}
					</div>
				</div>

				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={params.printPassword}
						onChange={(e) => setParams({ printPassword: e.target.checked })}
						className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
					/>
					<span className="text-xs text-zinc-600 dark:text-zinc-400">Include password on printout</span>
				</label>
			</div>

			{/* Embed URL */}
			{ssid && (
				<div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
					<div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
						Embed Image
					</div>
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						Use this URL to embed the QR image in chats, docs, or social media.
					</p>
					<div className="flex gap-1.5">
						<input
							type="text"
							readOnly
							value={typeof window !== 'undefined' ? `${window.location.origin}${embedUrl}` : embedUrl}
							className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-xs font-mono text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 select-all"
							onFocus={(e) => e.target.select()}
						/>
						<button
							type="button"
							onClick={async () => {
								const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${embedUrl}` : embedUrl;
								await navigator.clipboard.writeText(fullUrl);
								setEmbedCopied(true);
								setTimeout(() => setEmbedCopied(false), 2000);
							}}
							className="shrink-0 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
						>
							{embedCopied ? 'Copied!' : 'Copy'}
						</button>
					</div>
				</div>
			)}

			{/* Sharing notes */}
			{ssid && (
				<div className="space-y-1">
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						Shared links are compressed and obfuscated — the password is not visible in plain text.
					</p>
					{logo && logoInShareLink === false && (
						<p className="text-xs text-amber-600 dark:text-amber-400">
							Logo not included in the share link (image too large). The logo is saved locally in your browser.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
