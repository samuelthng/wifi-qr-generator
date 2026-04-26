export const DOT_STYLES = [
	{ value: 'square', label: 'Square' },
	{ value: 'dots', label: 'Dots' },
	{ value: 'rounded', label: 'Rounded' },
	{ value: 'classy', label: 'Classy' },
	{ value: 'classy-rounded', label: 'Classy Rounded' },
	{ value: 'extra-rounded', label: 'Extra Rounded' },
] as const;

export const CORNER_SQUARE_STYLES = [
	{ value: '', label: 'Default' },
	{ value: 'square', label: 'Square' },
	{ value: 'dot', label: 'Dot' },
	{ value: 'extra-rounded', label: 'Extra Rounded' },
] as const;

export const CORNER_DOT_STYLES = [
	{ value: '', label: 'Default' },
	{ value: 'square', label: 'Square' },
	{ value: 'dot', label: 'Dot' },
] as const;

export const EC_LEVELS = [
	{ value: 'L', label: 'Low (7%)', description: 'Smallest QR, least redundancy' },
	{ value: 'M', label: 'Medium (15%)', description: 'Default — good balance' },
	{ value: 'Q', label: 'Quartile (25%)', description: 'Recommended with logo' },
	{ value: 'H', label: 'High (30%)', description: 'Max redundancy, largest QR' },
] as const;

export const ENCRYPTION_TYPES = [
	{ value: 'WPA', label: 'WPA/WPA2/WPA3' },
	{ value: 'WEP', label: 'WEP' },
	{ value: 'nopass', label: 'None (Open)' },
] as const;

export const PRINT_LAYOUTS = [
	{ value: '1', label: '1 per page', cols: 1, rows: 1 },
	{ value: '2x2', label: '2×2 Grid', cols: 2, rows: 2 },
	{ value: '3x3', label: '3×3 Grid', cols: 3, rows: 3 },
	{ value: 'type86', label: 'Type 86 Cutout', cols: 2, rows: 3 },
] as const;

export type DotStyle = (typeof DOT_STYLES)[number]['value'];
export type CornerSquareStyle = (typeof CORNER_SQUARE_STYLES)[number]['value'];
export type CornerDotStyle = (typeof CORNER_DOT_STYLES)[number]['value'];
export type ECLevel = (typeof EC_LEVELS)[number]['value'];
export type EncryptionType = (typeof ENCRYPTION_TYPES)[number]['value'];
export type PrintLayout = (typeof PRINT_LAYOUTS)[number]['value'];

export const DEFAULTS = {
	ecLevel: 'M' as ECLevel,
	dotStyle: 'rounded' as DotStyle,
	cornerSquareStyle: '' as CornerSquareStyle,
	cornerDotStyle: '' as CornerDotStyle,
	fgColor: '#000000',
	bgColor: '#ffffff',
	size: 300,
	encryptionType: 'WPA' as EncryptionType,
	printLayout: '1' as PrintLayout,
} as const;
