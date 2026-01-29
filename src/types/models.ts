
export interface Engineer {
    id: number;
    name: string;
    email: string;
    role: 'manager' | 'engineer' | 'consultant' | string;
    wip_limit: number;
    is_active: number; // 1 or 0
    created_at: string;
}

export interface User {
    id: number;
    username: string;
    password?: string; // Should be excluded in responses
    role: 'admin' | 'user' | string;
    engineer_id?: number;
    is_active: number;
    display_name?: string;
    created_at: string;
}

export interface Ticket {
    id: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'review' | 'done' | string;

    // DB Engineering specific fields
    dbms_type: 'MySQL' | 'PostgreSQL' | 'MariaDB' | 'MongoDB' | 'Redis' | 'SingleStore' | 'HeatWave' | 'EDB' | string;
    work_category: '장애대응' | '성능튜닝' | '아키텍처설계' | '정기점검' | '패치업그레이드' | '기술 미팅' | '마이그레이션' | 'Documentation' | string;
    severity: 'critical' | 'high' | 'medium' | 'low' | string;

    // Instance Info
    instance_host?: string;
    instance_env?: 'prod' | 'dev' | 'stg' | string;
    instance_version?: string;

    // SLA & Timing
    sla_minutes?: number;
    started_at?: string;
    resolved_at?: string;

    assigned_to?: number;
    priority: number;

    // Legacy / Extra fields sometimes used in filters or v2
    week_start_date?: string;
    week_end_date?: string;
    year_week?: string;

    created_at: string;
    updated_at: string;
}

// Extended type for Ticket with JOINed engineer info
export interface TicketWithEngineer extends Ticket {
    assigned_to_name?: string;
    assigned_to_email?: string;
}

export interface Comment {
    id: number;
    ticket_id: number;
    engineer_id: number;
    content: string;
    comment_type: 'note' | 'solution' | 'workaround' | 'reference' | string;
    created_at: string;
}

export interface CommentWithEngineer extends Comment {
    engineer_name?: string;
}

export interface TicketHistory {
    id: number;
    ticket_id: number;
    changed_by: number;
    field_name: string;
    old_value?: string;
    new_value?: string;
    changed_at: string;
}
