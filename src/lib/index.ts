import type { ActionReturn } from "svelte/action";
import { writable } from "svelte/store";

export interface ScrollSpy {
  /** Number of targets being spied on */
  amount: number;

  /**
   * Ordered set of all targets being spied on, in the order of them being
   * added as a target
   */
  targets: Set<Element>;

  /** Ordered set of all intersecting targets, in the intersecting order */
  activeTargets: Set<Element>;

  /**
   * The target that became active most recently. It may or may not be active
   * now. If this target is no longer being spied on, this value is null.
   */
  lastActiveTarget: Element | null;

  /** The target that became active most recently and is still active */
  activeTarget: Element | null;

  /**
   * The id of {@link activeTarget}
   */
  activeId: string | null;

  /**
   * The id of the {@link lastActiveTarget}
   */
  lastActiveId: string | null;

  /**
   * Checks if an element is active.
   *
   * @returns true if the given element is an active target intersecting, false
   *   if not active, or null if the given element is not a target being spied
   *   on.
   */
  isActive: (target: Element) => boolean | null;
}

/**
 * Create a svelte store for registered elements and spies on their visibility,
 * i.e. whether they are intersecting with the observer.
 *
 * Use the svelte action {@link spy} to register an element to spy on.
 */
export function createScrollSpy(observerInit?: IntersectionObserverInit) {
  const targets = new Set<Element>();
  const activeTargets = new Set<Element>();
  let lastActiveTarget: Element | null = null;

  const { subscribe, update } = writable<ScrollSpy>({
    get amount() {
      return targets.size;
    },

    get targets() {
      return new Set(targets);
    },

    get activeTargets() {
      return new Set(activeTargets);
    },

    get lastActiveTarget() {
      return lastActiveTarget;
    },

    get activeTarget() {
      return [...activeTargets].at(-1) ?? null;
    },

    get activeId() {
      return this.activeTarget?.id ?? null;
    },

    get lastActiveId() {
      return lastActiveTarget?.id ?? null;
    },

    isActive,
  });

  if (typeof IntersectionObserver === "undefined") {
    return {
      subscribe,
      spy,
      unspy,
      unspyAll,
    };
  }

  const reportUpdates = () => update((state) => state);

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setTargetActive(entry.target);
      } else {
        setTargetUnactive(entry.target);
      }
      reportUpdates();
    }
  }, observerInit);

  function setTargetActive(target: Element) {
    activeTargets.delete(target);
    activeTargets.add(target);
    lastActiveTarget = target;
  }

  function setTargetUnactive(target: Element) {
    activeTargets.delete(target);
  }

  /** @see {@link ScrollSpy.isActive} */
  function isActive(target: Element) {
    if (activeTargets.has(target)) return true;
    if (!targets.has(target)) return null;
    return false;
  }

  /**
   * Stop spying on a target and remove it from the target list.
   *
   * @param target - Either the element itself, or the id */
  function unspy(target: string | Element) {
    let elems: Element[];

    if (typeof target === "string") {
      elems = [...targets.keys()].filter((t) => t.id === target);

      if (elems.length === 0) {
        console.warn(`Invalid target: ${target.toString()}. Nothing to unspy`);
        return;
      }

      if (elems.length > 1) {
        console.warn(`Multiple targets found with id: ${target.toString()}.`);
      }
    } else {
      elems = [target];
    }

    for (const elem of elems) {
      observer.unobserve(elem);
      setTargetUnactive(elem);
      if (lastActiveTarget === elem) lastActiveTarget = null;
      targets.delete(elem);
    }

    reportUpdates();
  }

  /**
   * Stop spying on all existing targets and remove them from the target list.
   */
  function unspyAll() {
    observer.disconnect();
    activeTargets.clear();
    lastActiveTarget = null;
    targets.clear();
    reportUpdates();
  }

  /**
   * Add an element to the target list and start spying on it.
   *
   * @param target - either the element itself or the element id
   *
   * @returns the element that was added to the target list or undefined if
   *   target is invalid or already being spied on
   */
  function spy(target: string | Element): ActionReturn {
    const elem =
      target instanceof Element ? target : document.getElementById(target);

    if (!elem) {
      console.warn(`Invalid target: ${target.toString()}. Nothing to spy on.`);
      return {};
    }
    if (targets.has(elem)) {
      console.warn(`Target is already being spied on: ${target}.`);
      return {};
    }

    targets.add(elem);
    observer.observe(elem);
    reportUpdates();

    return { destroy: () => unspy(elem) };
  }

  return {
    subscribe,
    spy,
    unspy,
    unspyAll,
  };
}

export default createScrollSpy;
