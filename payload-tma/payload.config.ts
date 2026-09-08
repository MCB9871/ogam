import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { Admins } from './src/collections/Admins'
import { Readers } from './src/collections/Readers'
import { Texts } from './src/collections/Texts'
import { Audio } from './src/collections/Audio'
import { Products } from './src/collections/Products'
import { Events } from './src/collections/Events'
import { Orders } from './src/collections/Orders'
import { PromoCodes } from './src/collections/PromoCodes'
import { Media } from './src/collections/Media'
import { ChannelPosts } from './src/collections/ChannelPosts'
import { SiteSettings } from './src/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
  },
  editor: lexicalEditor({}),
  collections: [Admins, Readers, Texts, Audio, Products, Events, Orders, PromoCodes, Media, ChannelPosts],
  globals: [SiteSettings],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
  }),
})
