import L from 'leaflet';

const pin = (bg, emoji) =>
  L.divIcon({
    className: 'pin-marker',
    html: `<div class="pin" style="background:${bg}"><span>${emoji}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });

export const hubIcon = pin('#0b1b33', '🏭');
export const homeIcon = pin('#d4a843', '🏠');

export const truckIcon = (east = false) =>
  L.divIcon({
    className: 'truck-marker',
    html: `<div class="truck-dot"><span style="display:inline-block;transform:${east ? 'scaleX(-1)' : 'none'}">🚚</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
