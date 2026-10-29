// Gestor centralizado del rastreo en segundo plano y notificaciones
export const PREP_START = 4;
export const DEPART = 10;
export const TRAVEL = 80;
export const TOTAL_TRACKING_TIME = DEPART + TRAVEL; // 90 segundos

export function getTrackingKey(orderNumber) {
  return `5a-track-${orderNumber}`;
}

export function getTrackingState(orderNumber) {
  if (!orderNumber) return null;
  try {
    const raw = localStorage.getItem(getTrackingKey(orderNumber));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTrackingState(orderNumber, data) {
  if (!orderNumber) return null;
  try {
    const current = getTrackingState(orderNumber) || {};
    const updated = { ...current, ...data };
    localStorage.setItem(getTrackingKey(orderNumber), JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export function initOrderTracking(orderNumber) {
  if (!orderNumber) return;
  const existing = getTrackingState(orderNumber);
  if (!existing) {
    const now = Date.now();
    saveTrackingState(orderNumber, {
      orderNumber,
      startTime: now,
      lastTick: now,
      accumulatedTime: 0,
      speed: 1,
      paused: false,
      delivered: false,
      notified: false,
    });
  }
}

export function computeSimTime(track) {
  if (!track) return 0;
  if (track.delivered) return TOTAL_TRACKING_TIME;
  const acc = track.accumulatedTime ?? 0;
  if (track.paused) return acc;
  const now = Date.now();
  const last = track.lastTick || track.startTime || now;
  const delta = ((now - last) / 1000) * (track.speed || 1);
  return Math.min(TOTAL_TRACKING_TIME, acc + delta);
}

export function playDeliveryChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Secuencia armónica alegre de llegada (Do - Mi - Sol - Do agudo)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.5);
    });
  } catch {
    // Si el navegador bloquea audio sin interacción previa, no afecta la UI
  }
}

export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

export function sendBrowserNotification(title, body) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/favicon.ico' });
    } catch {}
  }
}
