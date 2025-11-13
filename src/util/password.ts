// Password-based encryption for nsec storage
// Uses Web Crypto API with AES-GCM for secure encryption

const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for GCM
const TAG_LENGTH = 128 // 128 bits authentication tag

// Derive encryption key from password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ["encrypt", "decrypt"],
  )
}

// Encrypt nsec with password
export async function encryptNsec(nsec: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(nsec)

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // Derive key from password
  const key = await deriveKey(password, salt)

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    data,
  )

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined))
}

// Decrypt nsec with password
export async function decryptNsec(encrypted: string, password: string): Promise<string> {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 16 + IV_LENGTH)
    const encryptedData = combined.slice(16 + IV_LENGTH)

    // Derive key from password
    const key = await deriveKey(password, salt)

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      encryptedData,
    )

    // Convert back to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (e) {
    throw new Error("Failed to decrypt: Invalid password or corrupted data")
  }
}

// Storage key for encrypted nsec
export function getNsecStorageKey(nip05: string): string {
  return `anmore:nsec:${nip05}`
}

// Save encrypted nsec to localStorage
export async function saveEncryptedNsec(nip05: string, nsec: string, password: string): Promise<void> {
  const encrypted = await encryptNsec(nsec, password)
  localStorage.setItem(getNsecStorageKey(nip05), encrypted)
}

// Load and decrypt nsec from localStorage
export async function loadEncryptedNsec(nip05: string, password: string): Promise<string | null> {
  const encrypted = localStorage.getItem(getNsecStorageKey(nip05))
  if (!encrypted) return null

  try {
    return await decryptNsec(encrypted, password)
  } catch (e) {
    return null
  }
}

// Check if encrypted nsec exists for a NIP-05
export function hasEncryptedNsec(nip05: string): boolean {
  return localStorage.getItem(getNsecStorageKey(nip05)) !== null
}

