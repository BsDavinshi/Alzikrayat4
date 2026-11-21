// 13 hand-written pixel-level canvas filters ported directly from Alzikrayat Project 1

function clamp(value) {
  return value < 0 ? 0 : value > 255 ? 255 : value;
}

function luminance(red, green, blue) {
  return 0.299 * red + 0.587 * green + 0.114 * blue;
}

const pointFilters = {
  grayscale: (r, g, b) => {
    const gray = luminance(r, g, b);
    return [gray, gray, gray];
  },
  sepia: (r, g, b) => [
    0.393 * r + 0.769 * g + 0.189 * b,
    0.349 * r + 0.686 * g + 0.168 * b,
    0.272 * r + 0.534 * g + 0.131 * b
  ],
  invert: (r, g, b) => [255 - r, 255 - g, 255 - b],
  warm: (r, g, b) => [r * 1.08 + 14, g * 1.02 + 4, b * 0.86],
  cool: (r, g, b) => [r * 0.88, g * 1.01 + 2, b * 1.1 + 14],
  noir: (r, g, b) => {
    const gray = (luminance(r, g, b) - 128) * 1.55 + 128;
    return [gray, gray, gray];
  },
  vintage: (r, g, b) => {
    const sepia = pointFilters.sepia(r, g, b);
    const mix = 0.65;
    return [
      (r * (1 - mix) + sepia[0] * mix) * 0.86 + 26,
      (g * (1 - mix) + sepia[1] * mix) * 0.86 + 20,
      (b * (1 - mix) + sepia[2] * mix) * 0.80 + 18
    ];
  }
};

const kernels = {
  sharpen: [[0, -1, 0, -1, 5, -1, 0, -1, 0], 1, 0],
  blur: [[1, 2, 1, 2, 4, 2, 1, 2, 1], 16, 0],
  emboss: [[-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 0],
  'edge-detect': [[-1, -1, -1, -1, 8, -1, -1, -1, -1], 1, 0]
};

function convolve(source, kernel, divisor, offset) {
  const { width, height, data: input } = source;
  const output = new ImageData(width, height);
  const out = output.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0;
      for (let ky = -1; ky <= 1; ky++) {
        const sy = Math.min(height - 1, Math.max(0, y + ky));
        for (let kx = -1; kx <= 1; kx++) {
          const sx = Math.min(width - 1, Math.max(0, x + kx));
          const idx = (sy * width + sx) * 4;
          const weight = kernel[(ky + 1) * 3 + (kx + 1)];
          sumR += input[idx] * weight;
          sumG += input[idx + 1] * weight;
          sumB += input[idx + 2] * weight;
        }
      }
      const target = (y * width + x) * 4;
      out[target] = clamp(sumR / divisor + offset);
      out[target + 1] = clamp(sumG / divisor + offset);
      out[target + 2] = clamp(sumB / divisor + offset);
      out[target + 3] = input[target + 3];
    }
  }
  return output;
}

function vignette(imageData, strength) {
  const { width, height, data: pixels } = imageData;
  const cx = width / 2;
  const cy = height / 2;
  const maxDistSq = cx * cx + cy * cy;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const factor = 1 - strength * ((dx * dx + dy * dy) / maxDistSq);
      const idx = (y * width + x) * 4;
      pixels[idx] *= factor;
      pixels[idx + 1] *= factor;
      pixels[idx + 2] *= factor;
    }
  }
  return imageData;
}

function pixelate(imageData, blockSize) {
  const { width, height, data: pixels } = imageData;

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      const endX = Math.min(bx + blockSize, width);
      const endY = Math.min(by + blockSize, height);
      let r = 0, g = 0, b = 0, count = 0;
      for (let y = by; y < endY; y++) {
        for (let x = bx; x < endX; x++) {
          const idx = (y * width + x) * 4;
          r += pixels[idx];
          g += pixels[idx + 1];
          b += pixels[idx + 2];
          count++;
        }
      }
      for (let y = by; y < endY; y++) {
        for (let x = bx; x < endX; x++) {
          const idx = (y * width + x) * 4;
          pixels[idx] = r / count;
          pixels[idx + 1] = g / count;
          pixels[idx + 2] = b / count;
        }
      }
    }
  }
  return imageData;
}

function adjust(imageData, brightness, contrast) {
  if (!brightness && !contrast) return imageData;
  const bOffset = brightness * 1.28;
  const cLevel = contrast * 2.55;
  const cFactor = (259 * (cLevel + 255)) / (255 * (259 - cLevel));
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = clamp(cFactor * (pixels[i] - 128) + 128 + bOffset);
    pixels[i + 1] = clamp(cFactor * (pixels[i + 1] - 128) + 128 + bOffset);
    pixels[i + 2] = clamp(cFactor * (pixels[i + 2] - 128) + 128 + bOffset);
  }
  return imageData;
}

export function applyFilter(imageData, filterName, adjustments = {}) {
  let result = imageData;
  const pointFilter = pointFilters[filterName];

  if (pointFilter) {
    const pixels = result.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = pointFilter(pixels[i], pixels[i + 1], pixels[i + 2]);
      pixels[i] = clamp(r);
      pixels[i + 1] = clamp(g);
      pixels[i + 2] = clamp(b);
    }
    if (filterName === 'vintage') vignette(result, 0.45);
  } else if (kernels[filterName]) {
    const [kernel, divisor, offset] = kernels[filterName];
    result = convolve(result, kernel, divisor, offset);
  } else if (filterName === 'vignette') {
    vignette(result, 0.75);
  } else if (filterName === 'pixelate') {
    pixelate(result, Math.max(4, Math.round(Math.max(result.width, result.height) / 70)));
  }

  return adjust(result, adjustments.brightness || 0, adjustments.contrast || 0);
}

export function renderFilteredCanvas(sourceImage, targetCanvas, filterName, adjustments, maxSize) {
  const sw = sourceImage.naturalWidth || sourceImage.width;
  const sh = sourceImage.naturalHeight || sourceImage.height;
  const scale = Math.min(1, maxSize / Math.max(sw, sh));

  targetCanvas.width = Math.max(1, Math.round(sw * scale));
  targetCanvas.height = Math.max(1, Math.round(sh * scale));

  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(sourceImage, 0, 0, targetCanvas.width, targetCanvas.height);

  if (filterName !== 'none' || (adjustments && (adjustments.brightness || adjustments.contrast))) {
    const data = ctx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
    ctx.putImageData(applyFilter(data, filterName, adjustments), 0, 0);
  }
  return targetCanvas;
}

export function renderFilterThumbnail(sourceImage, thumbCanvas, filterName) {
  const sw = sourceImage.naturalWidth || sourceImage.width;
  const sh = sourceImage.naturalHeight || sourceImage.height;
  const cropSize = Math.min(sw, sh);
  const ctx = thumbCanvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(
    sourceImage,
    (sw - cropSize) / 2,
    (sh - cropSize) / 2,
    cropSize,
    cropSize,
    0,
    0,
    thumbCanvas.width,
    thumbCanvas.height
  );

  if (filterName !== 'none') {
    const data = ctx.getImageData(0, 0, thumbCanvas.width, thumbCanvas.height);
    ctx.putImageData(applyFilter(data, filterName), 0, 0);
  }
}

export const FILTER_NAMES = [
  'none',
  ...Object.keys(pointFilters),
  ...Object.keys(kernels),
  'vignette',
  'pixelate'
];
