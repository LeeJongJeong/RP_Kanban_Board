import { Hono } from 'hono'
import { Bindings } from '../bindings'
import { successResponse, errorResponse } from '../types/api'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/run', async (c) => {
    try {
        // Add display_name column to users table
        try {
            await c.env.DB.prepare(`
                ALTER TABLE users ADD COLUMN display_name TEXT;
            `).run()
            console.log('Added display_name column to users table')
        } catch (e: any) {
            if (e.message.includes('duplicate column name')) {
                console.log('display_name column already exists')
            } else {
                throw e
            }
        }

        return c.json(successResponse({ message: 'Migration executed successfully' }))
    } catch (e: any) {
        console.error('Migration failed:', e)
        return c.json(errorResponse(`Migration failed: ${e.message}`), 500)
    }
})

export default app
