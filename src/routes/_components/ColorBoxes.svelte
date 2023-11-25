<script lang="ts">
  import { onMount } from "svelte";
  import createScrollSpy from "$lib";

  const colors = ["red", "green", "blue", "yellow", "orange", "purple"];
  const rootMargin = "35%";

  let colorBoxSpy: ReturnType<typeof createScrollSpy>;
  let boxContainer: HTMLElement;

  $: activeColor = $colorBoxSpy?.activeTarget?.getAttribute("aria-label");

  onMount(() => {
    colorBoxSpy = createScrollSpy({
      root: boxContainer,
      rootMargin: `0px -${rootMargin}`,
    });

    return () => colorBoxSpy.unspyAll();
  });
</script>

<h2>Color Boxes</h2>
<div class="container" bind:this={boxContainer} style:--rootMargin={rootMargin}>
  <div class="boxScroller">
    {#if colorBoxSpy != null}
      {#each colors as color (color)}
        <div
          class="box"
          class:active={color === activeColor}
          aria-label={color}
          style:background-color={color}
          use:colorBoxSpy.spy
        />
      {/each}
    {/if}
  </div>
</div>
<footer>
  Active boxes: <strong
    >{[...($colorBoxSpy?.activeTargets ?? [])]
      .map((box) => box.getAttribute("aria-label"))
      .join(", ")}</strong
  >
  <br />
  Active box:
  <strong>{$colorBoxSpy?.activeTarget?.getAttribute("aria-label") ?? ""}</strong
  >
  <br />
  Last active box:
  <strong
    >{$colorBoxSpy?.lastActiveTarget?.getAttribute("aria-label") ?? ""}</strong
  >
</footer>

<style>
  footer {
    text-align: center;
  }

  .container {
    position: relative;
    overflow: clip;
    margin-inline: auto;
    margin-bottom: 2rem;
    width: 400px;
    max-width: 100%;
    border: 2px solid blueviolet;
    border-radius: 0.5rem;
  }

  .container::after {
    content: "";
    position: absolute;
    z-index: 10;
    inset: 0 var(--rootMargin, 0);
    background-color: blueviolet;
    opacity: 0.3;
    pointer-events: none;
  }

  .boxScroller {
    box-sizing: border-box;
    width: 100%;
    padding: 1.5rem 160px;
    overflow: scroll;
    display: flex;
    gap: 2.5rem;
  }

  .box {
    width: 160px;
    height: 160px;
    flex-shrink: 0;
    flex-grow: 0;
    border-radius: 0.5rem;
  }

  .active {
    outline: 3px solid orange;
    outline-offset: 5px;
  }
</style>
