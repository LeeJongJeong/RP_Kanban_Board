import { D1Database } from '@cloudflare/workers-types'

export type Bindings = {
  DB: D1Database
  USERNAME: string
  PASSWORD: string
  JWT_SECRET: string
}
