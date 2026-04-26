'use client';

import { useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { ENCRYPTION_TYPES } from '@/lib/constants';
import { useState } from 'react';

export function WifiForm() {
	const [params, setParams] = useQueryStates(
		{
			ssid: qrParsers.ssid,
			password: qrParsers.password,
			encryption: qrParsers.encryption,
			hidden: qrParsers.hidden,
		},
		{ shallow: false }
	);

	const [showPassword, setShowPassword] = useState(false);

	return (
		<fieldset className="space-y-4">
			<legend className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">WiFi Network</legend>

			<div>
				<label htmlFor="ssid" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
					Network Name (SSID)
				</label>
				<input
					id="ssid"
					type="text"
					value={params.ssid}
					onChange={(e) => setParams({ ssid: e.target.value })}
					placeholder="MyWiFiNetwork"
					className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
					autoComplete="off"
				/>
			</div>

			<div>
				<label htmlFor="password" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
					Password
				</label>
				<div className="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						value={params.password}
						onChange={(e) => setParams({ password: e.target.value })}
						placeholder="Enter password"
						className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
						autoComplete="off"
						disabled={params.encryption === 'nopass'}
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? (
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
								/>
							</svg>
						) : (
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			<div>
				<label htmlFor="encryption" className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
					Encryption
				</label>
				<select
					id="encryption"
					value={params.encryption}
					onChange={(e) =>
						setParams({
							encryption: e.target.value as typeof params.encryption,
							...(e.target.value === 'nopass' ? { password: '' } : {}),
						})
					}
					className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
				>
					{ENCRYPTION_TYPES.map((type) => (
						<option key={type.value} value={type.value}>
							{type.label}
						</option>
					))}
				</select>
			</div>

			<label className="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					checked={params.hidden}
					onChange={(e) => setParams({ hidden: e.target.checked })}
					className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
				/>
				<span className="text-sm text-zinc-600 dark:text-zinc-400">Hidden network</span>
			</label>
		</fieldset>
	);
}
