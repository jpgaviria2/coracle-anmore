<script lang="ts">
  import {adminHashtagWhitelist, isCurrentUserAdmin, saveAdminHashtagWhitelist} from "src/engine/admin"
  import {signer} from "@welshman/app"
  import {showInfo, showWarning} from "src/partials/Toast.svelte"
  import Button from "src/partials/Button.svelte"
  import Content from "src/partials/Content.svelte"
  import Field from "src/partials/Field.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Input from "src/partials/Input.svelte"
  import Chip from "src/partials/Chip.svelte"

  let newHashtag = ""
  let searchQuery = ""

  $: whitelist = Array.from($adminHashtagWhitelist)
    .filter(h => !searchQuery || h.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort()

  const addHashtag = () => {
    if (!newHashtag.trim()) return

    const hashtag = newHashtag.trim().toLowerCase().replace(/^#/, "")
    
    if ($adminHashtagWhitelist.has(hashtag)) {
      showWarning("Hashtag already in whitelist")
      return
    }

    const updatedWhitelist = new Set($adminHashtagWhitelist)
    updatedWhitelist.add(hashtag)
    
    adminHashtagWhitelist.set(updatedWhitelist)
    saveAdminHashtagWhitelist(updatedWhitelist)
    newHashtag = ""
    showInfo("Hashtag added to whitelist. Update VITE_ADMIN_HASHTAG_WHITELIST in .env to persist across deployments.")
  }

  const removeHashtag = (hashtag: string) => {
    const updatedWhitelist = new Set($adminHashtagWhitelist)
    updatedWhitelist.delete(hashtag)
    
    adminHashtagWhitelist.set(updatedWhitelist)
    saveAdminHashtagWhitelist(updatedWhitelist)
    showInfo("Hashtag removed from whitelist. Update VITE_ADMIN_HASHTAG_WHITELIST in .env to persist across deployments.")
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
        <Button class="btn btn-accent" on:click={addHashtag} disabled={!$signer}>
          Add
        </Button>
      </div>
      <p slot="info">
        Add hashtags that should be visible in the feed. Posts without any whitelisted hashtags will be hidden.
        Changes are saved locally. Update VITE_ADMIN_HASHTAG_WHITELIST in .env to persist across deployments.
      </p>
    </Field>

    {#if $adminHashtagWhitelist.size > 5}
      <Field label="Search Hashtags">
        <Input
          type="text"
          bind:value={searchQuery}
          placeholder="Search hashtags..."
        />
      </Field>
    {/if}

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
                on:click={() => removeHashtag(hashtag)}>
                ×
              </button>
            </Chip>
          {/each}
        </div>
      {/if}
    </Field>
  </FlexColumn>
</Content>

