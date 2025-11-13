import {writable, derived, get} from "svelte/store"
import {pubkey, repository} from "@welshman/app"
import {parseJson} from "src/util/misc"
import {APP_DATA, getTagValue} from "@welshman/util"
import {env, myLoad} from "./state"
import {Router, addMaximalFallbacks} from "@welshman/router"
import {appDataKeys, nsecDecode} from "src/util/nostr"
import {getPublicKey} from "nostr-tools"
import {hexToBytes} from "@noble/hashes/utils"

// Admin nsec from environment variable (never committed to git)
// Trim whitespace and remove quotes if present
const ADMIN_NSEC_RAW = import.meta.env.VITE_ADMIN_NSEC || ""
const ADMIN_NSEC = ADMIN_NSEC_RAW.trim().replace(/^["']|["']$/g, "")

// Derive admin pubkey from nsec (only once at module load)
// Fail completely silently - never expose sensitive information or configuration errors
let ADMIN_PUBKEY: string | null = null
if (ADMIN_NSEC) {
  try {
    // Validate nsec format before decoding
    if (ADMIN_NSEC.startsWith("nsec1") && ADMIN_NSEC.length >= 60) {
      const adminPrivateKeyHex = nsecDecode(ADMIN_NSEC)
      const adminPrivateKeyBytes = hexToBytes(adminPrivateKeyHex)
      ADMIN_PUBKEY = getPublicKey(adminPrivateKeyBytes)
      // Success - no logging to avoid exposing any information
    }
    // If validation fails, fail silently - admin features simply won't be available
  } catch (e) {
    // Fail completely silently - don't log anything
    // If nsec is invalid, admin features won't work, which is fine
  }
}

const ADMIN_PUBKEYS = ADMIN_PUBKEY ? new Set([ADMIN_PUBKEY]) : new Set<string>()

// Export admin pubkeys for use in filtering
export const getAdminPubkeys = () => ADMIN_PUBKEYS

// Admin hashtag whitelist store
export const adminHashtagWhitelist = writable<Set<string>>(new Set())

// Check if a pubkey is an admin
export const isAdmin = (pubkey: string | null | undefined): boolean => {
  if (!pubkey) return false
  return ADMIN_PUBKEYS.has(pubkey)
}

// Check if current user is admin
export const isCurrentUserAdmin = derived(pubkey, $pubkey => isAdmin($pubkey))

// Load admin hashtag whitelist from Nostr APP_DATA events
export const loadAdminHashtagWhitelist = async () => {
  if (ADMIN_PUBKEYS.size === 0) {
    // No admins configured, show all hashtags
    adminHashtagWhitelist.set(new Set())
    return
  }

  // Load admin hashtag whitelist from admin's APP_DATA events
  const adminPubkeys = Array.from(ADMIN_PUBKEYS)
  
  await myLoad({
    relays: Router.get().FromPubkeys(adminPubkeys).policy(addMaximalFallbacks).getUrls(),
    filters: [{
      authors: adminPubkeys,
      kinds: [APP_DATA],
      "#d": [appDataKeys.ADMIN_HASHTAG_WHITELIST],
    }],
  })

  // Find the most recent admin hashtag whitelist event
  const events = repository.query([{
    authors: adminPubkeys,
    kinds: [APP_DATA],
    "#d": [appDataKeys.ADMIN_HASHTAG_WHITELIST],
  }])

  if (events.length > 0) {
    // Get the most recent event
    const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0]
    
    try {
      const data = parseJson(latestEvent.content)
      if (data?.hashtagWhitelist && Array.isArray(data.hashtagWhitelist)) {
        adminHashtagWhitelist.set(new Set(data.hashtagWhitelist.map((h: string) => h.toLowerCase())))
        return
      }
    } catch (e) {
      console.error("Failed to parse admin hashtag whitelist:", e)
    }
  }

  // No whitelist found, show all hashtags (empty set means show all)
  adminHashtagWhitelist.set(new Set())
}

// Initialize admin system
export const initAdmin = async () => {
  await loadAdminHashtagWhitelist()
  
  // Subscribe to repository updates to reload whitelist when admin publishes new one
  repository.on("update", ({added}) => {
    const hasAdminWhitelistUpdate = added.some(e => 
      e.kind === APP_DATA &&
      getTagValue("d", e.tags) === appDataKeys.ADMIN_HASHTAG_WHITELIST &&
      ADMIN_PUBKEYS.has(e.pubkey)
    )
    
    if (hasAdminWhitelistUpdate) {
      loadAdminHashtagWhitelist()
    }
  })
}

