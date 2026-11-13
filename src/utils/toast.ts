/**
 * toast.ts
 * ─────────────────────────────────────────────────────────────────
 * Minimal toast + screen-reader announcement helpers.
 *
 * Used for:
 *   - Non-blocking feedback (the timer used a blocking `alert()`)
 *   - Undo affordances for destructive actions (delete task / note)
 *   - Polite announcements for screen readers
 */

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Milliseconds before the toast auto-dismisses. Default: 5000 */
  duration?: number;
  /** Optional action button (e.g. "Undo"). */
  action?: ToastAction;
  /** Keep the toast on screen until it is dismissed manually. */
  sticky?: boolean;
}

const REGION_ID = 'sa-toast-region';
const LIVE_ID = 'sa-live-region';

function ensureRegion(): HTMLElement {
  let region = document.getElementById(REGION_ID);
  if (!region) {
    region = document.createElement('div');
    region.id = REGION_ID;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(region);
  }
  return region;
}

/**
 * Show a transient toast. Returns a function that dismisses it.
 */
export function showToast(message: string, options: ToastOptions = {}): () => void {
  const { duration = 5000, action, sticky = false } = options;

  const region = ensureRegion();

  const toast = document.createElement('div');
  toast.className = 'sa-toast';

  const text = document.createElement('span');
  text.className = 'flex-1';
  text.textContent = message;
  toast.appendChild(text);

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const dismiss = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (!toast.isConnected) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 220);
  };

  if (action) {
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'sa-toast-action';
    actionBtn.textContent = action.label;
    actionBtn.addEventListener('click', () => {
      try {
        action.onClick();
      } catch (err) {
        console.error('Toast action failed:', err);
      }
      dismiss();
    });
    toast.appendChild(actionBtn);
  }

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'sa-toast-action';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', dismiss);
  toast.appendChild(closeBtn);

  region.appendChild(toast);

  if (!sticky) {
    timeoutId = setTimeout(dismiss, duration);
  }

  return dismiss;
}

/**
 * Announce a message to screen readers only (no visual toast).
 */
export function announce(message: string): void {
  let live = document.getElementById(LIVE_ID);
  if (!live) {
    live = document.createElement('div');
    live.id = LIVE_ID;
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.className = 'sr-only';
    document.body.appendChild(live);
  }
  // Clearing first guarantees repeated identical messages are re-announced.
  live.textContent = '';
  setTimeout(() => {
    live.textContent = message;
  }, 30);
}
