document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const airportSelect = document.getElementById('airport-select');
    const flightManagementSection = document.getElementById('flight-management-section');
    const airportNameTitle = document.getElementById('airport-name-title');
    const addFlightForm = document.getElementById('add-flight-form');
    const flightList = document.getElementById('flight-list');
    const noFlightsMessage = document.getElementById('no-flights-message');
    const showFlightsBtn = document.getElementById('show-flights-btn');
    const filterFlightsBtn = document.getElementById('filter-flights-btn');

    const airportsData = {
        "Asturias": "Aeropuerto de Asturias",
        "Barcelona": "Aeropuerto de Barcelona",
        "Madrid": "Aeropuerto de Madrid",
        "Santander": "Aeropuerto de Santander"
    };

    const state = {
        flights: [],
        sampleFlights: [],
        userAddedFlights: [],
        selectedAirport: null,
        currentFlightForPurchase: null,
        showingSampleFlights: false
    };

    function init() {
        populateAirportSelector();
        setupEventListeners();
        updateShowExamplesButtonText();
    }

    function populateAirportSelector() {
        airportSelect.innerHTML = '<option value="" disabled selected>-- Elija aeropuerto --</option>';
        Object.keys(airportsData).forEach(key => {
            airportSelect.innerHTML += `<option value="${key}">${key}</option>`;
        });
    }

    function setupEventListeners() {
        airportSelect.addEventListener('change', handleAirportChange);
        addFlightForm.addEventListener('submit', handleAddFlightSubmit);
        showFlightsBtn.addEventListener('click', handleToggleSampleFlights);
        filterFlightsBtn.addEventListener('click', handleFilterFlights);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllPopups();
        });
    }

    function handleAirportChange() {
        state.selectedAirport = airportSelect.value;
        flightManagementSection.classList.toggle('hidden', !state.selectedAirport);
        if (!state.selectedAirport) return;
        airportNameTitle.innerHTML = `<i class="fas fa-plane-departure"></i> ${airportsData[state.selectedAirport]}`;
        loadSampleFlights();
        state.userAddedFlights = [];
        state.showingSampleFlights = true;
        updateShowExamplesButtonText();
        clearFilters();
        updateAndRenderFlights();
    }

    function handleToggleSampleFlights() {
        clearFilters();
        state.showingSampleFlights = !state.showingSampleFlights;
        updateShowExamplesButtonText();
        updateAndRenderFlights();
    }

    function clearFilters() {
        document.getElementById('filter-destination').value = '';
        document.getElementById('filter-arrival-time').value = '';
        document.getElementById('filter-company').value = '';
    }

    function updateShowExamplesButtonText() {
        showFlightsBtn.innerHTML = state.showingSampleFlights
            ? '<i class="fas fa-eye-slash"></i> Ocultar Ejemplos'
            : '<i class="fas fa-list-ul"></i> Mostrar Ejemplos';
    }

    function handleAddFlightSubmit(e) {
        e.preventDefault();
        const newFlight = {
            id: Date.now(),
            number: document.getElementById('flight-number').value.trim(),
            company: document.getElementById('company-input').value.trim(),
            destination: document.getElementById('destination').value.trim(),
            depDate: document.getElementById('departure-date').value,
            depTime: document.getElementById('departure-time').value,
            arrDate: document.getElementById('arrival-date').value,
            arrTime: document.getElementById('arrival-time').value,
            price: document.getElementById('flight-price').value // CAMBIO: Añadido el precio
        };

        // CAMBIO: Se comprueba también el campo de precio
        if (!newFlight.number || !newFlight.company || !newFlight.destination ||
            !newFlight.depDate || !newFlight.depTime || !newFlight.arrDate || !newFlight.arrTime || !newFlight.price) {
            return alert("Rellene todos los campos, incluido el precio.");
        }

        if (calculateFlightDuration(newFlight.depDate, newFlight.depTime, newFlight.arrDate, newFlight.arrTime) === "Error") {
            return alert("La fecha de llegada no puede ser anterior a la de salida.");
        }

        state.userAddedFlights.unshift(newFlight);
        updateAndRenderFlights();
        addFlightForm.reset();
    }

    function handleFilterFlights() {
        updateAndRenderFlights();
    }

    function updateAndRenderFlights() {
        const baseFlights = state.showingSampleFlights
            ? [...state.sampleFlights, ...state.userAddedFlights]
            : [...state.userAddedFlights];

        const dest = document.getElementById('filter-destination').value.trim().toLowerCase();
        const time = document.getElementById('filter-arrival-time').value;
        const comp = document.getElementById('filter-company').value.trim().toLowerCase();

        state.flights = baseFlights.filter(f =>
            (!dest || f.destination.toLowerCase().includes(dest)) &&
            (!time || f.arrTime === time) &&
            (!comp || f.company.toLowerCase().includes(comp))
        );

        renderFlights();
    }

    function renderFlights() {
        flightList.innerHTML = '';
        noFlightsMessage.classList.toggle('hidden', state.flights.length > 0);

        state.flights.forEach(flight => {
            const li = document.createElement('li');
            li.className = 'flight-card';

            const duration = calculateFlightDuration(flight.depDate, flight.depTime, flight.arrDate, flight.arrTime);
            
            // CAMBIO: Se añade el precio a la tarjeta del vuelo
            li.innerHTML = `
                <div>
                    <h4>Vuelo ${flight.number.toUpperCase()} (${flight.company})</h4>
                    <div class="flight-route">
                        <span>${state.selectedAirport}</span><i class="fas fa-plane"></i><span>${flight.destination}</span>
                    </div>
                    <div class="flight-details-grid">
                        <div><i class="fas fa-plane-departure"></i> ${flight.depTime}</div>
                        <div><i class="fas fa-plane-arrival"></i> ${flight.arrTime}</div>
                        <div><i class="fas fa-hourglass-half"></i> ${duration}</div>
                    </div>
                </div>
                <div class="flight-actions">
                    <div class="flight-price">${flight.price} €</div>
                    <button class="buy-button"><i class="fas fa-ticket-alt"></i> Comprar</button>
                </div>`;

            li.querySelector('.buy-button').addEventListener('click', () => {
                state.currentFlightForPurchase = flight;
                openPurchaseModal();
            });

            flightList.appendChild(li);
        });
    }

    function openPurchaseModal() {
        mainContent.classList.add('hidden');
        const modal = document.createElement('div');
        modal.id = 'purchase-modal';
        modal.className = 'modal';
        modal.innerHTML = createPurchaseFormHTML();
        modal.querySelector('#ticket-form').addEventListener('submit', handlePurchaseSubmit);
        modal.querySelector('.close-button').addEventListener('click', closeAllPopups);

        modal.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') setValid(input);
            });
        });

        document.body.appendChild(modal);
        setTimeout(() => modal.style.opacity = '1', 10);
    }

    function handlePurchaseSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const nameInput = form.querySelector('#passenger-name');
        const emailInput = form.querySelector('#passenger-email');
        const dniInput = form.querySelector('#passenger-dni');
        const paymentMethod = form.querySelector('input[name="payment-method"]:checked');

        let isValid = true;

        if (nameInput.value.trim() === '') {
            setInvalid(nameInput, 'El nombre es obligatorio.');
            isValid = false;
        } else {
            setValid(nameInput);
        }

        if (emailInput.value.trim() === '') {
            setInvalid(emailInput, 'El correo es obligatorio.');
            isValid = false;
        } else {
            setValid(emailInput);
        }

        if (!/^[0-9]{8}[A-Za-z]$/.test(dniInput.value.trim())) {
            setInvalid(dniInput, 'Formato de DNI no válido.');
            isValid = false;
        } else {
            setValid(dniInput);
        }

        if (!paymentMethod) {
            alert('Seleccione un método de pago.');
            isValid = false;
        }

        if (isValid) {
            alert('Compra simulada con éxito');
            closeAllPopups();
        }
    }

    function closeAllPopups() {
        const modal = document.getElementById('purchase-modal');
        if (modal) modal.remove();
        mainContent.classList.remove('hidden');
    }

    function createPurchaseFormHTML() {
        const flight = state.currentFlightForPurchase;
        // CAMBIO: Se añade el precio al modal de compra
        return `
            <div class="modal-content">
                <button class="close-button" title="Cerrar">CANCELAR ❌</button>
                <h2><i class="fas fa-shopping-cart"></i> Confirmar Compra</h2>
                <p><strong>Vuelo:</strong> ${flight.number} a ${flight.destination}</p>
                <p><strong>Precio:</strong> ${flight.price} €</p>
                <form id="ticket-form" novalidate>
                    <div class="form-group">
                        <label for="passenger-name">Nombre Completo</label>
                        <input type="text" id="passenger-name" required>
                        <div class="error-message"></div>
                    </div>
                    <div class="form-group">
                        <label for="passenger-email">Correo Electrónico</label>
                        <input type="email" id="passenger-email" required>
                        <div class="error-message"></div>
                    </div>
                    <div class="form-group">
                        <label for="passenger-dni">DNI</label>
                        <input type="text" id="passenger-dni" required placeholder="12345678A">
                        <div class="error-message"></div>
                    </div>
                    <fieldset class="form-group">
                        <legend>Método de Pago</legend>
                        <label><input type="radio" name="payment-method" value="Efectivo" required> Efectivo</label>
                        <label><input type="radio" name="payment-method" value="Tarjeta"> Tarjeta</label>
                    </fieldset>
                    <button type="submit" class="cta-button">Confirmar y Comprar</button>
                </form>
            </div>`;
    }

    function calculateFlightDuration(d1, t1, d2, t2) {
        if (!d1 || !t1 || !d2 || !t2) return "N/A";
        const dep = new Date(`${d1}T${t1}`);
        const arr = new Date(`${d2}T${t2}`);
        if (isNaN(dep) || isNaN(arr) || arr < dep) return "Error";
        const diff = (arr - dep) / 60000;
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    }

    function setInvalid(input, msg) {
        const fg = input.closest('.form-group');
        fg.classList.add('invalid');
        fg.querySelector('.error-message').textContent = msg;
    }

    function setValid(input) {
        const fg = input.closest('.form-group');
        fg.classList.remove('invalid');
        fg.querySelector('.error-message').textContent = '';
    }

    function loadSampleFlights() {
        const today = new Date();
        const pad = n => n.toString().padStart(2, '0');

        const dateStr = (date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;

        // CAMBIO: Se añade la propiedad "price" a los vuelos de ejemplo
        state.sampleFlights = [
            {
                id: 1,
                number: "FR1234",
                company: "Ryanair",
                destination: "Londres",
                depDate: dateStr(today),
                depTime: "09:30",
                arrDate: dateStr(today),
                arrTime: "11:15",
                price: 125
            },
            {
                id: 2,
                number: "IB5678",
                company: "Iberia",
                destination: "París",
                depDate: dateStr(today),
                depTime: "13:00",
                arrDate: dateStr(today),
                arrTime: "15:10",
                price: 180
            },
            {
                id: 3,
                number: "VY4321",
                company: "Vueling",
                destination: "Ibiza",
                depDate: dateStr(today),
                depTime: "17:45",
                arrDate: dateStr(today),
                arrTime: "19:30",
                price: 95
            }
        ];
    }

    init();
});
