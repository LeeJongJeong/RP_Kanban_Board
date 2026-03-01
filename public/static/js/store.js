export const store = {
    allTickets: [],
    allEngineers: [],
    currentView: 'status',
    draggedTicket: null,
    currentWeekStart: null,
    currentWeekEnd: null,
    startDate: null,
    endDate: null,

    setTickets(tickets) {
        this.allTickets = tickets;
    },

    setEngineers(engineers) {
        this.allEngineers = engineers;
    },

    setView(view) {
        this.currentView = view;
    },

    setWeek(start, end) {
        this.currentWeekStart = start;
        this.currentWeekEnd = end;
    }
};
