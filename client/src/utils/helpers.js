export const GALLERY_STYLES = {
  grid3: { label: '3 Columns', icon: 'bi-grid-3x3-gap' },
  grid4: { label: '4 Columns', icon: 'bi-grid' },
  list: { label: 'List Cards', icon: 'bi-view-list' },
  masonry: { label: 'Masonry', icon: 'bi-bricks' },
  slider: { label: 'Full Slider', icon: 'bi-collection-play' }
};

export function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
}

export function avatarColor(id = '') {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 360;
  }
  const hue = Math.abs(hash * 137) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

export function filterLabel(name = 'none') {
  if (!name || name === 'none') return 'Original';
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const d = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const t = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  return `${d} · ${t}`;
}

export function timeAgo(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ];
  for (const [label, secs] of units) {
    if (seconds >= secs) {
      const amount = Math.floor(seconds / secs);
      return `${amount} ${label}${amount > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

export function uploadUrl(fileName) {
  return fileName ? `/uploads/${encodeURIComponent(fileName)}` : '';
}

export function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/\d/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 25;
  const color = score <= 25 ? 'bg-danger' : score <= 50 ? 'bg-warning' : score <= 75 ? 'bg-info' : 'bg-success';
  return { score, color };
}
