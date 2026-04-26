import { ImageResponse } from 'next/og';
import { renderSVG } from 'uqr';
import { buildWifiString, escapeWifiValue } from '@/lib/wifi';
import type { NextRequest } from 'next/server';


const EC_LEVELS = ['L', 'M', 'Q', 'H'] as const;
type ECLevel = (typeof EC_LEVELS)[number];

function isValidECLevel(v: string): v is ECLevel {
	return EC_LEVELS.includes(v as ECLevel);
}

function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}

function isValidHexColor(color: string): boolean {
	return /^#[0-9a-fA-F]{6}$/.test(color);
}

export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;

	const ssid = params.get('ssid') ?? '';
	const password = params.get('password') ?? '';
	const encryption = params.get('encryption') ?? 'WPA';
	const hidden = params.get('hidden') === 'true';
	const ecLevel = params.get('ecLevel') ?? 'M';
	const sizeParam = params.get('size') ?? '400';
	const fgColor = params.get('fgColor') ?? '#000000';
	const bgColor = params.get('bgColor') ?? '#ffffff';
	const label = params.get('label') ?? '';
	const format = params.get('format') ?? 'png';

	// Validate
	if (!ssid) {
		return new Response('Missing required parameter: ssid', { status: 400 });
	}

	if (!['WPA', 'WEP', 'nopass'].includes(encryption)) {
		return new Response('Invalid encryption type. Use: WPA, WEP, or nopass', { status: 400 });
	}

	const validECLevel = isValidECLevel(ecLevel) ? ecLevel : 'M';
	const size = clamp(Number(sizeParam) || 400, 100, 1200);
	const validFg = isValidHexColor(fgColor) ? fgColor : '#000000';
	const validBg = isValidHexColor(bgColor) ? bgColor : '#ffffff';

	const wifiString = buildWifiString({
		ssid,
		password,
		encryptionType: encryption as 'WPA' | 'WEP' | 'nopass',
		hidden,
	});

	// Generate QR SVG using uqr
	const qrSvg = renderSVG(wifiString, {
		ecc: validECLevel,
		border: 2,
	});

	// For SVG format, return raw SVG directly
	if (format === 'svg') {
		// Inject colors into the SVG
		const coloredSvg = qrSvg
			.replace(/fill="black"/g, `fill="${validFg}"`)
			.replace(/fill="white"/g, `fill="${validBg}"`);

		return new Response(coloredSvg, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=86400, s-maxage=86400',
			},
		});
	}

	// For PNG, use ImageResponse to render QR + optional label
	const qrSize = label ? size - 40 : size;
	const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
		qrSvg.replace(/fill="black"/g, `fill="${validFg}"`).replace(/fill="white"/g, `fill="${validBg}"`)
	)}`;

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
				height: '100%',
				backgroundColor: validBg,
				padding: '16px',
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={svgDataUrl} width={qrSize} height={qrSize} alt="QR Code" />
			{label && (
				<div
					style={{
						marginTop: '8px',
						fontSize: '20px',
						fontWeight: 600,
						color: validFg,
						textAlign: 'center',
					}}
				>
					{label}
				</div>
			)}
		</div>,
		{
			width: size,
			height: size + (label ? 40 : 0),
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400',
			},
		}
	);
}
