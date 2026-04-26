'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import type { QRInstance } from '@/lib/qr';
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

	const [params] = useQueryStates(
		{
			ssid: qrParsers.ssid,
			label: qrParsers.label,
		},
		{ shallow: false }
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Clone QR SVG into print slots before printing
	const handleBeforePrint = useCallback(() => {
		const slots = document.querySelectorAll('.print-qr-slot');
		const qrContainer = document.querySelector('[data-qr-container]');
		if (!qrContainer) return;

		const svg = qrContainer.querySelector('svg');
		if (!svg) return;

		slots.forEach((slot) => {
			slot.innerHTML = '';
			const clone = svg.cloneNode(true) as SVGElement;
			clone.style.width = '100%';
			clone.style.height = 'auto';
			clone.style.maxWidth = '250px';
			slot.appendChild(clone);
		});
	}, []);

	useEffect(() => {
		window.addEventListener('beforeprint', handleBeforePrint);
		return () => window.removeEventListener('beforeprint', handleBeforePrint);
	}, [handleBeforePrint]);

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
				<PrintView />
			</div>
		</>
	);
}
