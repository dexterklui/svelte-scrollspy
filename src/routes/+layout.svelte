<script>
  import "./app.css";
  import { sectionSpy } from "./section-spy";
</script>

<header>
  <nav>
    <ul>
      {#each $sectionSpy.targets as section (section)}
        <li class={$sectionSpy.lastActiveTarget === section ? "active" : ""}>
          <a href={"#" + section.id}>
            {section.getAttribute("data-section-label")}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

<slot />

<style>
  header {
    box-sizing: border-box;
    margin: 0;
    padding: 0.75rem 1rem;
    width: 100%;

    position: fixed;
    z-index: 90;
    top: 0;
    left: 0;

    background-color: #fffd;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2);
  }

  ul,
  li {
    margin: 0;
    padding: 0;
  }

  ul {
    margin-inline: auto;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em;
    list-style: none;
    font-size: 0.925em;
  }

  li {
    padding: 0.2em 0.4em;
    border-radius: 0.5em;
  }

  li.active {
    --color: white;
    background-color: blueviolet;
  }

  a {
    text-decoration: none;
    color: var(--color, blueviolet);
  }

  @media only screen and (min-width: 400px) {
    header {
      padding: 1rem 2rem;
    }

    ul {
      gap: 1em;
    }

    li {
      padding: 0.5em 1em;
    }
  }

  @media only screen and (min-width: 1000px) {
    ul {
      font-size: 1em;
    }
  }
</style>
