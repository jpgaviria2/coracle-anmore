<script lang="ts">
  import cx from "classnames"
  import {deriveIsDeletedByAddress} from "@welshman/store"
  import {fromPairs} from "@welshman/lib"
  import {getTagValue} from "@welshman/util"
  import {repository} from "@welshman/app"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Chip from "src/partials/Chip.svelte"
  import NoteContentTopics from "src/app/shared/NoteContentTopics.svelte"
  import NoteContentKind1 from "src/app/shared/NoteContentKind1.svelte"
  import {commaFormat} from "src/util/misc"
  import {parseJson} from "src/util/misc"

  export let note
  export let showMedia = false
  export let showEntire = false

  // Try to parse JSON from content field (for compatibility with other service clients)
  let jsonData = null
  try {
    if (note.content && note.content.trim().startsWith("{")) {
      jsonData = parseJson(note.content)
    }
  } catch (e) {
    // Not JSON, ignore
  }

  // Get data from tags (our format) or from JSON (other clients' format)
  const {service_name: serviceNameTag, location: locationTag, rate_type, availability: availabilityTag, contact} = fromPairs(note.tags)
  const rateTag = getTagValue("rate", note.tags)

  const serviceName = jsonData?.name || serviceNameTag || jsonData?.service_name || "Untitled Service"
  const location = jsonData?.location || locationTag || null
  const rate = jsonData?.rate || jsonData?.price || (rateTag ? rateTag[1] : null)
  const availability = jsonData?.availability || availabilityTag || null
  const description = jsonData?.description || null

  const deleted = deriveIsDeletedByAddress(repository, note)
</script>

<FlexColumn>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between gap-2 text-xl">
      <div class="flex items-center gap-3">
        <strong class={cx({"line-through": $deleted})}>
          {serviceName}
        </strong>
        {#if $deleted}
          <Chip danger small>Deleted</Chip>
        {:else}
          <Chip small>Available</Chip>
        {/if}
      </div>
      {#if rate}
        <span class="whitespace-nowrap font-bold">
          {rate_type ? `${rate_type}: ` : ""}
          {commaFormat(parseInt(rate) || 0)} {rate_type === "hourly" ? "/hr" : ""}
        </span>
      {/if}
    </div>
    {#if location}
      <div class="flex items-center gap-2 text-sm text-neutral-300">
        <i class="fa fa-location-dot" />
        {location}
      </div>
    {/if}
    {#if availability}
      <div class="flex items-center gap-2 text-sm text-neutral-300">
        <i class="fa fa-clock" />
        {availability}
      </div>
    {/if}
    <div class="h-px bg-neutral-600" />
    {#if jsonData}
      <!-- If content is JSON, show formatted description instead of raw JSON -->
      <div class="text-neutral-200">
        {#if description}
          <p class="whitespace-pre-wrap">{description}</p>
        {/if}
        {#if jsonData.images && jsonData.images.length > 0}
          <div class="mt-2 text-sm text-neutral-400">
            <i class="fa fa-image" /> {jsonData.images.length} image{jsonData.images.length > 1 ? "s" : ""} available
          </div>
        {/if}
        {#if jsonData.stall_id}
          <div class="mt-2 text-xs text-neutral-500">
            Stall ID: {jsonData.stall_id}
          </div>
        {/if}
      </div>
    {:else}
      <NoteContentKind1 {note} {showEntire} {showMedia} />
    {/if}
  </div>
  <NoteContentTopics {note} />
</FlexColumn>

