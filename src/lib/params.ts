import {
	parseAsBoolean,
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	createSearchParamsCache,
} from 'nuqs/server';
import {
	DOT_STYLES,
	CORNER_SQUARE_STYLES,
	CORNER_DOT_STYLES,
	EC_LEVELS,
	ENCRYPTION_TYPES,
	PRINT_LAYOUTS,
	DEFAULTS,
} from './constants';

export const qrParsers = {
	// WiFi params
	ssid: parseAsString.withDefault(''),
	password: parseAsString.withDefault(''),
	encryption: parseAsStringLiteral(ENCRYPTION_TYPES.map((e) => e.value)).withDefault(DEFAULTS.encryptionType),
	hidden: parseAsBoolean.withDefault(false),

	// QR styling
	ecLevel: parseAsStringLiteral(EC_LEVELS.map((e) => e.value)).withDefault(DEFAULTS.ecLevel),
	dotStyle: parseAsStringLiteral(DOT_STYLES.map((d) => d.value)).withDefault(DEFAULTS.dotStyle),
	cornerSquareStyle: parseAsStringLiteral(CORNER_SQUARE_STYLES.map((c) => c.value)).withDefault(
		DEFAULTS.cornerSquareStyle
	),
	cornerDotStyle: parseAsStringLiteral(CORNER_DOT_STYLES.map((c) => c.value)).withDefault(DEFAULTS.cornerDotStyle),
	fgColor: parseAsString.withDefault(DEFAULTS.fgColor),
	bgColor: parseAsString.withDefault(DEFAULTS.bgColor),
	size: parseAsInteger.withDefault(DEFAULTS.size),

	// Label
	label: parseAsString.withDefault(''),

	// Print
	printLayout: parseAsStringLiteral(PRINT_LAYOUTS.map((p) => p.value)).withDefault(DEFAULTS.printLayout),
	printPassword: parseAsBoolean.withDefault(false),
};

export const searchParamsCache = createSearchParamsCache(qrParsers);
