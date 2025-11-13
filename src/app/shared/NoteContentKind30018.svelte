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

  export let note
  export let showMedia = false
  export let showEntire = false

  const {service_name, location, rate_type, availability, contact} = fromPairs(note.tags)
  const rateTag = getTagValue("rate", note.tags)
  const rate = rateTag ? rateTag[1] : null
  const deleted = deriveIsDeletedByAddress(repository, note)
</script>

<FlexColumn>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between gap-2 text-xl">
      <div class="flex items-center gap-3">
        <strong class={cx({"line-through": $deleted})}>
          {service_name || "Untitled Service"}
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
    <NoteContentKind1 {note} {showEntire} {showMedia} />
  </div>
  <NoteContentTopics {note} />
</FlexColumn>

