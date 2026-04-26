export interface WifiParams {
	ssid: string;
	password: string;
	encryptionType: 'WPA' | 'WEP' | 'nopass';
	hidden: boolean;
}

/**
 * Backslash-escape special characters per MeCard/WiFi QR spec.
 * Characters: \ ; , " :
 */
export function escapeWifiValue(value: string): string {
	return value.replace(/[\\;,":]/g, (char) => `\\${char}`);
}

/**
 * Build a WiFi QR code string in the standard WIFI: format.
 * Format: WIFI:T:{type};S:{ssid};P:{password};H:{hidden};;
 */
export function buildWifiString(params: WifiParams): string {
	const { ssid, password, encryptionType, hidden } = params;
	const parts = [`WIFI:T:${encryptionType}`, `S:${escapeWifiValue(ssid)}`, `P:${escapeWifiValue(password)}`];

	if (hidden) {
		parts.push('H:true');
	}

	return parts.join(';') + ';;';
}
