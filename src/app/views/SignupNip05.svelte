<script lang="ts">
  import {onMount} from "svelte"
  import {loginWithNip01} from "@welshman/app"
  import {generateSecretKey, getPublicKey} from "nostr-tools"
  import * as nip19 from "nostr-tools/nip19"
  import {nsecEncode} from "src/util/nostr"
  import {saveEncryptedNsec} from "src/util/password"
  import {showWarning, showInfo, showSuccess} from "src/partials/Toast.svelte"
  import Input from "src/partials/Input.svelte"
  import Button from "src/partials/Button.svelte"
  import FlexColumn from "src/partials/FlexColumn.svelte"
  import Heading from "src/partials/Heading.svelte"
  import Field from "src/partials/Field.svelte"
  import Link from "src/partials/Link.svelte"
  import CopyValue from "src/partials/CopyValue.svelte"
  import {router} from "src/app/util/router"
  import {boot} from "src/app/state"
  import {env} from "src/engine"

  let username = ""
  let email = ""
  let password = ""
  let confirmPassword = ""
  let loading = false
  let keyGenerated = false
  let nsec = ""
  let npub = ""
  let showEmailOption = false
  let emailSent = false

  const generateKeys = async () => {
    if (!username.trim()) {
      return showWarning("Please enter a username")
    }

    if (!password) {
      return showWarning("Please enter a password")
    }

    if (password !== confirmPassword) {
      return showWarning("Passwords do not match")
    }

    if (password.length < 8) {
      return showWarning("Password must be at least 8 characters")
    }

    loading = true

    try {
      // Generate new key pair
      const privateKey = generateSecretKey() // Returns Uint8Array
      const publicKey = getPublicKey(privateKey)

      // Encode to nsec and npub
      // nsecEncode expects hex string, but generateSecretKey returns Uint8Array
      // So we encode directly with nip19.nsecEncode
      nsec = nip19.nsecEncode(privateKey)
      npub = nip19.npubEncode(publicKey)

      keyGenerated = true
      showInfo("Keys generated! Save your nsec securely.")
    } catch (e) {
      showWarning("Failed to generate keys: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      loading = false
    }
  }

  const sendEmail = async () => {
    if (!email.trim()) {
      return showWarning("Please enter your email address")
    }

    if (!nsec) {
      return showWarning("Keys not generated yet")
    }

    loading = true

    try {
      // Create email content
      const subject = encodeURIComponent(`Your Anmore Account Credentials`)
      const body = encodeURIComponent(`Hello ${username},

Your Anmore account has been created!

NIP-05: ${username}@${env.NIP05_DOMAIN}
Public Key (npub): ${npub}

IMPORTANT: Your private key (nsec) is below. Keep this SECRET and never share it with anyone:

${nsec}

To log in:
1. Go to https://anmore.me
2. Click "Log In with NIP-05"
3. Enter: ${username}@${env.NIP05_DOMAIN}
4. Enter your password: ${password}

Store this email securely. If you lose your nsec, you cannot recover your account.

Welcome to Anmore!`)

      // Open mailto link
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
      
      emailSent = true
      showSuccess("Email opened. Please send it to yourself to save your credentials.")
    } catch (e) {
      showWarning("Failed to open email: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      loading = false
    }
  }

  const saveAndLogin = async () => {
    if (!nsec || !password) {
      return showWarning("Please generate keys first")
    }

    loading = true

    try {
      const nip05 = `${username.trim()}@${env.NIP05_DOMAIN}`
      
      // Save encrypted nsec
      await saveEncryptedNsec(nip05, nsec, password)

      // Login
      loginWithNip01(nsec)
      boot()
      
      showSuccess("Account created! Welcome to Anmore.")
      
      // Navigate to onboarding
      router.at("signup").cx({stage: "follows", nstartCompleted: true}).open()
    } catch (e) {
      showWarning("Failed to save credentials: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      loading = false
    }
  }

  const skipEmail = () => {
    showEmailOption = false
  }

  document.title = "Create Account with NIP-05"
</script>

<FlexColumn narrow large>
  <div class="text-center">
    <Heading>Create Your Account</Heading>
    <p class="text-neutral-400">
      Get started with a @{env.NIP05_DOMAIN} identifier
    </p>
  </div>

  {#if !keyGenerated}
    <Field label="Username">
      <Input
        type="text"
        bind:value={username}
        placeholder="yourname"
        on:keydown={(e) => e.key === "Enter" && generateKeys()}
      />
      <p slot="info">
        Choose a username. Your NIP-05 will be: <strong>{username || "yourname"}@{env.NIP05_DOMAIN}</strong>
      </p>
    </Field>

    <Field label="Password">
      <Input
        type="password"
        bind:value={password}
        placeholder="Enter a secure password"
        on:keydown={(e) => e.key === "Enter" && generateKeys()}
      />
      <p slot="info">
        This password encrypts your private key. Choose a strong password.
      </p>
    </Field>

    <Field label="Confirm Password">
      <Input
        type="password"
        bind:value={confirmPassword}
        placeholder="Confirm your password"
        on:keydown={(e) => e.key === "Enter" && generateKeys()}
      />
    </Field>

    <Button class="btn btn-accent" on:click={generateKeys} disabled={loading}>
      {loading ? "Generating Keys..." : "Generate Keys"}
    </Button>
  {:else}
    <div class="rounded-lg border border-neutral-600 bg-neutral-800 p-4">
      <p class="mb-4 text-lg font-bold">Keys Generated Successfully!</p>
      <p class="mb-4 text-sm text-neutral-400">
        Your NIP-05 identifier: <strong>{username}@{env.NIP05_DOMAIN}</strong>
      </p>
      
      <CopyValue label="Public Key (npub)" value={npub} />
      
      <div class="mt-4 rounded-lg border border-yellow-600 bg-yellow-900/20 p-3">
        <p class="mb-2 text-sm font-bold text-yellow-400">⚠️ IMPORTANT: Save Your Private Key</p>
        <CopyValue label="Private Key (nsec) - KEEP SECRET" value={nsec} />
        <p class="mt-2 text-xs text-neutral-400">
          This is your private key. If you lose it, you cannot recover your account. 
          Store it securely and never share it with anyone.
        </p>
      </div>
    </div>

    {#if !showEmailOption && !emailSent}
      <div class="flex flex-col gap-2">
        <Button class="btn btn-accent" on:click={() => showEmailOption = true}>
          <i class="fa fa-envelope" /> Send nsec by Email
        </Button>
        <Button class="btn" on:click={saveAndLogin}>
          I've Saved My Keys - Continue
        </Button>
      </div>
    {:else if showEmailOption && !emailSent}
      <Field label="Your Email Address">
        <Input
          type="email"
          bind:value={email}
          placeholder="your@email.com"
        />
        <p slot="info">
          We'll open your email client with your credentials. Send it to yourself to save securely.
        </p>
      </Field>
      <div class="flex gap-2">
        <Button class="btn flex-grow" on:click={skipEmail}>Skip</Button>
        <Button class="btn btn-accent flex-grow" on:click={sendEmail} disabled={loading}>
          {loading ? "Opening Email..." : "Send Email"}
        </Button>
      </div>
    {:else if emailSent}
      <div class="rounded-lg border border-green-600 bg-green-900/20 p-3">
        <p class="text-sm text-green-400">
          ✓ Email opened. Please send it to yourself, then click below to continue.
        </p>
      </div>
      <Button class="btn btn-accent" on:click={saveAndLogin} disabled={loading}>
        {loading ? "Saving..." : "Continue to Anmore"}
      </Button>
    {/if}
  {/if}

  <span class="text-center text-sm text-neutral-400">
    Already have an account? 
    <Link class="underline" href="/login">Log in instead</Link>
  </span>
</FlexColumn>

