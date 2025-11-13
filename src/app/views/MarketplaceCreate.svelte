<script lang="ts">
  import {now} from "@welshman/lib"
  import {own, hash} from "@welshman/signer"
  import {Router, addMinimalFallbacks} from "@welshman/router"
  import {makeEvent, CLASSIFIED} from "@welshman/util"
  import {session, publishThunk} from "@welshman/app"
  import {writable} from "svelte/store"
  import {makePow} from "src/util/pow"
  import type {ProofOfWork} from "src/util/pow"
  import {warn} from "src/util/logger"
  import Button from "src/partials/Button.svelte"
  import Content from "src/partials/Content.svelte"
  import Field from "src/partials/Field.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Input from "src/partials/Input.svelte"
  import {showInfo, showPublishInfo, showToast, showWarning} from "src/partials/Toast.svelte"
  import EditorContent from "src/app/editor/EditorContent.svelte"
  import {makeEditor} from "src/app/editor"
  import {router} from "src/app/util/router"
  import {env, getClientTags, sign, userSettings, broadcastUserRelays} from "src/engine"

  const uploading = writable(false)
  const nsecWarning = writable(null)

  const bypassNsecWarning = () => {
    nsecWarning.set(null)
    onSubmit({skipNsecWarning: true})
  }

  const onSubmit = async ({skipNsecWarning = false} = {}) => {
    if ($uploading || publishing) return

    const content = editor.getText({blockSeparator: "\n"}).trim()

    if (!content) return showWarning("Please provide a description.")
    if (!title.trim()) return showWarning("Please provide a title.")
    if (!skipNsecWarning && content.match(/\bnsec1.+/)) return nsecWarning.set(true)

    const tags = [
      ["title", title.trim()],
      ["summary", summary.trim() || title.trim()],
      ["t", "item"], // Mark as marketplace item
      ["t", env.DEFAULT_HASHTAG || "anmore"], // Add default hashtag
      ...getClientTags(),
    ]

    if (location.trim()) {
      tags.push(["location", location.trim()])
    }

    if (price.trim()) {
      tags.push(["price", price.trim(), "SAT"])
    }

    if (category.trim()) {
      tags.push(["category", category.trim()])
    }

    if (condition.trim()) {
      tags.push(["condition", condition.trim()])
    }

    const created_at = now()
    const ownedEvent = own(makeEvent(CLASSIFIED, {content, tags, created_at}), $session.pubkey)

    let hashedEvent = hash(ownedEvent)

    if (powDifficulty > 0) {
      publishing = "pow"
      pow?.worker.terminate()
      pow = makePow(ownedEvent, powDifficulty)
      hashedEvent = await pow.result
    }

    publishing = "signing"

    const signedEvent = await sign(hashedEvent, {})
    const relays = Router.get().PublishEvent(signedEvent).policy(addMinimalFallbacks).getUrls()

    router.clearModals()

    const thunk = publishThunk({relays, event: signedEvent, delay: $userSettings.send_delay})

    if ($userSettings.send_delay > 0) {
      await showToast({
        type: "delay",
        timeout: $userSettings.send_delay / 1000,
        onCancel: () => {
          router.at("marketplace/create").open()
        },
      })
    }

    showPublishInfo(thunk)
    broadcastUserRelays(relays)
    publishing = null
  }

  const editor = makeEditor({
    autofocus: false,
    content: "",
    submit: onSubmit,
    onUploadError: task => showWarning(`Failed to upload file: ${task.error}`),
    uploading,
  })

  let title = ""
  let summary = ""
  let location = ""
  let price = ""
  let category = ""
  let condition = ""
  let publishing: "signing" | "pow" | null = null
  let pow: ProofOfWork
  let powDifficulty = 0

  document.title = "List Item for Sale"
</script>

<form on:submit|preventDefault={() => onSubmit()}>
  <Content size="lg">
    <FlexColumn class="gap-4">
      <Heading>List Item for Sale</Heading>

      <Field label="Item Title *">
        <Input type="text" bind:value={title} placeholder="e.g., Vintage Camera" />
      </Field>

      <Field label="Summary">
        <Input type="text" bind:value={summary} placeholder="Brief description" />
      </Field>

      <Field label="Item Description *">
        <div class="rounded-xl border border-solid border-neutral-600 bg-white p-3 text-black">
          <EditorContent {editor} class="min-h-24" />
        </div>
      </Field>

      <Field label="Category">
        <Input type="text" bind:value={category} placeholder="e.g., Electronics, Books, Clothing" />
      </Field>

      <Field label="Condition">
        <Input type="text" bind:value={condition} placeholder="e.g., New, Like New, Used, Fair" />
      </Field>

      <Field label="Location">
        <Input type="text" bind:value={location} placeholder="City, Country or Shipping Available" />
      </Field>

      <Field label="Price (in sats)">
        <Input type="text" bind:value={price} placeholder="e.g., 50000" />
      </Field>

      <div class="flex gap-2">
        <Button
          type="submit"
          class="btn btn-accent flex-grow"
          disabled={$uploading || Boolean(publishing)}>
          {#if $uploading || !!publishing}
            {#if publishing === "signing"}
              Publishing...
            {:else if publishing === "pow"}
              Generating Work...
            {:else}
              Uploading media...
            {/if}
          {:else}
            Publish Marketplace Listing
          {/if}
        </Button>
      </div>
    </FlexColumn>
  </Content>
</form>

