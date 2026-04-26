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

/**
 * Adds a contour stroke around a logo image by morphological dilation.
 * Draws the logo at multiple offsets to create a dilated silhouette,
 * fills it with strokeColor, then composites the original logo on top.
 */
export async function addContourStroke(logoDataUrl: string, strokeWidth = 4, strokeColor = '#ffffff'): Promise<string> {
	const img = await loadImage(logoDataUrl);
	const w = img.naturalWidth;
	const h = img.naturalHeight;
	const pad = strokeWidth;
	const canvas = document.createElement('canvas');
	canvas.width = w + pad * 2;
	canvas.height = h + pad * 2;
	const ctx = canvas.getContext('2d')!;

	// Draw the logo at multiple offsets around a circle to create the dilated outline
	const steps = 32;
	for (let i = 0; i < steps; i++) {
		const angle = (2 * Math.PI * i) / steps;
		const dx = pad + Math.cos(angle) * strokeWidth;
		const dy = pad + Math.sin(angle) * strokeWidth;
		ctx.drawImage(img, dx, dy, w, h);
	}

	// Replace all drawn pixels with the stroke color
	ctx.globalCompositeOperation = 'source-in';
	ctx.fillStyle = strokeColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw the original logo centered on top
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(img, pad, pad, w, h);

	return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

export async function getRawData(instance: QRInstance, format: 'svg' | 'png'): Promise<Blob | null> {
	const result = await instance.getRawData(format);
	if (!result) return null;
	if (result instanceof Blob) return result;
	// Node Buffer case — convert to Uint8Array for Blob constructor
	return new Blob([new Uint8Array(result)]);
}
