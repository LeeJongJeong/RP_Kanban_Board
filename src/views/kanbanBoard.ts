
import { Layout } from './components/Layout'
import { Header } from './components/Header'
import { MainBoard } from './components/MainBoard'
import { UserInfoModal } from './components/modals/UserInfoModal'
import { WeekPickerModal } from './components/modals/WeekPickerModal'
import { DashboardModal } from './components/modals/DashboardModal'
import { TicketCreateModal } from './components/modals/TicketCreateModal'
import { TicketDetailModal } from './components/modals/TicketDetailModal'
import { SlaRiskModal } from './components/modals/SlaRiskModal'

export const getKanbanBoardPage = (
    currentUserEngineerId: number | null,
    currentUserEngineerName: string | null,
    currentUserRole: string,
    currentUsername: string
) => {
    const meta = {
        currentUserEngineerId,
        currentUserEngineerName,
        currentUserRole,
        currentUsername
    }

    // Assemble the body content
    const content = `
        ${Header(currentUserEngineerName, currentUserRole)}
        
        ${UserInfoModal()}
        ${WeekPickerModal()}
        ${DashboardModal()}
        ${TicketCreateModal()}
        ${TicketDetailModal()}
        ${SlaRiskModal()}
        
        ${MainBoard()}
    `

    return Layout(meta, content)
}
