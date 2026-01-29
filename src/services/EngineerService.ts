
import { D1Database } from '@cloudflare/workers-types'
import { Engineer } from '../types/models'

export class EngineerService {
    constructor(private db: D1Database) { }

    async findAllActive(): Promise<Engineer[]> {
        const result = await this.db.prepare(`
        SELECT id, name, email, role, wip_limit, is_active 
        FROM engineers 
        WHERE is_active = 1
        ORDER BY name
      `).all<Engineer>()
        return result.results || []
    }

    async getWipCount(engineerId: number | string): Promise<{ current_wip: number }> {
        const result = await this.db.prepare(`
        SELECT COUNT(*) as current_wip
        FROM tickets 
        WHERE assigned_to = ? AND status IN ('todo', 'in_progress', 'review')
      `).bind(engineerId).first<{ current_wip: number }>()

        return result || { current_wip: 0 }
    }
}
