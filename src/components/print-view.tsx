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
	const iconSize = compact ? '13' : '18';
	const labelColWidth = compact ? '11mm' : '16mm';

	return (
		<div
			style={{
				marginTop: compact ? '2mm' : '4mm',
				width: '100%',
				backgroundColor: '#f8f9fa',
				border: '0.5px solid #e4e4e4',
				borderRadius: compact ? '2mm' : '3mm',
				padding: compact ? '2mm 3mm' : '4mm 6mm',
				boxSizing: 'border-box',
				textAlign: 'center',
			}}
		>
			{/* "Scan to connect" header with WiFi icon — vertically centered */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: compact ? '1.5mm' : '2mm',
					marginBottom: compact ? '1.5mm' : '3mm',
				}}
			>
				<svg
					width={iconSize}
					height={iconSize}
					viewBox="0 0 24 20"
					fill="none"
					stroke="#666"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					style={{ flexShrink: 0, display: 'block' }}
				>
					<path d="M1.42 5a16 16 0 0 1 21.16 0" />
					<path d="M5 8.55a11 11 0 0 1 14.08 0" />
					<path d="M8.53 12.11a6 6 0 0 1 6.95 0" />
					<circle cx="12" cy="16" r="1" fill="#666" />
				</svg>
				<span
					style={{
						fontSize: compact ? '6.5pt' : '8.5pt',
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: '0.1em',
						color: '#666',
						lineHeight: 1,
					}}
				>
					Scan to connect
				</span>
			</div>

			{/* Divider between header and card body */}
			<div
				style={{
					width: '100%',
					height: '0.5px',
					background: '#e0e0e0',
					marginBottom: compact ? '1.5mm' : '3mm',
				}}
			/>

			{/* Label (custom name like "Guest WiFi") */}
			{label && (
				<p
					style={{
						fontSize: compact ? '9.5pt' : '13pt',
						fontWeight: 700,
						margin: `0 0 ${compact ? '1mm' : '2mm'}`,
						color: '#111',
						lineHeight: 1.2,
					}}
				>
					{label}
				</p>
			)}

			{/* Network details in a structured key/value layout */}
			<div
				style={{
					display: 'inline-block',
					textAlign: 'left',
					fontSize: compact ? '6.5pt' : '9pt',
					lineHeight: 1.7,
					color: '#444',
				}}
			>
				<div style={{ display: 'flex', gap: compact ? '1.5mm' : '3mm', alignItems: 'baseline' }}>
					<span style={{ color: '#888', fontWeight: 500, minWidth: labelColWidth, flexShrink: 0 }}>Network</span>
					<span style={{ fontWeight: 600, color: '#111' }}>{ssid}</span>
				</div>
				{!compact && (
					<div style={{ display: 'flex', gap: '3mm', alignItems: 'baseline' }}>
						<span style={{ color: '#888', fontWeight: 500, minWidth: labelColWidth, flexShrink: 0 }}>Security</span>
						<span style={{ color: '#333' }}>{encLabel}</span>
					</div>
				)}
				{printPassword && password && (
					<div style={{ display: 'flex', gap: compact ? '1.5mm' : '3mm', alignItems: 'baseline' }}>
						<span style={{ color: '#888', fontWeight: 500, minWidth: labelColWidth, flexShrink: 0 }}>Password</span>
						<span style={{ fontFamily: 'monospace', letterSpacing: '0.05em', color: '#111' }}>{password}</span>
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
