import { useEffect } from "react";

/**
 * TV/d-pad focus registry.
 *
 * React Native has no DOM, so there is no `document.querySelectorAll` /
 * `getBoundingClientRect` to drive directional focus search. Instead every
 * focusable item (result card, episode card, season tab, poster card, etc.)
 * registers itself here via a ref callback, and TVFocusGuideView / the
 * platform's native TV focus engine (Android's own d-pad focus traversal)
 * handles the actual directional movement — that's the RN-TV-appropriate
 * replacement for the old manual arrow-key handler.
 *
 * This module now only exposes the registry so screens can:
 *   - register/unregister focusable node refs (`registerFocusable`)
 *   - query the "default" focus target for a screen after data loads
 *     (`getDefaultFocusTarget`), used to imperatively call `.focus()` on a
 *     TouchableOpacity/Pressable ref via `hasTVPreferredFocus`-style logic.
 *
 * Individual components should pass `hasTVPreferredFocus` to their first
 * rail item / episode card / season tab directly for native TV focus
 * engine support — this registry exists for the cases (post-search-results,
 * post-episode-load) where JS needs to imperatively decide the target.
 */

const registry = new Map(); // group -> Set<{ ref, order }>

export function registerFocusable(group, ref, order = 0) {
  if (!registry.has(group)) registry.set(group, new Set());
  const entry = { ref, order };
  registry.get(group).add(entry);
  return () => registry.get(group)?.delete(entry);
}

export function getDefaultFocusTarget(groups) {
  for (const group of groups) {
    const entries = registry.get(group);
    if (entries && entries.size > 0) {
      const sorted = [...entries].sort((a, b) => a.order - b.order);
      const target = sorted[0].ref?.current;
      if (target) return target;
    }
  }
  return null;
}

// Kept as a hook for API-compatibility with the previous DOM-focus-manager
// version (Layout.jsx calls useKeyboardNavigation()) — on RN there is no
// global keydown listener to install; the native focus engine (d-pad)
// handles arrow-key traversal automatically between focusable views.
export function useKeyboardNavigation() {
  useEffect(() => {
    return () => {
      registry.clear();
    };
  }, []);
}
