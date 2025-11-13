<script lang="ts">
  import {onMount} from "svelte"
  import {get} from "svelte/store"
  import {adminHashtagWhitelist, isCurrentUserAdmin} from "src/engine/admin"
  import {signer, pubkey} from "@welshman/app"
  import {makeEvent, APP_DATA} from "@welshman/util"
  import {signAndPublish} from "src/engine/commands"
  import {showInfo, showWarning} from "src/partials/Toast.svelte"
  import Button from "src/partials/Button.svelte"
  import Content from "src/partials/Content.svelte"
  import Field from "src/partials/Field.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Input from "src/partials/Input.svelte"
  import Chip from "src/partials/Chip.svelte"
  import {appDataKeys} from "src/util/nostr"

  let newHashtag = ""
  let loading = false

  $: whitelist = Array.from($adminHashtagWhitelist).sort()

  const addHashtag = async () => {
    if (!newHashtag.trim()) return

    const hashtag = newHashtag.trim().toLowerCase().replace(/^#/, "")
    
    if ($adminHashtagWhitelist.has(hashtag)) {
      showWarning("Hashtag already in whitelist")
      return
    }

    loading = true
    const updatedWhitelist = new Set($adminHashtagWhitelist)
    updatedWhitelist.add(hashtag)
    
    try {
      await publishWhitelist(updatedWhitelist)
      adminHashtagWhitelist.set(updatedWhitelist)
      newHashtag = ""
      showInfo("Hashtag added to whitelist")
    } catch (e) {
      showWarning("Failed to add hashtag: " + e.message)
    } finally {
      loading = false
    }
  }

  const removeHashtag = async (hashtag: string) => {
    loading = true
    const updatedWhitelist = new Set($adminHashtagWhitelist)
    updatedWhitelist.delete(hashtag)
    
    try {
      await publishWhitelist(updatedWhitelist)
      adminHashtagWhitelist.set(updatedWhitelist)
      showInfo("Hashtag removed from whitelist")
    } catch (e) {
      showWarning("Failed to remove hashtag: " + e.message)
    } finally {
      loading = false
    }
  }

  const publishWhitelist = async (whitelist: Set<string>) => {
    const whitelistArray = Array.from(whitelist)
    const event = makeEvent(APP_DATA, {
      content: JSON.stringify({hashtagWhitelist: whitelistArray}),
      tags: [["d", appDataKeys.ADMIN_HASHTAG_WHITELIST]],
    })

    await signAndPublish(event)
  }

  document.title = "Admin - Hashtag Management"
</script>

<Content size="lg">
  <FlexColumn class="gap-6">
    <div class="flex flex-col items-center justify-center">
      <Heading>Hashtag Whitelist Management</Heading>
      <p class="text-center text-neutral-400">
        Only hashtags in the whitelist will be displayed. All other hashtags will be hidden.
      </p>
    </div>

    <Field label="Add Hashtag">
      <div class="flex gap-2">
        <Input
          type="text"
          bind:value={newHashtag}
          placeholder="Enter hashtag (without #)"
          on:keydown={(e) => e.key === "Enter" && addHashtag()}
        />
        <Button class="btn btn-accent" on:click={addHashtag} disabled={loading || !$signer}>
          Add
        </Button>
      </div>
    </Field>

    <Field label="Whitelisted Hashtags ({whitelist.length})">
      {#if whitelist.length === 0}
        <p class="text-neutral-400">No hashtags in whitelist. All hashtags will be shown.</p>
      {:else}
        <div class="flex flex-wrap gap-2">
          {#each whitelist as hashtag}
            <Chip class="flex items-center gap-2">
              #{hashtag}
              <button
                class="ml-1 text-accent hover:text-accent-d"
                on:click={() => removeHashtag(hashtag)}
                disabled={loading}>
                ×
              </button>
            </Chip>
          {/each}
        </div>
      {/if}
    </Field>
  </FlexColumn>
</Content>

