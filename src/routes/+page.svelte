<script>
  import { sectionSpy } from "./section-spy";
  import ColorBoxes from "./_components/ColorBoxes.svelte";
</script>

<main>
  <section id="home" use:sectionSpy.spy>
    <h1>Using Svelte-ScrollSpy</h1>
    <p>Conveniently spy scroll position with Svelte action</p>
  </section>

  <section id="boxes" use:sectionSpy.spy>
    <ColorBoxes />
  </section>

  <section id="about" use:sectionSpy.spy>
    <h2>About Us</h2>
    <p>
      Ipsum culpa cupidatat Lorem ex. Magna Lorem duis duis consectetur dolore
      reprehenderit nostrud. Commodo incididunt velit nostrud laborum labore
      consectetur occaecat et. Anim eiusmod voluptate reprehenderit tempor. Sit
      culpa nostrud aute sit adipisicing labore eiusmod duis.
    </p>

    <p>
      Tempor mollit eiusmod amet esse. Eiusmod exercitation veniam pariatur
      voluptate anim. Do nisi sit consequat nulla laboris sint culpa nostrud
      consequat. Anim non eu et duis deserunt.
    </p>

    <p>
      Mollit pariatur enim consequat duis ex enim. Officia velit ullamco aute
      aliqua nostrud aute. Lorem qui tempor nisi irure fugiat quis adipisicing.
      Dolor incididunt mollit eu officia excepteur cupidatat.
    </p>
  </section>

  <section id="contact" use:sectionSpy.spy>
    <h2>Contact Us</h2>
    <p>
      Ipsum culpa cupidatat Lorem ex. Magna Lorem duis duis consectetur dolore
      reprehenderit nostrud.
    </p>

    <form>
      <label for="email"> Email</label>
      <input type="email" name="email" required />

      <label for="message"> Message</label>
      <textarea name="message" required />

      <button type="submit" on:click={(e) => e.preventDefault()}>Submit</button>
    </form>
  </section>
</main>

<style>
  #home {
    height: 100vh;
    height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3rem;
  }

  #home > h1 {
    margin-top: -10rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: smokewhite;
    padding: 2rem 1rem;
  }
</style>
