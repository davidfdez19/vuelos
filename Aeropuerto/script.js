document.addEventListener('DOMContentLoaded', () => {

    // --- CLASES DEL MODELO DE DATOS ---

    class Vuelo {
        constructor(codigo, compania, fechaSalida, horaSalida, fechaLlegada, horaLlegada, precioBase) {
            this.setCodigo(codigo, compania);
            this.compania = compania;
            this.setFechasYHoras(fechaSalida, horaSalida, fechaLlegada, horaLlegada);
            this.precioBase = parseFloat(precioBase);
        }

        setCodigo(codigo, compania) {
            // Valida que el código del vuelo comience con las 3 primeras letras de la compañía
            const compania3Letras = compania.substring(0, 3).toUpperCase();
            const regex = new RegExp(`^${compania3Letras}\\d{4}$`);
            if (!regex.test(codigo)) {
                throw new Error(`El formato del código de vuelo '${codigo}' es incorrecto. Debe ser '${compania3Letras}XXXX'.`);
            }
            this.codigo = codigo;
        }

        setFechasYHoras(fechaSalida, horaSalida, fechaLlegada, horaLlegada) {
            const salida = new Date(`${fechaSalida}T${horaSalida}`);
            const llegada = new Date(`${fechaLlegada}T${horaLlegada}`);

            if (isNaN(salida.getTime()) || isNaN(llegada.getTime())) {
                throw new Error('Las fechas u horas proporcionadas no son válidas.');
            }

            if (llegada <= salida) {
                throw new Error('La fecha y hora de llegada deben ser posteriores a la de salida.');
            }

            this.fechaSalida = fechaSalida;
            this.horaSalida = horaSalida;
            this.fechaLlegada = fechaLlegada;
            this.horaLlegada = horaLlegada;
            this.calcularDuracion();
        }

        calcularDuracion() {
            const salida = new Date(`${this.fechaSalida}T${this.horaSalida}`);
            const llegada = new Date(`${this.fechaLlegada}T${this.horaLlegada}`);
            let diffMs = llegada - salida;

            const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
            diffMs -= diffHoras * (1000 * 60 * 60);
            const diffMinutos = Math.floor(diffMs / (1000 * 60));

            this.duracionVuelo = `${diffHoras}h ${diffMinutos}m`;
        }
    }

    class Aeropuerto {
        constructor(nombre, ciudad) {
            this.nombre = nombre;
            this.ciudad = ciudad;
            this.vuelos = [];
        }

        agregarVuelo(vuelo) {
            if (this.buscarVueloPorCodigo(vuelo.codigo)) {
                throw new Error(`El vuelo con código '${vuelo.codigo}' ya existe.`);
            }
            this.vuelos.push(vuelo);
        }

        buscarVueloPorCodigo(codigo) {
            return this.vuelos.find(v => v.codigo === codigo);
        }
        
        modificarVuelo(codigo, nuevosDatos) {
            const vuelo = this.buscarVueloPorCodigo(codigo);
            if (!vuelo) {
                throw new Error(`No se encontró el vuelo con código '${codigo}' para modificar.`);
            }
            
            const compania = nuevosDatos.compania || vuelo.compania;
            const fechaSalida = nuevosDatos.fechaSalida || vuelo.fechaSalida;
            const horaSalida = nuevosDatos.horaSalida || vuelo.horaSalida;
            const fechaLlegada = nuevosDatos.fechaLlegada || vuelo.fechaLlegada;
            const horaLlegada = nuevosDatos.horaLlegada || vuelo.horaLlegada;
            const precioBase = nuevosDatos.precioBase !== undefined ? nuevosDatos.precioBase : vuelo.precioBase;

            vuelo.setFechasYHoras(fechaSalida, horaSalida, fechaLlegada, horaLlegada);
            vuelo.compania = compania;
            vuelo.precioBase = parseFloat(precioBase);
        }
    }

    // --- INSTANCIA DEL AEROPUERTO Y CARGA DE DATOS DE EJEMPLO ---
    const miAeropuerto = new Aeropuerto("Seve Ballesteros", "Santander");
    
    try {
        miAeropuerto.agregarVuelo(new Vuelo("IBE0001", "Iberia", "2025-08-15", "10:30", "2025-08-15", "12:45", 120.50));
        miAeropuerto.agregarVuelo(new Vuelo("RYN0002", "Ryanair", "2025-08-15", "11:00", "2025-08-15", "13:00", 75.00));
        miAeropuerto.agregarVuelo(new Vuelo("VUE0003", "Vueling", "2025-08-16", "09:15", "2025-08-16", "11:00", 99.99));
        miAeropuerto.agregarVuelo(new Vuelo("AUE1122", "Air Europa", "2025-10-01", "14:00", "2025-10-01", "16:30", 210.00));
        miAeropuerto.agregarVuelo(new Vuelo("LUF5566", "Lufthansa", "2025-10-10", "12:00", "2025-10-10", "14:30", 255.00));
        miAeropuerto.agregarVuelo(new Vuelo("RYN9900", "Ryanair", "2025-11-10", "06:15", "2025-11-10", "08:20", 49.50));
        miAeropuerto.agregarVuelo(new Vuelo("IBE3030", "Iberia", "2025-11-15", "23:00", "2025-11-16", "01:15", 150.00));
        miAeropuerto.agregarVuelo(new Vuelo("VUE2025", "Vueling", "2025-11-20", "13:00", "2025-11-20", "15:10", 115.25));
        miAeropuerto.agregarVuelo(new Vuelo("RYN1111", "Ryanair", "2025-12-15", "07:00", "2025-12-15", "09:15", 68.80));
        miAeropuerto.agregarVuelo(new Vuelo("VUE8888", "Vueling", "2025-12-22", "09:00", "2025-12-22", "11:00", 145.00)); 
        miAeropuerto.agregarVuelo(new Vuelo("IBE4010", "Iberia", "2026-01-05", "16:00", "2026-01-05", "18:25", 160.00));
        miAeropuerto.agregarVuelo(new Vuelo("KLM1234", "KLM", "2026-02-10", "12:15", "2026-02-10", "15:00", 240.75));
        miAeropuerto.agregarVuelo(new Vuelo("EZY4455", "EasyJet", "2026-02-10", "13:30", "2026-02-10", "15:00", 89.90)); 
        miAeropuerto.agregarVuelo(new Vuelo("IBE9876", "Iberia", "2026-03-01", "11:00", "2026-03-01", "13:15", 185.00));
        miAeropuerto.agregarVuelo(new Vuelo("AFR1234", "Air France", "2026-06-01", "16:00", "2026-06-01", "18:25", 210.00));
        miAeropuerto.agregarVuelo(new Vuelo("TAP3344", "TAP Air Portugal", "2026-06-15", "19:00", "2026-06-15", "21:00", 140.00));
        miAeropuerto.agregarVuelo(new Vuelo("RYN4433", "Ryanair", "2026-09-05", "07:10", "2026-09-05", "09:15", 45.50));
        miAeropuerto.agregarVuelo(new Vuelo("VUE3322", "Vueling", "2026-08-01", "12:30", "2026-08-01", "14:30", 110.00));
        miAeropuerto.agregarVuelo(new Vuelo("AAL9010", "American Airlines", "2027-07-20", "22:00", "2027-07-21", "08:20", 850.75));

    } catch(e) {
        console.error("Error al añadir datos de prueba:", e.message);
    }
    
    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const formVuelo = document.getElementById('formVuelo');
    const codigoVueloInput = document.getElementById('codigoVuelo');
    const companiaInput = document.getElementById('compania');
    const fechaSalidaInput = document.getElementById('fechaSalida');
    const horaSalidaInput = document.getElementById('horaSalida');
    const fechaLlegadaInput = document.getElementById('fechaLlegada');
    const horaLlegadaInput = document.getElementById('horaLlegada');
    const precioBaseInput = document.getElementById('precioBase');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnMostrarVuelos = document.getElementById('btnMostrarVuelos');
    const tablaVuelosBody = document.getElementById('tablaVuelosBody');
    const errorFormVuelo = document.getElementById('errorFormVuelo');
    const btnFiltrarEspecifico = document.getElementById('btnFiltrarEspecifico');

    // Formulario de compra
    const compraOverlay = document.getElementById('compraOverlay');
    const formCliente = document.getElementById('formCliente');
    const codigoVueloCompra = document.getElementById('codigoVueloCompra');
    const dniClienteInput = document.getElementById('dniCliente');
    const nombreClienteInput = document.getElementById('nombreCliente');
    const emailClienteInput = document.getElementById('emailCliente');
    const claseVueloSelect = document.getElementById('claseVuelo');
    const comentarioClienteInput = document.getElementById('comentarioCliente');
    const contadorChars = document.getElementById('contadorChars');
    const btnReservar = document.getElementById('btnReservar');
    const btnCancelarCompra = document.getElementById('btnCancelarCompra');
    const errorFormCompra = document.getElementById('errorFormCompra');

    // --- FUNCIONES AUXILIARES ---
    
    const mostrarError = (contenedor, mensajes, campoFocus = null) => {
        contenedor.innerHTML = `<ul>${mensajes.map(m => `<li>${m}</li>`).join('')}</ul>`;
        if (campoFocus) {
            campoFocus.focus();
            campoFocus.select();
        }
    };

    const ocultarError = (contenedor) => {
        contenedor.innerHTML = '';
    };

    const renderizarTabla = (vuelos) => {
        tablaVuelosBody.innerHTML = '';
        if (vuelos.length === 0) {
            tablaVuelosBody.innerHTML = '<tr><td colspan="7">No se encontraron vuelos con los criterios de búsqueda.</td></tr>';
            return;
        }
        vuelos.forEach(vuelo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${vuelo.codigo}</td>
                <td>${vuelo.compania}</td>
                <td>${vuelo.fechaSalida} ${vuelo.horaSalida}</td>
                <td>${vuelo.fechaLlegada} ${vuelo.horaLlegada}</td>
                <td>${vuelo.duracionVuelo}</td>
                <td>${vuelo.precioBase.toFixed(2)} €</td>
                <td>
                    <button class="btn-tabla-buscar" data-codigo="${vuelo.codigo}">📝</button>
                    <button class="btn-tabla-comprar" data-codigo="${vuelo.codigo}">🛒</button>
                </td>
            `;
            tablaVuelosBody.appendChild(tr);
        });
    };

    const validarDNI = (dni) => {
        const dniRegex = /^\d{8}[A-Z]$/;
        if (!dniRegex.test(dni.toUpperCase())) return false;
        const numero = dni.substr(0, 8);
        const letra = dni.substr(8, 1).toUpperCase();
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        return letras[numero % 23] === letra;
    };
    
    const validarEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // --- MANEJADORES DE EVENTOS ---
    
    btnGuardar.addEventListener('click', () => {
        ocultarError(errorFormVuelo);
        const codigo = codigoVueloInput.value.trim().toUpperCase();
        const compania = companiaInput.value.trim();
        const fechaSalida = fechaSalidaInput.value;
        const horaSalida = horaSalidaInput.value;
        const fechaLlegada = fechaLlegadaInput.value;
        const horaLlegada = horaLlegadaInput.value;
        const precioBase = precioBaseInput.value;

        const vueloExistente = miAeropuerto.buscarVueloPorCodigo(codigo);

        try {
            if (vueloExistente) { // Modificar
                if (!compania && !fechaSalida && !horaSalida && !fechaLlegada && !horaLlegada && !precioBase) {
                    mostrarError(errorFormVuelo, ["Para modificar, debe rellenar al menos un campo además del código."], companiaInput);
                    return;
                }
                const datosNuevos = {
                    compania: compania || undefined,
                    fechaSalida: fechaSalida || undefined,
                    horaSalida: horaSalida || undefined,
                    fechaLlegada: fechaLlegada || undefined,
                    horaLlegada: horaLlegada || undefined,
                    precioBase: precioBase ? parseFloat(precioBase) : undefined
                };
                miAeropuerto.modificarVuelo(codigo, datosNuevos);
                alert(`Vuelo ${codigo} modificado con éxito.`);

            } else { // Crear
                if (!codigo || !compania || !fechaSalida || !horaSalida || !fechaLlegada || !horaLlegada || !precioBase) {
                    mostrarError(errorFormVuelo, ["Para crear un vuelo nuevo, todos los campos son obligatorios."], codigoVueloInput);
                    return;
                }
                const nuevoVuelo = new Vuelo(codigo, compania, fechaSalida, horaSalida, fechaLlegada, horaLlegada, precioBase);
                miAeropuerto.agregarVuelo(nuevoVuelo);
                alert(`Vuelo ${codigo} creado con éxito.`);
            }
            formVuelo.reset();
            renderizarTabla(miAeropuerto.vuelos);
        } catch (e) {
            mostrarError(errorFormVuelo, [e.message], codigoVueloInput);
        }
    });

    // ===== CORRECCIÓN EN EL BOTÓN 'MOSTRAR VUELOS' =====
    // Este botón ahora simplemente muestra TODOS los vuelos, reseteando cualquier filtro.
    btnMostrarVuelos.addEventListener('click', () => {
        renderizarTabla(miAeropuerto.vuelos);
        formVuelo.reset(); // Limpia los campos del formulario.
        ocultarError(errorFormVuelo); // Oculta cualquier mensaje de error previo.
    });
    // ===== FIN DE LA CORRECCIÓN =====

    // Este botón se encarga del filtrado específico por compañía y/o hora de llegada.
    btnFiltrarEspecifico.addEventListener('click', () => {
        const companiaFiltro = companiaInput.value.trim();
        const horaLlegadaFiltro = horaLlegadaInput.value;

        if (!companiaFiltro && !horaLlegadaFiltro) {
            alert("Por favor, introduce una compañía y/o una hora de llegada para usar este filtro.");
            return;
        }

        let vuelosFiltrados = miAeropuerto.vuelos;

        // Filtrar por compañía si se ha introducido
        if (companiaFiltro) {
            vuelosFiltrados = vuelosFiltrados.filter(v => 
                v.compania.toLowerCase().includes(companiaFiltro.toLowerCase())
            );
        }

        // Filtrar por hora de llegada si se ha introducido
        if (horaLlegadaFiltro) {
            vuelosFiltrados = vuelosFiltrados.filter(v => v.horaLlegada === horaLlegadaFiltro);
        }

        renderizarTabla(vuelosFiltrados);
    });

    tablaVuelosBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const codigo = target.dataset.codigo;
        if (!codigo) return;

        if (target.classList.contains('btn-tabla-buscar')) {
            const vuelo = miAeropuerto.buscarVueloPorCodigo(codigo);
            if (vuelo) {
                codigoVueloInput.value = vuelo.codigo;
                companiaInput.value = vuelo.compania;
                fechaSalidaInput.value = vuelo.fechaSalida;
                horaSalidaInput.value = vuelo.horaSalida;
                fechaLlegadaInput.value = vuelo.fechaLlegada;
                horaLlegadaInput.value = vuelo.horaLlegada;
                precioBaseInput.value = vuelo.precioBase;
                window.scrollTo(0, 0);
                codigoVueloInput.focus();
            }
        }

        if (target.classList.contains('btn-tabla-comprar')) {
            formCliente.reset();
            ocultarError(errorFormCompra);
            actualizarContadorComentario();
            codigoVueloCompra.textContent = codigo;
            formCliente.dataset.codigoVuelo = codigo; 
            compraOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    });
    
    btnCancelarCompra.addEventListener('click', () => {
        compraOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    comentarioClienteInput.addEventListener('input', actualizarContadorComentario);
    
    function actualizarContadorComentario() {
        const maxLength = comentarioClienteInput.maxLength;
        const currentLength = comentarioClienteInput.value.length;
        contadorChars.textContent = `${maxLength - currentLength} caracteres restantes`;
    }

    btnReservar.addEventListener('click', () => {
        ocultarError(errorFormCompra);
        const errores = [];
        let campoConError = null;

        const dni = dniClienteInput.value.trim();
        const nombre = nombreClienteInput.value.trim();
        const email = emailClienteInput.value.trim();
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked');

        if (!validarDNI(dni)) {
            errores.push("El formato del DNI es incorrecto o la letra no es válida.");
            campoConError = campoConError || dniClienteInput;
        }
        if (nombre.length < 3) {
            errores.push("El nombre y apellidos son obligatorios.");
            campoConError = campoConError || nombreClienteInput;
        }
        if (!validarEmail(email)) {
            errores.push("El formato del correo electrónico no es válido.");
            campoConError = campoConError || emailClienteInput;
        }
        if (!metodoPago) {
            errores.push("Debe seleccionar un método de pago.");
            campoConError = campoConError || document.getElementById('pagoEfectivo');
        }

        if (errores.length > 0) {
            mostrarError(errorFormCompra, errores, campoConError);
            return;
        }

        const codigoVuelo = formCliente.dataset.codigoVuelo;
        const vuelo = miAeropuerto.buscarVueloPorCodigo(codigoVuelo);
        const claseMultiplicador = parseFloat(claseVueloSelect.value);
        const precioFinal = (vuelo.precioBase * claseMultiplicador).toFixed(2);
        
        const mensajeConfirmacion = `
            ¿Confirma la reserva del siguiente pasaje?
            ------------------------------------------
            VUELO: ${vuelo.codigo} (${vuelo.compania})
            Salida: ${vuelo.fechaSalida} a las ${vuelo.horaSalida}
            Llegada: ${vuelo.fechaLlegada} a las ${vuelo.horaLlegada}
            Precio Final: ${precioFinal} €
            ------------------------------------------
            CLIENTE:
            Nombre: ${nombre}
            DNI: ${dni}
            Email: ${email}
            ------------------------------------------
        `;

        if (confirm(mensajeConfirmacion)) {
            alert("¡Reserva realizada con éxito!");
            compraOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
        } else {
            alert("Reserva cancelada.");
        }
    });

    // --- INICIALIZACIÓN ---
    renderizarTabla(miAeropuerto.vuelos);
    actualizarContadorComentario();
});