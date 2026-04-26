'use client';

import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { PRINT_LAYOUTS, ENCRYPTION_TYPES } from '@/lib/constants';

interface PrintViewProps {
	qrImageUrl: string;
}

function PrintCardInfo({
	ssid,
	label,
	encLabel,
	password,
	printPassword,
	compact,
}: {
	ssid: string;
	label: string;
	encLabel: string;
	password: string;
	printPassword: boolean;
	compact?: boolean;
}) {
	const iconSize = compact ? '14' : '20';

	return (
		<div
			style={{
				marginTop: compact ? '1.5mm' : '4mm',
				textAlign: 'center',
				color: '#222',
				width: '100%',
			}}
		>
			{/* "Scan to connect" header with WiFi icon */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: compact ? '1mm' : '2mm',
					marginBottom: compact ? '1mm' : '3mm',
				}}
			>
				<svg
					width={iconSize}
					height={iconSize}
					viewBox="0 0 24 20"
					fill="none"
					stroke="#555"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					style={{ flexShrink: 0 }}
				>
					<path d="M1.42 5a16 16 0 0 1 21.16 0" />
					<path d="M5 8.55a11 11 0 0 1 14.08 0" />
					<path d="M8.53 12.11a6 6 0 0 1 6.95 0" />
					<circle cx="12" cy="16" r="1" fill="#555" />
				</svg>
				<span
					style={{
						fontSize: compact ? '7pt' : '9pt',
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						color: '#666',
					}}
				>
					Scan to connect
				</span>
			</div>

			{/* Label (custom name like "Guest WiFi") */}
			{label && (
				<p
					style={{
						fontSize: compact ? '10pt' : '14pt',
						fontWeight: 700,
						margin: `0 0 ${compact ? '0.5mm' : '1.5mm'}`,
						color: '#111',
					}}
				>
					{label}
				</p>
			)}

			{/* Divider line */}
			<div
				style={{
					width: compact ? '20mm' : '40mm',
					height: '0.5px',
					background: '#ddd',
					margin: `${compact ? '1mm' : '2mm'} auto`,
				}}
			/>

			{/* Network details in a structured layout */}
			<div
				style={{
					display: 'inline-block',
					textAlign: 'left',
					fontSize: compact ? '7pt' : '9.5pt',
					lineHeight: 1.6,
					color: '#444',
				}}
			>
				<div style={{ display: 'flex', gap: compact ? '1.5mm' : '3mm' }}>
					<span style={{ color: '#999', fontWeight: 500 }}>Network</span>
					<span style={{ fontWeight: 600, color: '#222' }}>{ssid}</span>
				</div>
				{!compact && (
					<div style={{ display: 'flex', gap: '3mm' }}>
						<span style={{ color: '#999', fontWeight: 500 }}>Security</span>
						<span>{encLabel}</span>
					</div>
				)}
				{printPassword && password && (
					<div style={{ display: 'flex', gap: compact ? '1.5mm' : '3mm' }}>
						<span style={{ color: '#999', fontWeight: 500 }}>Password</span>
						<span style={{ fontFamily: 'monospace', letterSpacing: '0.03em' }}>{password}</span>
					</div>
				)}
			</div>
		</div>
	);
}

export function PrintView({ qrImageUrl }: PrintViewProps) {
	const [params] = useQueryStates(
		{
			ssid: qrParsers.ssid,
			password: qrParsers.password,
			encryption: qrParsers.encryption,
			label: qrParsers.label,
			printLayout: qrParsers.printLayout,
			printPassword: qrParsers.printPassword,
		},
		{ shallow: false }
	);

	const layout = PRINT_LAYOUTS.find((l) => l.value === params.printLayout) ?? PRINT_LAYOUTS[0];
	const encLabel = ENCRYPTION_TYPES.find((e) => e.value === params.encryption)?.label ?? params.encryption;
	const copies = layout.cols * layout.rows;
	const isType86 = params.printLayout === 'type86';

	return (
		<div className="hidden print:block">
			<style>{`
        @media print {
          @page {
            size: ${isType86 ? 'A4 portrait' : 'auto'};
            margin: ${isType86 ? '0' : '1cm'};
          }
        }
      `}</style>

			{isType86 ? (
				/* Type 86 cutout mode: exact 86mm × 86mm squares for switch faceplates */
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 86mm)',
						gridAutoRows: '86mm',
						gap: '0',
						justifyContent: 'center',
						alignContent: 'center',
						width: '210mm',
						minHeight: '297mm',
						padding: '12.5mm 19mm',
						boxSizing: 'border-box',
					}}
				>
					{Array.from({ length: copies }).map((_, i) => (
						<div
							key={i}
							style={{
								width: '86mm',
								height: '86mm',
								border: '0.5px dashed #aaa',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '4mm',
								boxSizing: 'border-box',
								pageBreakInside: 'avoid',
								overflow: 'hidden',
							}}
						>
							{qrImageUrl && (
								<img
									src={qrImageUrl}
									alt="WiFi QR Code"
									style={{ width: '54mm', height: '54mm', objectFit: 'contain' }}
								/>
							)}

							<PrintCardInfo
								ssid={params.ssid}
								label={params.label}
								encLabel={encLabel}
								password={params.password}
								printPassword={params.printPassword}
								compact
							/>
						</div>
					))}
				</div>
			) : (
				<div
					className="print-grid"
					style={{
						display: 'grid',
						gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
						gap: copies > 1 ? '0px' : '0',
						width: '100%',
					}}
				>
					{Array.from({ length: copies }).map((_, i) => (
						<div
							key={i}
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '12px',
								borderRight: copies > 1 && (i + 1) % layout.cols !== 0 ? '1px dashed #ccc' : 'none',
								borderBottom: copies > 1 && i < copies - layout.cols ? '1px dashed #ccc' : 'none',
								pageBreakInside: 'avoid',
							}}
						>
							{qrImageUrl && (
								<img src={qrImageUrl} alt="WiFi QR Code" style={{ width: '100%', maxWidth: '250px', height: 'auto' }} />
							)}

							<PrintCardInfo
								ssid={params.ssid}
								label={params.label}
								encLabel={encLabel}
								password={params.password}
								printPassword={params.printPassword}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
