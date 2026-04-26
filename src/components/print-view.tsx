'use client';

import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { PRINT_LAYOUTS, ENCRYPTION_TYPES } from '@/lib/constants';
import { QRLabelDisplay } from './qr-label';

export function PrintView() {
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

	return (
		<div
			className="hidden print:block"
			style={{
				display: 'var(--print-display, none)',
			}}
		>
			<style>{`
        @media print {
          @page { size: auto; margin: 1cm; }
          body > *:not(.print-root) { display: none !important; }
          .print-root { display: block !important; }
          .print-root .no-print { display: none !important; }
        }
      `}</style>

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
						className="flex flex-col items-center justify-center p-4"
						style={{
							borderRight: copies > 1 && (i + 1) % layout.cols !== 0 ? '1px dashed #ccc' : 'none',
							borderBottom: copies > 1 && i < copies - layout.cols ? '1px dashed #ccc' : 'none',
							pageBreakInside: 'avoid',
						}}
					>
						{/* QR code gets cloned here via JS in qr-generator */}
						<div className="print-qr-slot" data-slot={i} />

						<QRLabelDisplay label={params.label} />

						<div className="mt-2 text-center text-sm text-zinc-600">
							<p className="font-medium">{params.ssid}</p>
							<p className="text-xs text-zinc-400">{encLabel}</p>
							{params.printPassword && params.password && (
								<p className="text-xs mt-0.5">
									Password: <span className="font-mono">{params.password}</span>
								</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
