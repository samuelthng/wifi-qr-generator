import type QRCodeStyling from 'qr-code-styling';
import type { Options } from 'qr-code-styling';

export type QRInstance = QRCodeStyling;

export async function createQRCode(options: Partial<Options>): Promise<QRInstance> {
	const QRCodeStylingModule = (await import('qr-code-styling')).default;
	return new QRCodeStylingModule({
		width: 300,
		height: 300,
		type: 'svg',
		...options,
	});
}

export function updateQRCode(instance: QRInstance, options: Partial<Options>): void {
	instance.update(options);
}

export async function downloadQR(
	instance: QRInstance,
	format: 'svg' | 'png',
	filename: string,
	exportSize?: number
): Promise<void> {
	if (format === 'png' && exportSize) {
		// For PNG, create a temporary high-res canvas instance at the target size
		const QRCodeStylingModule = (await import('qr-code-styling')).default;
		const currentOptions = (instance as unknown as { _options: Options })._options;
		const exportInstance = new QRCodeStylingModule({
			...currentOptions,
			width: exportSize,
			height: exportSize,
			type: 'canvas',
		});
		await exportInstance.download({ name: filename, extension: 'png' });
		return;
	}
	await instance.download({
		name: filename,
		extension: format,
	});
}

export async function getRawData(instance: QRInstance, format: 'svg' | 'png'): Promise<Blob | null> {
	const result = await instance.getRawData(format);
	if (!result) return null;
	if (result instanceof Blob) return result;
	// Node Buffer case — convert to Uint8Array for Blob constructor
	return new Blob([new Uint8Array(result)]);
}
