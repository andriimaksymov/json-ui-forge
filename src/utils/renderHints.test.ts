import { describe, expect, it } from 'vitest';
import { getStringRenderHint, svgMarkupToDataUrl } from './renderHints';

describe('renderHints', () => {
  it('detects media-friendly string hints', () => {
    expect(getStringRenderHint('✨')).toBe('emoji');
    expect(getStringRenderHint('https://example.dev/image.png')).toBe('image-url');
    expect(getStringRenderHint('data:image/svg+xml,%3Csvg%3E')).toBe('image-url');
    expect(getStringRenderHint('<svg viewBox="0 0 10 10"></svg>')).toBe('svg-markup');
    expect(getStringRenderHint('https://example.dev/docs')).toBe('url');
    expect(getStringRenderHint('Schema Studio')).toBe('plain');
  });

  it('converts inline SVG markup to a data URL', () => {
    const dataUrl = svgMarkupToDataUrl('<svg viewBox="0 0 10 10"></svg>');

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(decodeURIComponent(dataUrl)).toContain('<svg viewBox="0 0 10 10"></svg>');
  });
});
