<script lang="ts">
  interface Props {
    title?: string;
  }

  let { title = "Default Title"}: Props = $props();
</script>

<header class="container">
  <h1>{title}</h1>
</header>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: $medium-8;
    justify-content: center;
    width: fit-content;
  }

  h1 {
    color: $color-text-black;
    text-align: center;
    font-family: $ff-log-in-card;
    font-size: $fs-card-header-title-small;
    font-weight: 500;
  }

  h2 {
    color: $color-text-accent-gray;
    text-align: center;
    font-family: $ff-log-in-card;
    font-size: $fs-card-header-subtitle-small;
    font-weight: 300;
  }

  @media (min-width: $large-screen) {
    h1 {
      font-size: $fs-card-header-title-large;
    }

    h2 {
      font-size: $fs-card-header-subtitle-small;
    }
  }
</style>
