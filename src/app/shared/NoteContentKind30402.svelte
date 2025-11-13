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
  import NoteContentLinks from "src/app/shared/NoteContentLinks.svelte"
  import {commaFormat} from "src/util/misc"
  import {parseJson} from "src/util/misc"

  export let note
  export let showMedia = true // Enable images by default for classifieds/marketplace
  export let showEntire = false

  // Try to parse JSON from content field (for compatibility with Plebeian Market and other clients)
  let jsonData = null
  try {
    if (note.content && note.content.trim().startsWith("{")) {
      jsonData = parseJson(note.content)
    }
  } catch (e) {
    // Not JSON, ignore
  }

  // Get data from tags (our format) or from JSON (Plebeian Market/NIP-99 format)
  const {title: titleTag, summary, location: locationTag, status} = fromPairs(note.tags)
  const priceTag = getTagValue("price", note.tags)

  const title = jsonData?.name || titleTag || jsonData?.title || "Untitled Listing"
  const location = jsonData?.location || locationTag || null
  const description = jsonData?.description || null
  // Extract price from JSON or tags
  const price = jsonData?.price || jsonData?.cost || (priceTag ? priceTag[1] : null)
  const currency = jsonData?.currency?.toUpperCase() || (priceTag ? priceTag[2] : "SAT")
  // Extract image URLs from JSON (Plebeian Market format)
  const imageUrls = jsonData?.images ? (Array.isArray(jsonData.images) ? jsonData.images : [jsonData.images]) : []

  const deleted = deriveIsDeletedByAddress(repository, note)
</script>

<FlexColumn>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between gap-2 text-xl">
      <div class="flex items-center gap-3">
        <strong class={cx({"line-through": $deleted})}>
          {title}
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
    {#if summary && summary !== note.content && !jsonData}
      <p class="text-neutral-200">{summary}</p>
    {/if}
    <div class="h-px bg-neutral-600" />
    {#if jsonData}
      <!-- If content is JSON (Plebeian Market/NIP-99 format), show formatted content -->
      <div class="text-neutral-200">
        {#if description}
          <p class="whitespace-pre-wrap mb-4">{description}</p>
        {/if}
        {#if imageUrls.length > 0}
          <div class="my-4">
            <NoteContentLinks urls={imageUrls} {showMedia} />
          </div>
        {/if}
        {#if jsonData.stall_id}
          <div class="mt-2 text-xs text-neutral-500">
            Stall ID: {jsonData.stall_id}
          </div>
        {/if}
        {#if jsonData.shipping && jsonData.shipping.length > 0}
          <div class="mt-2 text-sm text-neutral-400">
            <i class="fa fa-truck" /> {jsonData.shipping.length} shipping option{jsonData.shipping.length > 1 ? "s" : ""} available
          </div>
        {/if}
      </div>
    {:else}
      <NoteContentKind1 {note} {showEntire} {showMedia} />
    {/if}
  </div>
  <NoteContentTopics {note} />
</FlexColumn>
