import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null

// Local API : on est dans le même process Next.js que Payload, donc on
// interroge directement la base sans passer par un aller-retour HTTP inutile.
export function getPayloadClient(): Promise<Payload> {
  if (!cached) {
    cached = getPayload({ config })
  }
  return cached
}
