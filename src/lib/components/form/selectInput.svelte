<script lang="ts">
  import Label from "$lib/components/label.svelte";
  import Icons from "$lib/svg/icons.svelte";


  let open = $state(false);
  interface Props {
    label: string;
    items: string[];
    placeholder?: string;
    name: string;
    selected?: string | null;
  }

  let {
    label,
    items,
    placeholder = "Default placeholder",
    name,
    selected = $bindable(null)
  }: Props = $props();
</script>

<div class="big-container">
  <input type="hidden" {name} value={selected} />
  <Label target="this" {label} />
  {#if !open && selected === null}
    <div class="absolute-box">
      <button class="menu" onclick={() => (open = !open)}>
        {placeholder}
      </button>
      <Icons class="icons" name="downPurple" />
    </div>
  {:else if !open && selected !== null}
    <button class="menu selected" onclick={() => (open = !open)}>
      {selected}
    </button>
  {:else if open}
    <div class="menu-container">
      <button class="menu opened" onclick={() => (open = !open)}>
        {placeholder}
      </button>
      {#each items as item}
        <button
          class="option"
          onclick={() => ((selected = item), (open = !open))}
        >
          {item}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .big-container {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .absolute-box{
    position: relative;
    // width: 100%;
  }

  .icons{
    position: absolute;
  }

  .menu {
    text-align: left;
    padding: 0 1rem;

    color: $color-border-gray;
    font-family: $ff-dropdown;
    font-size: 1rem;

    height: 2.75rem;
    align-items: flex-start;
    flex-shrink: 0;
    border-radius: 0.5rem;
    background: #fff;

    border: 1px solid $color-border-gray;

    cursor: pointer;
  }

  .menu-container {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .menu.opened {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .menu.selected {
    color: $color-text-black;
  }

  .option {
    text-align: left;
    padding: 0 1rem;

    background: #fff;

    height: 2.75rem;
    border-top: none;
    border-left: 1px solid $color-border-gray;
    border-right: 1px solid $color-border-gray;
    border-bottom: 1px solid $color-border-gray;

    cursor: pointer;
  }

  .option:last-child {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
</style>
