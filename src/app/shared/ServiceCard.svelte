<script lang="ts">
  import {fromPairs} from "@welshman/lib"
  import {getTagValue} from "@welshman/util"
  import Card from "src/partials/Card.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import CurrencySymbol from "src/partials/CurrencySymbol.svelte"
  import Chip from "src/partials/Chip.svelte"
  import {commaFormat} from "src/util/misc"
  import {router} from "src/app/util/router"

  export let note

  const {title, summary, location, category, service_type} = fromPairs(note.tags)
  const [price, code = "SAT"] = getTagValue("price", note.tags)?.slice(1) || []

  const openService = () => {
    router.at("notes").of(note.id).open()
  }
</script>

<Card interactive on:click={openService}>
  <FlexColumn class="gap-2">
    <div class="flex items-start justify-between gap-2">
      <div class="flex-grow">
        <h3 class="text-xl font-bold">{title}</h3>
        {#if category}
          <Chip small class="mt-1">{category}</Chip>
        {/if}
      </div>
      {#if price}
        <span class="whitespace-nowrap font-bold">
          <CurrencySymbol {code} />{commaFormat(price)}
        </span>
      {/if}
    </div>
    {#if summary}
      <p class="text-neutral-300">{summary}</p>
    {/if}
    {#if location}
      <div class="flex items-center gap-2 text-sm text-neutral-400">
        <i class="fa fa-location-dot" />
        {location}
      </div>
    {/if}
    {#if service_type}
      <div class="flex items-center gap-2 text-sm text-neutral-400">
        <i class="fa fa-clock" />
        {service_type}
      </div>
    {/if}
  </FlexColumn>
</Card>

