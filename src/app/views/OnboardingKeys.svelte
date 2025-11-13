<script lang="ts">
  import {isMobile} from "src/util/html"
  import {themeColors, appName} from "src/partials/state"
  import Link from "src/partials/Link.svelte"
  import Button from "src/partials/Button.svelte"
  import {router} from "src/app/util/router"
  import {env} from "src/engine"

  export let setStage
  export let nstartCompleted

  const params = new URLSearchParams({
    an: appName,
    ac: window.location.origin,
    at: isMobile ? "android" : "web",
    aa: $themeColors.accent.slice(1),
    asf: "yes",
  })

  const nstart = `https://start.njump.me/?${params.toString()}`

  const prev = () => setStage("intro")

  const next = () => setStage("follows")

  const useNip05Signup = () => {
    router.at("signup/nip05").pushModal()
  }
</script>

<div class="flex gap-3">
  <p
    class="-ml-1 -mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700 text-lg">
    2/4
  </p>
  <p class="text-2xl font-bold">Create your Profile</p>
</div>
<p>
  Create your account with a @{env.NIP05_DOMAIN} identifier for simplified login, or use the traditional method.
</p>
<div class="flex flex-col gap-2">
  <Button class="btn btn-accent" on:click={useNip05Signup}>
    <i class="fa fa-at" /> Create Account with NIP-05 (@{env.NIP05_DOMAIN})
  </Button>
  <div class="relative flex items-center py-2">
    <div class="flex-grow border-t border-neutral-600"></div>
    <span class="px-4 text-sm text-neutral-400">or</span>
    <div class="flex-grow border-t border-neutral-600"></div>
  </div>
  <p class="text-sm text-neutral-400">
    Alternatively, you can use <strong>nstart</strong> to create your account keys and profile.
  </p>
  <div class="flex gap-2">
    <Button class="btn" on:click={prev}><i class="fa fa-arrow-left" /> Back</Button>
    {#if nstartCompleted}
      <Button class="btn btn-accent flex-grow" on:click={next}>Continue</Button>
    {:else}
      <Link class="btn btn-accent flex-grow" href={nstart} external target="">Use nstart</Link>
    {/if}
  </div>
</div>
