# System Features & Logic

## 🚨 SLA Risk Management

### Overview
The system automatically identifies tickets at risk of missing their Service Level Agreement (SLA) deadlines.

### Risk Logic
A ticket is flagged as "At Risk" if:
1.  **Status**: `todo` or `in_progress`
2.  **Severity**: `critical` or `high`
3.  **Time Threshold**:
    - If **Started**: Elapsed time > 80% of SLA.
    - If **Not Started**: Elapsed time > 50% of SLA.

### Dashboard Integration
- **Alert Box**: Displays count of at-risk tickets.
- **Detail Modal**: Lists specific tickets with progress bars showing time used vs. allocated.

### Database Query
Risk calculation compares `sla_minutes` against elapsed time (calculated from `started_at` or `created_at`) using SQLite date functions.

---

## 🖱️ Drag & Drop Workflow

### Functionality
- **Status Change**: Drag ticket between Status columns (e.g., To-Do → In Progress).
- **Assignment**: Drag ticket to Engineer columns to reassign.
- **Validation**: Checks WIP (Work In Progress) limits before allowing assignment.

### Technical Implementation
- **Desktop**: Native HTML5 Drag and Drop API (`dragstart`, `drop`, `dragover`).
- **Mobile**: Custom Touch Events simulating drag behavior.
- **State Updates**:Optimistic UI updates followed by API calls (`PATCH /api/tickets/:id/status`).

### Testing Scenarios
1.  **Move Ticket**: Drag from 'To-Do' to 'Done'. Verify status update.
2.  **Reassign**: Drag to new Engineer. Verify WIP count increases.
3.  **Invalid Move**: Drag to same column. Verify no API call.
