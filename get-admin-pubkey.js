// Quick script to get admin pubkey from nsec
// Run with: node get-admin-pubkey.js

import {getPublicKey} from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import {hexToBytes} from '@noble/hashes/utils'

// Replace with your admin nsec from .env
const adminNsec = process.env.ADMIN_NSEC || 'nsec13rq7cpff45yx3gqdh6aqxujgkezmmz7radv7qsglcsnw3hrsc93qprgff0'

try {
  console.log('Decoding admin nsec...')
  
  // Decode nsec using nip19.decode
  const {type, data} = nip19.decode(adminNsec)
  
  if (type !== 'nsec') {
    throw new Error(`Invalid nsec type: ${type}`)
  }
  
  // data is already Uint8Array, convert to hex then back to bytes for getPublicKey
  const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('')
  const bytes = hexToBytes(hex)
  const pubkey = getPublicKey(bytes)
  
  console.log('\n✅ Admin pubkey (hex):', pubkey)
  console.log('\nCopy this pubkey and use it in /.well-known/nostr.json on your domain:')
  console.log(`\n  "jp": "${pubkey}"`)
  console.log('\nFull file content:')
  console.log(`{\n  "names": {\n    "jp": "${pubkey}"\n  }\n}`)
  console.log('\n')
} catch (error) {
  console.error('❌ Error:', error.message)
  console.error('\nMake sure your ADMIN_NSEC is correct in the .env file')
  process.exit(1)
}

