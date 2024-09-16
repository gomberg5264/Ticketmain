document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticket-form');
    const ticketList = document.getElementById('ticket-list');

    // Load tickets on page load
    loadTickets();

    // Add event listener for form submission
    ticketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createTicket();
    });

    async function loadTickets() {
        try {
            const response = await fetch('/api/tickets');
            if (response.status === 401) {
                // Redirect to login page if not authenticated
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
                body: JSON.stringify({ title, description, priority }),
            });

            if (response.status === 401) {
                // Redirect to login page if not authenticated
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

    async function closeTicket(id) {
        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
            });

            if (response.status === 401) {
                // Redirect to login page if not authenticated
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                loadTickets();
            } else {
                console.error('Error closing ticket:', response.statusText);
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
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
                ${!ticket.is_closed ? `<button class="close-button" data-id="${ticket.id}">Close Ticket</button>` : ''}
            `;
            ticketList.appendChild(li);
        });

        // Add event listeners for close buttons
        document.querySelectorAll('.close-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                closeTicket(id);
            });
        });
    }
});
