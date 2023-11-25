import createScrollSpy from "$lib/index.js";
import type { ActionReturn } from "svelte/action";

export const sectionSpy = (() => {
  // use spy store's functionality
  const spy = createScrollSpy({ rootMargin: "-50% 0px" });

  return {
    ...spy,

    // Overwrite spy() to add restriction on targets and apply custom attribute

    /**
     * A svelte action to register an element as a section to spy on. The
     * element must have an id.
     *
     * @param [label] - an arbitrary label for the section. This action assigns
     *   the label value to the element's `data-section-label` attribute. If no
     *   label is given, the element's id is transformed into a capitalized
     *   string and used as the label.
     */
    spy(
      target: string | Element,
      label?: string,
    ): ActionReturn<string, { id: string }> {
      const elem =
        target instanceof Element ? target : document.getElementById(target);

      if (!elem) {
        console.warn("Could not find target:", target);
        return {};
      }

      if (!elem.id) {
        console.warn("Element must have an id to be a section:", target);
        return {};
      }

      label ??= elem.id // kebab-case to Capitalized Words
        .replace(/-./g, (m) => " " + m[1].toUpperCase())
        .replace(/^(.)/, (m) => m.toUpperCase());

      const { destroy } = spy.spy(elem);
      if (destroy) elem.setAttribute("data-section-label", label);
      return { destroy };
    },
  };
})();
