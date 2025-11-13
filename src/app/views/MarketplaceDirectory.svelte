<script lang="ts">
  import {CLASSIFIED} from "@welshman/util"
  import {makeKindFeed, makeTagFeed, makeIntersectionFeed} from "@welshman/feeds"
  import {signer} from "@welshman/app"
  import Feed from "src/app/shared/Feed.svelte"
  import Content from "src/partials/Content.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Button from "src/partials/Button.svelte"
  import {router} from "src/app/util/router"
  import {makeFeed} from "src/domain"

  const marketplaceFeed = makeFeed({
    definition: makeIntersectionFeed(
      makeKindFeed(CLASSIFIED),
      makeTagFeed("#t", "item")
    ),
  })

  const createMarketplaceItem = () => router.at("marketplace/create").open()

  document.title = "Marketplace"
</script>

<Content size="lg">
  <FlexColumn class="gap-6">
    <div class="flex items-center justify-between">
      <Heading>Marketplace</Heading>
      {#if $signer}
        <Button class="btn btn-accent" on:click={createMarketplaceItem}>
          <i class="fa fa-plus" /> List Item for Sale
        </Button>
      {/if}
    </div>
    <p class="text-neutral-400">
      Browse items for sale from the community.
    </p>
    <Feed feed={marketplaceFeed} />
  </FlexColumn>
</Content>

