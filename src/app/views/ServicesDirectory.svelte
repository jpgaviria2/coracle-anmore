<script lang="ts">
  import {CLASSIFIED} from "@welshman/util"
  import {makeScopeFeed, Scope} from "@welshman/feeds"
  import {signer} from "@welshman/app"
  import Feed from "src/app/shared/Feed.svelte"
  import Content from "src/partials/Content.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Button from "src/partials/Button.svelte"
  import {router} from "src/app/util/router"
  import {makeFeed} from "src/domain"

  const servicesFeed = makeFeed({
    definition: makeScopeFeed({
      scope: Scope.Kind,
      kinds: [CLASSIFIED],
      filters: [{kinds: [CLASSIFIED], "#t": ["service"]}],
    }),
  })

  const createService = () => router.at("services/create").open()

  document.title = "Services Directory"
</script>

<Content size="lg">
  <FlexColumn class="gap-6">
    <div class="flex items-center justify-between">
      <Heading>Services Directory</Heading>
      {#if $signer}
        <Button class="btn btn-accent" on:click={createService}>
          <i class="fa fa-plus" /> Create Service Listing
        </Button>
      {/if}
    </div>
    <p class="text-neutral-400">
      Browse business and service listings from the community.
    </p>
    <Feed feed={servicesFeed} />
  </FlexColumn>
</Content>

