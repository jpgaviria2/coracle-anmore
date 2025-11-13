<script lang="ts">
  import {getTopicTagValues} from "@welshman/util"
  import Link from "src/partials/Link.svelte"
  import Chip from "src/partials/Chip.svelte"
  import {router} from "src/app/util/router"
  import {adminHashtagWhitelist} from "src/engine/admin"
  import {filterHashtags} from "src/util/nostr"

  export let note

  $: topics = getTopicTagValues(note.tags)
  $: filteredTopics = filterHashtags(topics, $adminHashtagWhitelist)
</script>

<div>
  {#each filteredTopics as topic}
    <Link modal href={router.at("topics").of(topic).toString()}>
      <Chip class="mb-2 mr-2 inline-block cursor-pointer">#{topic}</Chip>
    </Link>
  {/each}
</div>
