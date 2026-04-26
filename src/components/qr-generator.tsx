'use client';

import { useRef, useState, useEffect, useCallback, startTransition } from 'react';
import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import type { QRInstance } from '@/lib/qr';
import { getRawData } from '@/lib/qr';
import { useCompressedParams } from '@/hooks/useCompressedParams';
import { WifiForm } from './wifi-form';
import { QRCustomizer } from './qr-customizer';
import { QRPreview } from './qr-preview';
import { QRLabel, QRLabelDisplay } from './qr-label';
import { ExportControls } from './export-controls';
import { PrintView } from './print-view';
import { Collapsible } from './collapsible';

const LOGO_STORAGE_KEY = 'wifi-qr-logo';

export function QRGenerator() {
	const qrRef = useRef<QRInstance | null>(null);
	const [logo, setLogo] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [printDataUrl, setPrintDataUrl] = useState('');

	// Persist logo to localStorage whenever it changes.
	const handleLogoChange = useCallback((newLogo: string | null) => {
		setLogo(newLogo);
		try {
			if (newLogo) {
				localStorage.setItem(LOGO_STORAGE_KEY, newLogo);
			} else {
				localStorage.removeItem(LOGO_STORAGE_KEY);
			}
		} catch {
			// localStorage may be unavailable in some environments
		}
	}, []);

	const { getShareUrl } = useCompressedParams(handleLogoChange);

	const [params] = useQueryStates(
		{
			ssid: qrParsers.ssid,
			label: qrParsers.label,
			// Include all QR styling params so print image updates when any of them change
			ecLevel: qrParsers.ecLevel,
			dotStyle: qrParsers.dotStyle,
			cornerSquareStyle: qrParsers.cornerSquareStyle,
			cornerDotStyle: qrParsers.cornerDotStyle,
			fgColor: qrParsers.fgColor,
			bgColor: qrParsers.bgColor,
			size: qrParsers.size,
			logoOpaque: qrParsers.logoOpaque,
			logoStrokeWidth: qrParsers.logoStrokeWidth,
		},
		{ shallow: false }
	);

	useEffect(() => {
		// Load logo from localStorage when there is no ?q= in the URL.
		// If ?q= is present, useCompressedParams handles logo restoration asynchronously.
		// startTransition defers this non-urgent external-store sync.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		const searchParams = new URLSearchParams(window.location.search);
		if (!searchParams.has('q')) {
			try {
				const stored = localStorage.getItem(LOGO_STORAGE_KEY);
				if (stored) startTransition(() => setLogo(stored));
			} catch {
				// localStorage may be unavailable in some environments
			}
		}
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	// Generate a data URL from the QR instance for print use
	const updatePrintImage = useCallback(async () => {
		const instance = qrRef.current;
		if (!instance) return;

		const blob = await getRawData(instance, 'svg');
		if (!blob) return;

		const url = URL.createObjectURL(blob);
		setPrintDataUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return url;
		});
	}, []);

	// Re-generate print image whenever QR container changes
	useEffect(() => {
		if (!mounted) return;

		// Poll briefly for QR instance to be ready, then observe for changes
		const interval = setInterval(() => {
			if (qrRef.current) {
				clearInterval(interval);
				updatePrintImage();
			}
		}, 200);

		return () => clearInterval(interval);
	}, [mounted, updatePrintImage]);

	// Also update print image on param/logo changes (after QR update settles)
	useEffect(() => {
		if (!mounted || !qrRef.current) return;
		const timer = setTimeout(updatePrintImage, 800);
		return () => clearTimeout(timer);
	}, [params, logo, mounted, updatePrintImage]);

	if (!mounted) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto w-full max-w-5xl px-4 py-8 print:hidden">
				<div className="grid gap-8 lg:grid-cols-[1fr,auto]">
					{/* Left: Controls */}
					<div className="space-y-3 order-2 lg:order-1">
						<Collapsible title="WiFi Network" defaultOpen>
							<WifiForm />
							<div className="mt-4">
								<QRLabel />
							</div>
						</Collapsible>

						<Collapsible title="QR Style" defaultOpen={false}>
							<QRCustomizer logo={logo} onLogoChange={handleLogoChange} />
						</Collapsible>

						<Collapsible title="Save & Share" defaultOpen>
							<ExportControls qrRef={qrRef} ssid={params.ssid} logo={logo} getShareUrl={getShareUrl} />
						</Collapsible>
					</div>

					{/* Right: Preview */}
					<div className="order-1 lg:order-2 lg:sticky lg:top-8 lg:self-start">
						<div data-qr-container>
							<QRPreview logo={logo} qrRef={qrRef} />
						</div>
						<QRLabelDisplay label={params.label} />
					</div>
				</div>
			</div>

			{/* Print-only view */}
			<div className="print-root">
				<PrintView qrImageUrl={printDataUrl} />
			</div>
		</>
	);
}
