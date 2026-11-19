import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveSpintax(text: string): string {
  if (!text) return '';
  const spintaxRegex = /\{([^{}]+)\}/g;
  return text.replace(spintaxRegex, (_, choices) => {
    const parts = choices.split('|');
    const chosen = parts[Math.floor(Math.random() * parts.length)];
    return chosen ? chosen.trim() : '';
  });
}

export function interpolate(text: string, vars: Record<string, string> = {}): string {
  if (!text) return '';
  let result = text;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    result = result.replace(regex, val || '');
  }
  return resolveSpintax(result);
}
