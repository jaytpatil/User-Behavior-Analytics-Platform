/**
 * Heatmap coordinate normalization and rendering utilities
 */

/**
 * Standard reference canvas dimensions for the dashboard view
 */
export const REFERENCE_CANVAS = {
  width: 1000,
  height: 650,
};

/**
 * Normalize raw client coordinates to the target canvas dimensions
 */
export const normalizeCoordinate = (
  clickX,
  clickY,
  viewportWidth = 1440,
  viewportHeight = 900,
  targetWidth = REFERENCE_CANVAS.width,
  targetHeight = REFERENCE_CANVAS.height
) => {
  const safeVw = Math.max(320, viewportWidth || 1440);
  const safeVh = Math.max(480, viewportHeight || 900);

  const normalizedX = (clickX / safeVw) * targetWidth;
  const normalizedY = (clickY / safeVh) * targetHeight;

  return {
    x: Math.min(targetWidth, Math.max(0, normalizedX)),
    y: Math.min(targetHeight, Math.max(0, normalizedY)),
  };
};

/**
 * Draw Mode A: Coordinate Scatter Plot on Canvas
 * Dots with overlap intensity detection
 */
export const drawCoordinatePlot = (canvas, clicks, options = {}) => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { dotRadius = 6, filterViewport = 'all' } = options;

  ctx.clearRect(0, 0, width, height);

  // Filter clicks if a specific viewport was chosen
  const filteredClicks = clicks.filter((c) => {
    if (filterViewport === 'all') return true;
    const key = `${c.viewport_width || 1440}x${c.viewport_height || 900}`;
    return key === filterViewport;
  });

  // Spatial hashing to count overlaps and increase radius/alpha
  const gridHash = {};
  const gridSize = 12;

  filteredClicks.forEach((click) => {
    const pt = normalizeCoordinate(
      click.click_x,
      click.click_y,
      click.viewport_width,
      click.viewport_height,
      width,
      height
    );
    const key = `${Math.floor(pt.x / gridSize)}_${Math.floor(pt.y / gridSize)}`;
    gridHash[key] = (gridHash[key] || 0) + 1;
  });

  // Draw dots
  filteredClicks.forEach((click) => {
    const pt = normalizeCoordinate(
      click.click_x,
      click.click_y,
      click.viewport_width,
      click.viewport_height,
      width,
      height
    );
    const key = `${Math.floor(pt.x / gridSize)}_${Math.floor(pt.y / gridSize)}`;
    const density = gridHash[key] || 1;

    ctx.save();
    ctx.beginPath();

    // Scale dot size and glow based on overlap count
    const dynamicRadius = Math.min(18, dotRadius + Math.log2(density + 1) * 2);
    ctx.arc(pt.x, pt.y, dynamicRadius, 0, Math.PI * 2);

    if (density > 3) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.75)'; // Red for high density
      ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
      ctx.shadowBlur = 8;
    } else if (density > 1) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'; // Amber for medium density
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = 'rgba(37, 99, 235, 0.65)'; // Blue for single clicks
      ctx.shadowColor = 'rgba(37, 99, 235, 0.5)';
      ctx.shadowBlur = 4;
    }

    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  });
};

/**
 * Draw Mode B: Smooth Heatmap Overlay on Canvas
 * Computes radial gradients for density clusters with color mapping
 */
export const drawHeatmapOverlay = (canvas, clicks, options = {}) => {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { radius = 28, blur = 18, filterViewport = 'all' } = options;

  ctx.clearRect(0, 0, width, height);

  const filteredClicks = clicks.filter((c) => {
    if (filterViewport === 'all') return true;
    const key = `${c.viewport_width || 1440}x${c.viewport_height || 900}`;
    return key === filterViewport;
  });

  if (filteredClicks.length === 0) return;

  // Step 1: Create an offscreen grayscale alpha mask
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = width;
  shadowCanvas.height = height;
  const sCtx = shadowCanvas.getContext('2d');

  filteredClicks.forEach((click) => {
    const pt = normalizeCoordinate(
      click.click_x,
      click.click_y,
      click.viewport_width,
      click.viewport_height,
      width,
      height
    );

    const radGrad = sCtx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    sCtx.fillStyle = radGrad;
    sCtx.beginPath();
    sCtx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    sCtx.fill();
  });

  // Step 2: Color gradient palette (Cold Blue -> Cyan -> Green -> Yellow -> Bright Red)
  const paletteCanvas = document.createElement('canvas');
  paletteCanvas.width = 256;
  paletteCanvas.height = 1;
  const pCtx = paletteCanvas.getContext('2d');

  const gradient = pCtx.createLinearGradient(0, 0, 256, 1);
  gradient.addColorStop(0.0, 'rgba(0, 0, 255, 0)');
  gradient.addColorStop(0.2, 'rgba(0, 255, 255, 0.4)');
  gradient.addColorStop(0.4, 'rgba(0, 255, 0, 0.6)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 0, 0.8)');
  gradient.addColorStop(1.0, 'rgba(255, 0, 0, 0.95)');

  pCtx.fillStyle = gradient;
  pCtx.fillRect(0, 0, 256, 1);
  const palette = pCtx.getImageData(0, 0, 256, 1).data;

  // Step 3: Map alpha values to color gradient
  const imgData = sCtx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  for (let i = 3; i < pixels.length; i += 4) {
    const alpha = pixels[i];
    if (alpha > 0) {
      const paletteOffset = alpha * 4;
      pixels[i - 3] = palette[paletteOffset]; // R
      pixels[i - 2] = palette[paletteOffset + 1]; // G
      pixels[i - 1] = palette[paletteOffset + 2]; // B
      pixels[i] = Math.min(240, Math.max(40, alpha * 1.5)); // A
    }
  }

  ctx.putImageData(imgData, 0, 0);
};
