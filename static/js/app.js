document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticket-form');
    const ticketList = document.getElementById('ticket-list');
    const clearOldTicketsButton = document.getElementById('clear-old-tickets');

    // Load tickets on page load
    loadTickets();

    // Add event listener for form submission
    ticketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createTicket();
    });

    // Add event listener for clear old tickets button
    clearOldTicketsButton.addEventListener('click', clearOldTickets);

    async function loadTickets() {
        try {
            const response = await fetch('/api/tickets');
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const tickets = await response.json();
            renderTickets(tickets);
        } catch (error) {
            console.error('Error loading tickets:', error);
        }
    }

    async function createTicket() {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const priority = document.getElementById('priority').value;

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    priority
                }),
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                ticketForm.reset();
                loadTickets();
            } else {
                const errorData = await response.json();
                console.error('Error creating ticket:', errorData);
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    }

    async function closeTicket(ticketId) {
        try {
            const response = await fetch(`/api/tickets/${ticketId}/close`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                loadTickets();
            } else {
                const errorData = await response.json();
                console.error('Error closing ticket:', errorData);
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    }

    async function clearOldTickets() {
        try {
            const response = await fetch('/api/tickets/clear-old', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                loadTickets();
            } else {
                const errorData = await response.json();
                console.error('Error clearing old tickets:', errorData);
            }
        } catch (error) {
            console.error('Error clearing old tickets:', error);
        }
    }

    function renderTickets(tickets) {
        ticketList.innerHTML = '';
        tickets.forEach((ticket) => {
            const li = document.createElement('li');
            li.className = `ticket-item ${ticket.priority.replace(' ', '-')} ${ticket.is_closed ? 'closed' : ''}`;
            li.innerHTML = `
                <h3>${ticket.title}</h3>
                <p><strong>Priority:</strong> ${ticket.priority}</p>
                <p><strong>Description:</strong> ${ticket.description}</p>
                <p><strong>Status:</strong> ${ticket.is_closed ? 'Closed' : 'Open'}</p>
            `;
            if (!ticket.is_closed) {
                const closeButton = document.createElement('button');
                closeButton.textContent = 'Close Ticket';
                closeButton.className = 'btn btn-danger close-button';
                closeButton.addEventListener('click', () => closeTicket(ticket.id));
                li.appendChild(closeButton);
            }
            ticketList.appendChild(li);
        });
    }
});
