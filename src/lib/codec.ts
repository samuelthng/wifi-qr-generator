/**
 * Compress/decompress app state into a base64url-encoded deflate-raw payload.
 * Uses the global CompressionStream / DecompressionStream APIs, available in
 * modern browsers and Node.js 18+.
 */

export interface QRState {
	ssid: string;
	password: string;
	encryption: string;
	hidden: boolean;
	ecLevel: string;
	dotStyle: string;
	cornerSquareStyle: string;
	cornerDotStyle: string;
	fgColor: string;
	bgColor: string;
	size: number;
	logoOpaque: boolean;
	logoStrokeWidth: number;
	label: string;
	printLayout: string;
	printPassword: boolean;
	/** Base64 data-URL of the logo image. Only included when it fits within MAX_SHARE_URL_PAYLOAD. */
	logo?: string;
}

/**
 * Maximum number of base64url characters allowed for the entire `q` param value.
 * Keeps URLs within a reasonable length (≈ 6 KB decoded) while still fitting
 * small SVG/icon logos.
 */
export const MAX_SHARE_URL_PAYLOAD = 8_192;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function readStream(readable: ReadableStream<Uint8Array>): Promise<Uint8Array> {
	const chunks: Uint8Array[] = [];
	const reader = readable.getReader();
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		if (value) chunks.push(value);
	}
	const total = chunks.reduce((n, c) => n + c.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}
	return out;
}

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = '';
	// Process in chunks to avoid stack overflow with large arrays
	const CHUNK = 8_192;
	for (let i = 0; i < bytes.length; i += CHUNK) {
		binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(input: string): Uint8Array {
	const padded = input.replace(/-/g, '+').replace(/_/g, '/');
	const binaryStr = atob(padded);
	const bytes = new Uint8Array(binaryStr.length);
	for (let i = 0; i < binaryStr.length; i++) {
		bytes[i] = binaryStr.charCodeAt(i);
	}
	return bytes;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Serialize and compress app state into a URL-safe string. */
export async function encodeState(state: QRState): Promise<string> {
	const input = new TextEncoder().encode(JSON.stringify(state));
	const stream = new CompressionStream('deflate-raw');
	const writer = stream.writable.getWriter();
	writer.write(input);
	writer.close();
	const compressed = await readStream(stream.readable);
	return bytesToBase64Url(compressed);
}

/** Decompress and deserialize app state from a URL-safe string. Returns `{}` on error. */
export async function decodeState(q: string): Promise<Partial<QRState>> {
	try {
		const bytes = base64UrlToBytes(q);
		const stream = new DecompressionStream('deflate-raw');
		const writer = stream.writable.getWriter();
		// Cast to Uint8Array<ArrayBuffer> — base64UrlToBytes always produces one.
		writer.write(bytes as unknown as Uint8Array<ArrayBuffer>);
		writer.close();
		const decompressed = await readStream(stream.readable);
		const json = new TextDecoder().decode(decompressed);
		return JSON.parse(json) as Partial<QRState>;
	} catch {
		return {};
	}
}
