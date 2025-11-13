<script lang="ts">
  import {onMount} from "svelte"
  import {get} from "svelte/store"
  import {isCurrentUserAdmin, adminHashtagWhitelist, getAdminPubkeys} from "src/engine/admin"
  import {repository} from "@welshman/app"
  import {getTopicTagValues} from "@welshman/util"
  import {router} from "src/app/util/router"
  import Content from "src/partials/Content.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Button from "src/partials/Button.svelte"
  import Link from "src/partials/Link.svelte"
  import {env} from "src/engine"

  let totalNotes = 0
  let filteredNotes = 0
  let whitelistSize = 0

  onMount(() => {
    // Calculate statistics
    const whitelist = get(adminHashtagWhitelist)
    whitelistSize = whitelist.size
    
    // Count notes with hashtags
    const allNotes = repository.query([{kinds: [1]}])
    totalNotes = allNotes.length
    
    if (whitelist.size > 0) {
      const adminPubkeys = getAdminPubkeys()
      filteredNotes = allNotes.filter(note => {
        const topics = getTopicTagValues(note.tags)
        return topics.some(topic => whitelist.has(topic.toLowerCase())) || adminPubkeys.has(note.pubkey)
      }).length
    } else {
      filteredNotes = totalNotes
    }
  })

  $: whitelist = Array.from(get(adminHashtagWhitelist)).sort()
  $: defaultHashtag = env.DEFAULT_HASHTAG || "anmore"

  document.title = "Admin Dashboard"
</script>

<Content size="lg">
  <FlexColumn class="gap-6">
    <div class="flex flex-col items-center justify-center">
      <Heading>Admin Dashboard</Heading>
      <p class="text-center text-neutral-400">Manage platform settings and moderation</p>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-neutral-600 bg-neutral-800 p-4">
        <div class="text-2xl font-bold">{whitelistSize}</div>
        <div class="text-sm text-neutral-400">Whitelisted Hashtags</div>
      </div>
      <div class="rounded-lg border border-neutral-600 bg-neutral-800 p-4">
        <div class="text-2xl font-bold">{totalNotes}</div>
        <div class="text-sm text-neutral-400">Total Notes</div>
      </div>
      <div class="rounded-lg border border-neutral-600 bg-neutral-800 p-4">
        <div class="text-2xl font-bold">{filteredNotes}</div>
        <div class="text-sm text-neutral-400">Visible Notes</div>
      </div>
    </div>

    <!-- Default Hashtag Info -->
    <div class="rounded-lg border border-blue-600 bg-blue-900/20 p-4">
      <div class="flex items-center gap-2">
        <i class="fa fa-info-circle text-blue-400" />
        <span class="font-semibold text-blue-400">Default Hashtag</span>
      </div>
      <p class="mt-2 text-sm text-neutral-300">
        All new content automatically includes the hashtag: <strong>#{defaultHashtag}</strong>
      </p>
      {#if whitelist.length > 0 && !whitelist.includes(defaultHashtag.toLowerCase())}
        <p class="mt-2 text-sm text-yellow-400">
          ⚠️ Warning: Default hashtag is not in whitelist. New posts may be filtered.
        </p>
      {/if}
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link href="/admin/hashtags" class="btn btn-accent flex flex-col items-center gap-2 p-6">
        <i class="fa fa-hashtag text-3xl" />
        <span class="text-xl">Hashtag Management</span>
        <span class="text-sm text-neutral-300">Manage approved hashtags</span>
      </Link>
    </div>
  </FlexColumn>
</Content>

