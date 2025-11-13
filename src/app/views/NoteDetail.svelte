<script lang="ts">
  import {isMobile} from "src/util/html"
  import {fly} from "src/util/transition"
  import {getIdOrAddress} from "@welshman/util"
  import Spinner from "src/partials/Spinner.svelte"
  import FeedItem from "src/app/shared/FeedItem.svelte"
  import {deriveEvent} from "src/engine"

  export let id = null
  export let address = null
  export let relays = []
  export let depth = isMobile ? 2 : 5
  // Accept but ignore entity prop (decoded from route parameter)
  export let entity = undefined
  // Accept but ignore other props that may be decoded from entity
  export let identifier = undefined
  export let pubkey = undefined
  export let kind = undefined

  const event = deriveEvent(id || address, {relays})
</script>

{#if $event}
  <div in:fly={{y: 20}}>
    <FeedItem topLevel showLoading anchor={getIdOrAddress($event)} note={$event} {depth} {relays} />
  </div>
{:else}
  <Spinner />
{/if}
