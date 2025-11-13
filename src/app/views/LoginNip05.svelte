<script lang="ts">
  import {onMount} from "svelte"
  import {loginWithNip01} from "@welshman/app"
  import {nsecDecode} from "src/util/nostr"
  import {parsePubkey} from "src/util/nostr"
  import {loadEncryptedNsec, saveEncryptedNsec, hasEncryptedNsec} from "src/util/password"
  import {showWarning, showInfo} from "src/partials/Toast.svelte"
  import Input from "src/partials/Input.svelte"
  import Button from "src/partials/Button.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Field from "src/partials/Field.svelte"
  import Link from "src/partials/Link.svelte"
  import {router} from "src/app/util/router"
  import {boot} from "src/app/state"
  import {env} from "src/engine"

  let nip05 = ""
  let password = ""
  let loading = false
  let savingNsec = false
  let nsecToSave = ""

  const login = async () => {
    if (!nip05.trim()) {
      return showWarning("Please enter your NIP-05 identifier")
    }

    if (!password) {
      return showWarning("Please enter your password")
    }

    loading = true

    try {
      // Resolve NIP-05 to pubkey
      // Note: This will fail with CORS/404 if NIP-05 domain isn't configured yet
      // That's OK - we'll just prompt for nsec entry instead
      let pubkey
      try {
        pubkey = await parsePubkey(nip05.trim())
      } catch (e) {
        // NIP-05 lookup failed (domain not configured or CORS issue)
        // This is expected during development - prompt for nsec entry
        console.warn("NIP-05 lookup failed (expected if domain not configured):", e)
        loading = false
        savingNsec = true
        showInfo("NIP-05 domain not configured yet. Please enter your nsec to save it securely.")
        return
      }
      
      if (!pubkey) {
        // NIP-05 exists but couldn't resolve - prompt for nsec
        loading = false
        savingNsec = true
        showInfo("Could not resolve NIP-05 identifier. Please enter your nsec to save it securely.")
        return
      }

      // Check if we have encrypted nsec stored
      const encryptedNsec = hasEncryptedNsec(nip05.trim())
      
      if (encryptedNsec) {
        // Try to decrypt and login
        const nsec = await loadEncryptedNsec(nip05.trim(), password)
        
        if (!nsec) {
          return showWarning("Invalid password")
        }

        // Decode nsec bech32 string to hex for login
        const decoded = nsecDecode(nsec)
        loginWithNip01(decoded)
        boot()
      } else {
        // No encrypted nsec, prompt user to enter nsec and save it
        savingNsec = true
        showInfo("No saved credentials found. Please enter your nsec to save it securely.")
      }
    } catch (e) {
      showWarning("Login failed: " + e.message)
    } finally {
      loading = false
    }
  }

  const saveNsecAndLogin = async () => {
    if (!nsecToSave.trim()) {
      return showWarning("Please enter your nsec")
    }

    if (!password) {
      return showWarning("Please enter a password to encrypt your nsec")
    }

    loading = true

    try {
      // Validate nsec
      const decoded = nsecDecode(nsecToSave.trim())
      
      if (!decoded) {
        return showWarning("Invalid nsec format")
      }
      
      // Save encrypted nsec
      await saveEncryptedNsec(nip05.trim(), nsecToSave.trim(), password)
      
      // Login
      loginWithNip01(decoded)
      boot()
    } catch (e) {
      showWarning("Failed to save credentials: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      loading = false
      savingNsec = false
    }
  }

  const cancelSave = () => {
    savingNsec = false
    nsecToSave = ""
  }

  document.title = "Log In with NIP-05"
</script>

<FlexColumn narrow large>
  <div class="text-center">
    <Heading>Log In with NIP-05</Heading>
    <p class="text-neutral-400">
      Use your @{env.NIP05_DOMAIN} identifier to log in
    </p>
  </div>

  {#if !savingNsec}
    <Field label="NIP-05 Identifier">
      <Input
        type="text"
        bind:value={nip05}
        placeholder="user@{env.NIP05_DOMAIN}"
        on:keydown={(e) => e.key === "Enter" && login()}
      />
      <p slot="info">
        Enter your NIP-05 identifier (e.g., user@{env.NIP05_DOMAIN})
      </p>
    </Field>

    <Field label="Password">
      <Input
        type="password"
        bind:value={password}
        placeholder="Enter your password"
        on:keydown={(e) => e.key === "Enter" && login()}
      />
      <p slot="info">
        {hasEncryptedNsec(nip05.trim()) 
          ? "Enter the password you used to encrypt your nsec"
          : "Enter a password to encrypt and save your nsec"}
      </p>
    </Field>

    <Button class="btn btn-accent" on:click={login} disabled={loading}>
      {loading ? "Logging in..." : "Log In"}
    </Button>
  {:else}
    <Field label="Enter your nsec">
      <Input
        type="password"
        bind:value={nsecToSave}
        placeholder="nsec1..."
      />
      <p slot="info">
        Your nsec will be encrypted with your password and stored locally. 
        You'll only need to enter your NIP-05 and password next time.
      </p>
    </Field>

    <div class="flex gap-2">
      <Button class="btn btn-accent flex-grow" on:click={saveNsecAndLogin} disabled={loading}>
        {loading ? "Saving..." : "Save & Log In"}
      </Button>
      <Button class="btn" on:click={cancelSave}>Cancel</Button>
    </div>
  {/if}

  <span class="text-center text-sm text-neutral-400">
    Don't have a NIP-05? 
    <Link class="underline" href="/signup">Create an account</Link>
  </span>
</FlexColumn>

