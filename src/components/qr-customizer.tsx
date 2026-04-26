'use client';

import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { DOT_STYLES, CORNER_SQUARE_STYLES, CORNER_DOT_STYLES, EC_LEVELS } from '@/lib/constants';

interface QRCustomizerProps {
	logo: string | null;
	onLogoChange: (logo: string | null) => void;
}

export function QRCustomizer({ logo, onLogoChange }: QRCustomizerProps) {
	const [params, setParams] = useQueryStates(
		{
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

	function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 500_000) {
			alert('Logo file should be under 500KB for best results.');
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			onLogoChange(reader.result as string);
		};
		reader.readAsDataURL(file);
	}

	return (
		<div className="space-y-5">
			<fieldset>
				<legend className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Error Correction</legend>
				<div className="grid grid-cols-4 gap-1">
					{EC_LEVELS.map((level) => (
						<button
							key={level.value}
							type="button"
							onClick={() => setParams({ ecLevel: level.value })}
							className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
								params.ecLevel === level.value
									? 'bg-blue-600 text-white'
									: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
							}`}
							title={level.description}
						>
							{level.value}
						</button>
					))}
				</div>
				<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
					{EC_LEVELS.find((l) => l.value === params.ecLevel)?.description}
				</p>
			</fieldset>

			<fieldset>
				<legend className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Dot Style</legend>
				<div className="grid grid-cols-3 gap-1.5">
					{DOT_STYLES.map((style) => (
						<button
							key={style.value}
							type="button"
							onClick={() => setParams({ dotStyle: style.value })}
							className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
								params.dotStyle === style.value
									? 'bg-blue-600 text-white'
									: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
							}`}
						>
							{style.label}
						</button>
					))}
				</div>
			</fieldset>

			<div className="grid grid-cols-2 gap-4">
				<fieldset>
					<legend className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Corner Square</legend>
					<select
						value={params.cornerSquareStyle}
						onChange={(e) =>
							setParams({
								cornerSquareStyle: e.target.value as typeof params.cornerSquareStyle,
							})
						}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
					>
						{CORNER_SQUARE_STYLES.map((style) => (
							<option key={style.value} value={style.value}>
								{style.label}
							</option>
						))}
					</select>
				</fieldset>

				<fieldset>
					<legend className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Corner Dot</legend>
					<select
						value={params.cornerDotStyle}
						onChange={(e) =>
							setParams({
								cornerDotStyle: e.target.value as typeof params.cornerDotStyle,
							})
						}
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
					>
						{CORNER_DOT_STYLES.map((style) => (
							<option key={style.value} value={style.value}>
								{style.label}
							</option>
						))}
					</select>
				</fieldset>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Foreground</label>
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={params.fgColor}
							onChange={(e) => setParams({ fgColor: e.target.value })}
							className="h-8 w-8 cursor-pointer rounded border border-zinc-300 dark:border-zinc-600"
						/>
						<input
							type="text"
							value={params.fgColor}
							onChange={(e) => setParams({ fgColor: e.target.value })}
							className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-mono text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
							maxLength={7}
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Background</label>
					<div className="flex items-center gap-2">
						<input
							type="color"
							value={params.bgColor}
							onChange={(e) => setParams({ bgColor: e.target.value })}
							className="h-8 w-8 cursor-pointer rounded border border-zinc-300 dark:border-zinc-600"
						/>
						<input
							type="text"
							value={params.bgColor}
							onChange={(e) => setParams({ bgColor: e.target.value })}
							className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-mono text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
							maxLength={7}
						/>
					</div>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Size: {params.size}px</label>
				<input
					type="range"
					min={150}
					max={600}
					step={10}
					value={params.size}
					onChange={(e) => setParams({ size: Number(e.target.value) })}
					className="w-full accent-blue-600"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Logo</label>
				<div className="flex items-center gap-2">
					<label className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
						{logo ? 'Change' : 'Upload'}
						<input
							type="file"
							accept="image/png,image/jpeg,image/svg+xml,image/webp"
							onChange={handleLogoUpload}
							className="hidden"
						/>
					</label>
					{logo && (
						<button
							type="button"
							onClick={() => onLogoChange(null)}
							className="rounded-lg px-2 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
						>
							Remove
						</button>
					)}
				</div>
				{logo && (
					<p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
						Use error correction Q or H with logos for reliable scanning.
					</p>
				)}
			</div>
		</div>
	);
}
