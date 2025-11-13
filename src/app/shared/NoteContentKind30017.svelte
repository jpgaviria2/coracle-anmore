<script lang="ts">
  import cx from "classnames"
  import {deriveIsDeletedByAddress} from "@welshman/store"
  import {fromPairs} from "@welshman/lib"
  import {getTagValue} from "@welshman/util"
  import {repository} from "@welshman/app"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import CurrencySymbol from "src/partials/CurrencySymbol.svelte"
  import Chip from "src/partials/Chip.svelte"
  import NoteContentTopics from "src/app/shared/NoteContentTopics.svelte"
  import NoteContentKind1 from "src/app/shared/NoteContentKind1.svelte"
  import {commaFormat} from "src/util/misc"

  export let note
  export let showMedia = false
  export let showEntire = false

  const {title, location, status} = fromPairs(note.tags)
  const priceTag = getTagValue("price", note.tags)
  const price = priceTag ? priceTag[1] : null
  const currencyTag = getTagValue("currency", note.tags)
  const currency = currencyTag ? currencyTag[1] : "SAT"
  const deleted = deriveIsDeletedByAddress(repository, note)
</script>

<FlexColumn>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between gap-2 text-xl">
      <div class="flex items-center gap-3">
        <strong class={cx({"line-through": $deleted})}>
          {title || "Untitled Listing"}
        </strong>
        {#if $deleted}
          <Chip danger small>Deleted</Chip>
        {:else if status === "sold"}
          <Chip danger small>Sold</Chip>
        {:else}
          <Chip small>Available</Chip>
        {/if}
      </div>
      {#if price}
        <span class="whitespace-nowrap">
          <CurrencySymbol code={currency} />{commaFormat(parseInt(price) || 0)}
          {currency}
        </span>
      {/if}
    </div>
    {#if location}
      <div class="flex items-center gap-2 text-sm text-neutral-300">
        <i class="fa fa-location-dot" />
        {location}
      </div>
    {/if}
    <div class="h-px bg-neutral-600" />
    <NoteContentKind1 {note} {showEntire} {showMedia} />
  </div>
  <NoteContentTopics {note} />
</FlexColumn>

