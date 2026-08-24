/**
 * Haptic feedback helper using the Web Vibration API (navigator.vibrate).
 * Safe across all browsers & platforms (gracefully falls back on unsupported devices like iOS Safari).
 */

export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Triggers a device vibration pulse / pattern if supported by the browser.
 * @param pattern Type of feedback ('error', 'warning', 'success', 'light', 'medium', etc.)
 * @returns boolean indicating if the vibration was triggered
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): boolean {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof navigator.vibrate !== 'function'
  ) {
    return false;
  }

  try {
    switch (pattern) {
      case 'light':
        return navigator.vibrate(15);
      case 'medium':
        return navigator.vibrate(35);
      case 'heavy':
        return navigator.vibrate(60);
      case 'selection':
        return navigator.vibrate(10);
      case 'success':
        // Subtle double pulse [vibrate, pause, vibrate]
        return navigator.vibrate([30, 40, 40]);
      case 'warning':
        // Moderate alert double pulse
        return navigator.vibrate([50, 40, 50]);
      case 'error':
        // Strong error triple pulse: [buzz, pause, buzz, pause, buzz]
        return navigator.vibrate([80, 50, 80, 50, 80]);
      default:
        return navigator.vibrate(25);
    }
  } catch (err) {
    // Non-critical, gracefully ignore
    return false;
  }
}
