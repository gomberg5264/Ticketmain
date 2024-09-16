document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticket-form');
    const ticketList = document.getElementById('ticket-list');
    const assignedToSelect = document.getElementById('assigned-to');

    // Load tickets and users on page load
    loadTickets();
    loadUsers();

    // Add event listener for form submission
    ticketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createTicket();
    });

    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const users = await response.json();
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `User ${user.id}`;
                assignedToSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

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
        const assignedTo = document.getElementById('assigned-to').value;

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, priority, assigned_to_id: assignedTo || null }),
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

    async function updateTicket(id, data) {
        try {
            const response = await fetch(`/api/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                loadTickets();
            } else {
                console.error('Error updating ticket:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
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
                <p><strong>Assigned to:</strong> ${ticket.assigned_to || 'Unassigned'}</p>
                ${!ticket.is_closed ? `
                    <button class="close-button" data-id="${ticket.id}">Close Ticket</button>
                    <select class="assign-select" data-id="${ticket.id}">
                        <option value="">Unassigned</option>
                        ${Array.from(assignedToSelect.options).slice(1).map(option => `
                            <option value="${option.value}" ${ticket.assigned_to_id == option.value ? 'selected' : ''}>
                                ${option.textContent}
                            </option>
                        `).join('')}
                    </select>
                ` : ''}
            `;
            ticketList.appendChild(li);
        });

        // Add event listeners for close buttons and assign selects
        document.querySelectorAll('.close-button').forEach((button) => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                updateTicket(id, { is_closed: true });
            });
        });

        document.querySelectorAll('.assign-select').forEach((select) => {
            select.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const assignedToId = e.target.value;
                updateTicket(id, { assigned_to_id: assignedToId || null });
            });
        });
    }
});
