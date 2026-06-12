const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1')
  .replace('/api/v1', '')
  .replace(/\/$/, '');

// Préfixes qui appartiennent au serveur Laravel
const LARAVEL_PREFIXES = ['/storage/', '/api/'];

export function buildImageUrl(image: string | string[] | null | undefined): string {
  const raw = Array.isArray(image) ? image[0] : image;
  if (!raw) return '/placeholder.png';

  // URL absolue → retourner telle quelle
  if (raw.startsWith('http')) return raw;

  // Chemin absolu qui appartient à Laravel (ex: /storage/..., /api/...)
  if (raw.startsWith('/') && LARAVEL_PREFIXES.some(p => raw.startsWith(p))) {
    return `${BASE_URL}${raw}`;
  }

  // Chemin absolu local Next.js (ex: /images/art1.jpg, /placeholder.png)
  if (raw.startsWith('/')) return raw;

  // Chemin relatif → fichier dans le storage Laravel
  return `${BASE_URL}/storage/${raw}`;
}
