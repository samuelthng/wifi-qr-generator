'use client';

import { useEffect, useRef, useCallback } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import { qrParsers } from '@/lib/params';
import { encodeState, decodeState, MAX_SHARE_URL_PAYLOAD, type QRState } from '@/lib/codec';

// All parsers — individual QR params plus the single compressed `q` param.
const allParsers = {
	q: parseAsString,
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
	logoOpaque: qrParsers.logoOpaque,
	logoStrokeWidth: qrParsers.logoStrokeWidth,
	label: qrParsers.label,
	printLayout: qrParsers.printLayout,
	printPassword: qrParsers.printPassword,
};

type AllParams = ReturnType<typeof useQueryStates<typeof allParsers>>[0];

/** Nullable partial values accepted by setParams for a full URL param reset. */
type ParamUpdate = { [K in keyof AllParams]?: AllParams[K] | null };

function paramsToState(params: AllParams): QRState {
	return {
		ssid: params.ssid,
		password: params.password,
		encryption: params.encryption,
		hidden: params.hidden,
		ecLevel: params.ecLevel,
		dotStyle: params.dotStyle,
		cornerSquareStyle: params.cornerSquareStyle,
		cornerDotStyle: params.cornerDotStyle,
		fgColor: params.fgColor,
		bgColor: params.bgColor,
		size: params.size,
		logoOpaque: params.logoOpaque,
		logoStrokeWidth: params.logoStrokeWidth,
		label: params.label,
		printLayout: params.printLayout,
		printPassword: params.printPassword,
	};
}

export interface ShareUrlResult {
	url: string;
	/** Whether the logo was included in the compressed payload. */
	logoIncluded: boolean;
}

/**
 * Handles compressed `?q=` URL payloads.
 *
 * On mount: if `?q=` is present in the URL, it is decoded and all individual
 * nuqs params are populated atomically, replacing the `?q=` param.
 *
 * Returns `getShareUrl(logo)` — a function that encodes the current state
 * (and optionally the logo, if it fits within MAX_SHARE_URL_PAYLOAD) into a
 * compact `?q=` shareable URL.
 */
export function useCompressedParams(onLogoLoad: (logo: string) => void): {
	getShareUrl: (logo: string | null) => Promise<ShareUrlResult>;
} {
	const [params, setParams] = useQueryStates(allParsers, { shallow: false });
	const initDoneRef = useRef(false);

	// Decode ?q= on first mount only.
	useEffect(() => {
		if (initDoneRef.current) return;
		initDoneRef.current = true;

		if (!params.q) return;

		const q = params.q;
		decodeState(q).then((state) => {
			// Build a partial update: reset `q` to null (removes it from the URL)
			// and apply every field that was present in the encoded payload.
			const updates: ParamUpdate = { q: null };

			if (state.ssid !== undefined) updates.ssid = state.ssid;
			if (state.password !== undefined) updates.password = state.password;
			if (state.encryption !== undefined)
				updates.encryption = state.encryption as AllParams['encryption'];
			if (state.hidden !== undefined) updates.hidden = state.hidden;
			if (state.ecLevel !== undefined) updates.ecLevel = state.ecLevel as AllParams['ecLevel'];
			if (state.dotStyle !== undefined) updates.dotStyle = state.dotStyle as AllParams['dotStyle'];
			if (state.cornerSquareStyle !== undefined)
				updates.cornerSquareStyle = state.cornerSquareStyle as AllParams['cornerSquareStyle'];
			if (state.cornerDotStyle !== undefined)
				updates.cornerDotStyle = state.cornerDotStyle as AllParams['cornerDotStyle'];
			if (state.fgColor !== undefined) updates.fgColor = state.fgColor;
			if (state.bgColor !== undefined) updates.bgColor = state.bgColor;
			if (state.size !== undefined) updates.size = state.size;
			if (state.logoOpaque !== undefined) updates.logoOpaque = state.logoOpaque;
			if (state.logoStrokeWidth !== undefined) updates.logoStrokeWidth = state.logoStrokeWidth;
			if (state.label !== undefined) updates.label = state.label;
			if (state.printLayout !== undefined)
				updates.printLayout = state.printLayout as AllParams['printLayout'];
			if (state.printPassword !== undefined) updates.printPassword = state.printPassword;

			void setParams(updates as Parameters<typeof setParams>[0]);

			if (state.logo) onLogoLoad(state.logo);
		});
		// Intentionally run only on mount — params.q captures the initial URL value.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getShareUrl = useCallback(
		async (logo: string | null): Promise<ShareUrlResult> => {
			const state = paramsToState(params);
			const origin = typeof window !== 'undefined' ? window.location.origin : '';
			const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

			// Try including the logo; fall back to excluding it if the payload is too large.
			if (logo) {
				const qWithLogo = await encodeState({ ...state, logo });
				if (qWithLogo.length <= MAX_SHARE_URL_PAYLOAD) {
					return { url: `${origin}${pathname}?q=${qWithLogo}`, logoIncluded: true };
				}
			}

			const q = await encodeState(state);
			return { url: `${origin}${pathname}?q=${q}`, logoIncluded: false };
		},
		[params]
	);

	return { getShareUrl };
}
