'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { buildWifiString } from '@/lib/wifi';
import { createQRCode, updateQRCode, type QRInstance } from '@/lib/qr';
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling';

interface QRPreviewProps {
	logo: string | null;
	qrRef: React.MutableRefObject<QRInstance | null>;
}

export function QRPreview({ logo, qrRef }: QRPreviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

	const [params] = useQueryStates(
		{
			ssid: qrParsers.ssid,
			password: qrParsers.password,
			encryption: qrParsers.encryption,
			hidden: qrParsers.hidden,
			ecLevel: qrParsers.ecLevel,
			dotStyle: qrParsers.dotStyle,
			cornerSquareStyle: qrParsers.cornerSquareStyle,
			cornerDotStyle: qrParsers.cornerDotStyle,
			fgColor: qrParsers.fgColor,
			bgColor: qrParsers.bgColor,
			size: qrParsers.size,
		},
		{ shallow: false }
	);

	const getQROptions = useCallback(() => {
		const data = params.ssid
			? buildWifiString({
					ssid: params.ssid,
					password: params.password,
					encryptionType: params.encryption,
					hidden: params.hidden,
				})
			: 'WIFI:T:WPA;S:Example;P:password;;';

		return {
			data,
			width: params.size,
			height: params.size,
			type: 'svg' as const,
			margin: 16,
			dotsOptions: {
				type: params.dotStyle as DotType,
				color: params.fgColor,
			},
			cornersSquareOptions: params.cornerSquareStyle
				? {
						type: params.cornerSquareStyle as CornerSquareType,
						color: params.fgColor,
					}
				: { color: params.fgColor },
			cornersDotOptions: params.cornerDotStyle
				? {
						type: params.cornerDotStyle as CornerDotType,
						color: params.fgColor,
					}
				: { color: params.fgColor },
			backgroundOptions: {
				color: params.bgColor,
			},
			qrOptions: {
				errorCorrectionLevel: params.ecLevel,
			},
			imageOptions: {
				crossOrigin: 'anonymous' as const,
				margin: 8,
				imageSize: 0.35,
			},
			...(logo ? { image: logo } : { image: undefined }),
		};
	}, [params, logo]);

	// Initialize QR code
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let cancelled = false;

		createQRCode(getQROptions()).then((instance) => {
			if (cancelled) return;
			qrRef.current = instance;
			container.innerHTML = '';
			instance.append(container);
		});

		return () => {
			cancelled = true;
		};
		// Only run on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Update QR code on param changes
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			if (qrRef.current) {
				updateQRCode(qrRef.current, getQROptions());
			}
		}, 150);

		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [getQROptions, qrRef]);

	return (
		<div className="flex flex-col items-center gap-4">
			<div
				ref={containerRef}
				className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
				style={{ minWidth: params.size + 64, minHeight: params.size + 64 }}
			/>
			{!params.ssid && (
				<p className="text-sm text-zinc-400 dark:text-zinc-500 italic">Enter a network name to generate a QR code</p>
			)}
		</div>
	);
}
