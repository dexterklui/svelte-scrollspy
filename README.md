# Svelte ScrollSpy

Svelte ScrollSpy is a [Svelte store](https://svelte.dev/docs/svelte-store) that
tracks the intersecting state of a set of elements. The store provides a
[Svelte action](https://svelte.dev/docs/svelte-action) that allows you to easily
register any element for tracking.

# Installation

## NPM

```
npm i -D @dexq/svelte-scrollspy
```

## Yarn

```
yarn add -D @dexq/svelte-scrollspy
```

## bun

```
bun i -d @dexq/svelte-scrollspy
```

# Why Svelte ScrollSpy?

Although there are many intersection observer libraries out there, this library
leverages the power of Svelte actions to provide a simple and intuitive API.
Here are some of the benefits of using this library in a Svelte project.

- Have a cleaner DOM without needing to add wrapper elements.
- Easily register any elements, even nested elements, for tracking.
- No need to worry about cleaning up when elements being tracked are removed
  from the DOM. Callbacks in Svelte action automatically do that.

# API

The object stored in the ScrollSpy store has the following properties:

| Property           | Description                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `amount`           | The number of targets being spied on.                                                                                                         |
| `targets`          | The ordered set of all targets being spied on, in the order of them being added as a target.                                                  |
| `activeTargets`    | The ordered set of all intersecting targets, in the order of entering intersection.                                                           |
| `activeTarget`     | The target that became active most recently and is still active. I.e. the last item in `activeTargets`.                                       |
| `lastActiveTarget` | The target that became active most recently. It may or may not be active now. If this target is no longer being spied on, this value is null. |
| `activeId`         | The id of `activeTarget`.                                                                                                                     |
| `lastActiveId`     | The id of `lastActiveTarget`.                                                                                                                 |
| `isActive`         | A function that checks if an element is active. Returns `null` if the given element is not a target being spied on.                           |

The ScrollSpy store also has the following methods besides the `subscribe`
method of a Svelte store.

| Method     | Description                                                                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spy`      | A svelte action to add an element to the target list and start spying on it.                                                                                                                                                |
| `unspy`    | Stop spying on a target and remove it from the target list. Accepts either the element itself or the id as the argument. This method is automatically called on all registered targets after they are removed from the DOM. |
| `unspyAll` | Stop spying on all existing targets and remove them from the target list.                                                                                                                                                   |

# Usage

## Basic

To use ScrollSpy to track the current section in view on the page. First create
a scroll spy store with the imported `createScrollSpy` function. You can pass in
an IntersectionObserverInit object to configure the IntersectionObserver used
for tracking.

In the example, we set the `rootMargin` to `-50% 0px` so that a section starts
intersecting when it touches the vertical center of the viewport.

```javascript
import createScrollSpy from "@dexq/svelte-scrollspy";
export const scrollSpy = createScrollSpy({ rootMargin: "-50% 0px" });
```

Then in any component file you can import the created store and use its `spy`
method as a Svelte action to start spying on that element.

```svelte
<script>
  import scrollSpy from "$lib/stores/scroll-spy";
</script>

<section id="my-section" use:scrollSpy.spy><!-- ... --></section>
<!-- Other sections... -->
```

Element id is not required for spying. We gave an id to the element here only
for scrolling with URL hash. Now, it is easy to make a navbar that highlights
the current section.

```svelte
<script>
  import scrollSpy from "$lib/stores/scroll-spy";
  import kebabCaseToCapWords from "$lib/utils.js";
</script>

<nav>
  <ul>
    {#each $scrollSpy.targets as section (section)}
      <li class={$scrollSpy.lastActiveTarget === section ? "active" : ""}>
        <a href={"#" + section.id}>{kebabCaseToCapWords(section.id)}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  /* Styling... */
</style>
```

## Restricting What Can Be Spied On

You can augment Scroll Spy with additional properties and methods. For example,
we can enforce that all elements being spied on must have an ID, and we can
assign an arbitrary label to each element when they are registered.

To do this, we create our custom Svelte store by extending the functionality of
Scroll Spy.

```javascript
import createScrollSpy from '@dexq/svelte-scrollspy';
import type { ActionReturn } from 'svelte/action';

export const sectionSpy = (() => {
  // use spy store's functionality
  const spy = createScrollSpy({ rootMargin: '-50% 0px' });

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

      if (!elem || !elem.id) return {};

      label ??= elem.id // kebab-case to Capitalized Words
        .replace(/-./g, (m) => " " + m[1].toUpperCase())
        .replace(/^(.)/, (m) => m.toUpperCase());

      const { destroy } = spy.spy(elem);
      if (destroy) elem.setAttribute("data-section-label", label);
      return { destroy };
    },
  };
})();
```

We can then use our custom store to assign labels with Svelte action syntax.

```svelte
<section id="my-section" use:sectionSpy.spy={"My Label"}><!-- ... --></section>
<!-- Other sections... -->
<footer>You're at the section: {$sectionSpy.activeLabel}</footer>
```

## Adding Custom Properties to the Store

You can even add custom properties to the store.

```typescript
export const sectionSpy = (() => {
  const spy = createSpy({ rootMargin: "-50% 0px" });

  // extend spy store's properties
  interface SectionSpy extends Spy {
    /** The label of the active target (attribute: "data-section-label") */
    activeLabel: string | null;

    /**
     * The label of the last active section (attribute: "data-section-label")
     */
    lastActiveLabel: string | null;
  }

  function getSectionSpy(): SectionSpy {
    return {
      ...get(spy),
      get activeLabel() {
        return this.activeTarget?.getAttribute("data-section-label") ?? null;
      },
      get lastActiveLabel() {
        return (
          this.lastActiveTarget?.getAttribute("data-section-label") ?? null
        );
      },
    };
  }

  // Create our own custom store
  const { subscribe, set } = writable<SectionSpy>(getSectionSpy());
  // Update our custom store whenever the spy store updates
  spy.subscribe(() => set(getSectionSpy()));

  return {
    ...spy,
    subscribe,

    // Implement our own spy() method to add restriction on spied targets and
    // add custom attribute to the targets
    spy(
      target: string | Element,
      label?: string,
    ): ActionReturn<string, { id: string }> {
      const elem =
        target instanceof Element ? target : document.getElementById(target);

      if (!elem || !elem.id) return {};

      label ??= elem.id // kebab-case to Capitalized Words
        .replace(/-./g, (m) => " " + m[1].toUpperCase())
        .replace(/^(.)/, (m) => m.toUpperCase());

      const { destroy } = spy.spy(elem);
      if (destroy) elem.setAttribute("data-section-label", label);
      return { destroy };
    },
  };
})();
```

# License

[MIT](./LICENSE)
