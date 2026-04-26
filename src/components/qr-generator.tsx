'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import type { QRInstance } from '@/lib/qr';
import { getCanvasPNGBlob } from '@/lib/qr';
import { WifiForm } from './wifi-form';
import { QRCustomizer } from './qr-customizer';
import { QRPreview } from './qr-preview';
import { QRLabel, QRLabelDisplay } from './qr-label';
import { ExportControls } from './export-controls';
import { PrintView } from './print-view';
import { Collapsible } from './collapsible';

export function QRGenerator() {
	const qrRef = useRef<QRInstance | null>(null);
	const [logo, setLogo] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const [printDataUrl, setPrintDataUrl] = useState('');

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
		setMounted(true);
	}, []);

	// Generate a high-res PNG data URL from the QR instance for print use.
	// SVG blob URLs render correctly on screen but many printer drivers fail
	// to rasterize them, producing a solid black block. A PNG avoids this.
	const updatePrintImage = useCallback(async () => {
		const instance = qrRef.current;
		if (!instance) return;

		const blob = await getCanvasPNGBlob(instance);
		if (!blob) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			const dataUrl = reader.result as string;
			setPrintDataUrl((prev) => {
				if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
				return dataUrl;
			});
		};
		reader.readAsDataURL(blob);
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
							<QRCustomizer logo={logo} onLogoChange={setLogo} />
						</Collapsible>

						<Collapsible title="Save & Share" defaultOpen>
							<ExportControls qrRef={qrRef} ssid={params.ssid} />
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
