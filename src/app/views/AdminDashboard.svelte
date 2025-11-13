<script lang="ts">
  import {isCurrentUserAdmin} from "src/engine/admin"
  import {router} from "src/app/util/router"
  import Content from "src/partials/Content.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Button from "src/partials/Button.svelte"
  import Link from "src/partials/Link.svelte"

  document.title = "Admin Dashboard"
</script>

<Content size="lg">
  <FlexColumn class="gap-6">
    <div class="flex flex-col items-center justify-center">
      <Heading>Admin Dashboard</Heading>
      <p class="text-center text-neutral-400">Manage platform settings and moderation</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Link href="/admin/hashtags" class="btn btn-accent flex flex-col items-center gap-2 p-6">
        <i class="fa fa-hashtag text-3xl" />
        <span class="text-xl">Hashtag Management</span>
        <span class="text-sm text-neutral-300">Manage approved hashtags</span>
      </Link>
    </div>
  </FlexColumn>
</Content>

