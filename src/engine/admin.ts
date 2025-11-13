import {writable, derived} from "svelte/store"
import {pubkey} from "@welshman/app"
import {nsecDecode} from "src/util/nostr"
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

// Storage key for hashtag whitelist in localStorage
const HASHTAG_WHITELIST_STORAGE_KEY = "anmore:admin:hashtagWhitelist"

// Admin hashtag whitelist store
export const adminHashtagWhitelist = writable<Set<string>>(new Set())

// Check if a pubkey is an admin
export const isAdmin = (pubkey: string | null | undefined): boolean => {
  if (!pubkey) return false
  return ADMIN_PUBKEYS.has(pubkey)
}

// Check if current user is admin
export const isCurrentUserAdmin = derived(pubkey, $pubkey => isAdmin($pubkey))

// Load admin hashtag whitelist from environment variable and localStorage
export const loadAdminHashtagWhitelist = () => {
  // First, try to load from environment variable (comma-separated)
  const envWhitelist = import.meta.env.VITE_ADMIN_HASHTAG_WHITELIST || ""
  const envHashtags = envWhitelist
    .split(",")
    .map(h => h.trim().toLowerCase().replace(/^#/, ""))
    .filter(h => h.length > 0)

  // Then, try to load from localStorage (for runtime updates)
  let storedHashtags: string[] = []
  try {
    const stored = localStorage.getItem(HASHTAG_WHITELIST_STORAGE_KEY)
    if (stored) {
      storedHashtags = JSON.parse(stored)
    }
  } catch (e) {
    // Ignore parse errors
  }

  // Merge: use localStorage if it exists, otherwise use env, otherwise empty
  const hashtags = storedHashtags.length > 0 ? storedHashtags : envHashtags
  adminHashtagWhitelist.set(new Set(hashtags))
}

// Save hashtag whitelist to localStorage (for runtime persistence)
export const saveAdminHashtagWhitelist = (whitelist: Set<string>) => {
  try {
    const hashtags = Array.from(whitelist)
    localStorage.setItem(HASHTAG_WHITELIST_STORAGE_KEY, JSON.stringify(hashtags))
  } catch (e) {
    console.error("Failed to save hashtag whitelist:", e)
  }
}

// Initialize admin system
export const initAdmin = async () => {
  loadAdminHashtagWhitelist()
}

