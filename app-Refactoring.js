// ============================================
// MODELO DE DOMINIO (POO)
// ============================================

/**
 * Clase Arma: Entidad independiente en la agregación.
 * Posee sus propios atributos funcionales y su clase de renderizado gráfico.
 */
class Arma {
    #id;
    #nombre;
    #danio;
    #claseGrafica;

    constructor(id, nombre, danio, claseGrafica) {
        this.#id = id;
        this.#nombre = nombre;
        this.#danio = danio;
        this.#claseGrafica = claseGrafica;
    }

    getId() {
        return this.#id;
    }

    getNombre() {
        return this.#nombre;
    }

    getDanio() {
        return this.#danio;
    }

    getClaseGrafica() {
        return this.#claseGrafica;
    }

    atacar() {
        return `Ataque con ${this.#nombre}: inflige ${this.#danio} puntos de daño.`;
    }
}

/**
 * Clase Personaje: Mantiene una agregación con Arma.
 * Administra posición espacial y su arma actual por referencia débil.
 */
class Personaje {
    #nombre;
    #vida;
    #vidaMaxima;
    #posicionX;
    #arma; // Referencia agregada (instancia de Arma o null)

    constructor(nombre, vida, posicionInicial = 100) {
        this.#nombre = nombre;
        this.#vida = vida;
        this.#vidaMaxima = vida;
        this.#posicionX = posicionInicial;
        this.#arma = null;
    }

    getNombre() {
        return this.#nombre;
    }

    getVida() {
        return this.#vida;
    }

    getVidaMaxima() {
        return this.#vidaMaxima;
    }

    getPosicionX() {
        return this.#posicionX;
    }

    getArma() {
        return this.#arma;
    }

    mover(distancia, limiteMinimo, limiteMaximo) {
        this.#posicionX = Math.min(limiteMaximo, Math.max(limiteMinimo, this.#posicionX + distancia));
        return `${this.#nombre} se desplazó a la coordenada ${this.#posicionX}px.`;
    }

    equiparArma(nuevaArma) {
        this.#arma = nuevaArma;
        return `${this.#nombre} equipó ${nuevaArma.getNombre()}.`;
    }

    desequiparArma() {
        if (!this.#arma) {
            return `${this.#nombre} ya se encuentra desarmado.`;
        }
        const armaRetirada = this.#arma.getNombre();
        this.#arma = null;
        return `${this.#nombre} guardó ${armaRetirada}. Sus manos están libres.`;
    }

    atacar() {
        if (this.#arma) {
            return `${this.#nombre} ataca con firmeza. ${this.#arma.atacar()}`;
        }
        const danioBase = 5;
        return `${this.#nombre} propina un puñetazo desarmado: inflige ${danioBase} puntos de daño.`;
    }

    recibirDanio(cantidad) {
        this.#vida = Math.max(0, this.#vida - cantidad);
        return `${this.#nombre} recibió ${cantidad} de impacto. Vida: ${this.#vida}/${this.#vidaMaxima}.`;
    }
}

// ============================================
// CONTROLADOR Y GESTIÓN VISUAL (DOM)
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Instancias externas de Armas (viven fuera del personaje)
    const armeria = [
        new Arma("espada-1", "Espada de Acero", 35, "espada"),
        new Arma("hacha-1", "Hacha de Batalla", 48, "hacha"),
        new Arma("arco-1", "Arco Largo", 25, "arco"),
        new Arma("daga-1", "Daga Corta", 18, "daga")
    ];

    // 2. Instancia del Personaje
    const guerrero = new Personaje("Guerrero Valerio", 100, 100);

    // 3. Referencias del DOM
    const muñecoVisual = document.getElementById("guerrero-visual");
    const ranuraArmaVisual = document.getElementById("contenedor-arma-visual");
    const contenedorEscenario = document.getElementById("escenario");

    const elementoNombre = document.getElementById("personaje-nombre");
    const elementoTextoVida = document.getElementById("texto-vida");
    const barraVida = document.getElementById("barra-vida");
    const elementoArmaNombre = document.getElementById("arma-nombre");
    const elementoArmaDanio = document.getElementById("arma-danio");
    const contenedorListaArmas = document.getElementById("lista-armas");
    const contenedorLog = document.getElementById("registro");

    const btnAtacar = document.getElementById("btn-atacar");
    const btnRecibirDanio = document.getElementById("btn-recibir-danio");
    const btnDesarmar = document.getElementById("btn-desarmar");
    const btnLimpiarLog = document.getElementById("btn-limpiar-log");
    const btnMoverIzq = document.getElementById("btn-mover-izq");
    const btnMoverDer = document.getElementById("btn-mover-der");

    // Registro de texto
    function registrarEvento(mensaje) {
        const parrafo = document.createElement("p");
        parrafo.className = "linea-log";
        parrafo.textContent = `[${new Date().toLocaleTimeString()}] ${mensaje}`;
        contenedorLog.appendChild(parrafo);
        contenedorLog.scrollTop = contenedorLog.scrollHeight;
    }

    // Actualización completa del estado visual
    function sincronizarVista() {
        // Textos y barras de vida
        elementoNombre.textContent = guerrero.getNombre();
        elementoTextoVida.textContent = `${guerrero.getVida()} / ${guerrero.getVidaMaxima()}`;
        barraVida.value = guerrero.getVida();
        barraVida.max = guerrero.getVidaMaxima();

        // Posición física del muñeco
        muñecoVisual.style.left = `${guerrero.getPosicionX()}px`;

        // Renderizado del arma en la mano del muñeco
        const armaActual = guerrero.getArma();
        ranuraArmaVisual.className = "arma-slot";

        if (armaActual) {
            ranuraArmaVisual.classList.add(armaActual.getClaseGrafica());
            elementoArmaNombre.textContent = armaActual.getNombre();
            elementoArmaDanio.textContent = `Daño base: ${armaActual.getDanio()} pts`;
        } else {
            ranuraArmaVisual.classList.add("sin-arma");
            elementoArmaNombre.textContent = "Desarmado";
            elementoArmaDanio.textContent = "Daño base: 5 pts";
        }

        renderizarBotonesArmeria();
    }

    // Renderizado dinámico de la armería
    function renderizarBotonesArmeria() {
        contenedorListaArmas.innerHTML = "";
        const armaActual = guerrero.getArma();

        armeria.forEach((arma) => {
            const item = document.createElement("div");
            item.className = "tarjeta-item-arma";

            const estaEquipada = armaActual && armaActual.getId() === arma.getId();
            if (estaEquipada) {
                item.classList.add("equipada");
            }

            const info = document.createElement("div");
            const nombre = document.createElement("strong");
            nombre.textContent = arma.getNombre();
            const danio = document.createElement("p");
            danio.className = "texto-secundario";
            danio.textContent = `Poder ofensivo: ${arma.getDanio()}`;

            info.appendChild(nombre);
            info.appendChild(danio);

            const boton = document.createElement("button");
            boton.className = "btn btn-secundario";
            boton.textContent = estaEquipada ? "En Uso" : "Equipar";
            boton.disabled = estaEquipada;

            boton.addEventListener("click", () => {
                const mensaje = guerrero.equiparArma(arma);
                registrarEvento(mensaje);
                sincronizarVista();
            });

            item.appendChild(info);
            item.appendChild(boton);
            contenedorListaArmas.appendChild(item);
        });
    }

    // Desencadenadores de animaciones con CSS
    function animarAccion(claseAnimacion, duracionMs) {
        muñecoVisual.classList.remove(claseAnimacion);
        // Forzar reflujo de renderizado para permitir repetición inmediata
        void muñecoVisual.offsetWidth;
        muñecoVisual.classList.add(claseAnimacion);

        setTimeout(() => {
            muñecoVisual.classList.remove(claseAnimacion);
        }, duracionMs);
    }

    function desplazar(delta) {
        const anchoEscenario = contenedorEscenario.clientWidth;
        const anchoMuñeco = muñecoVisual.offsetWidth;
        const limiteMax = anchoEscenario - anchoMuñeco - 20;
        const limiteMin = 20;

        animarAccion("caminando", 300);
        const mensaje = guerrero.mover(delta, limiteMin, limiteMax);
        sincronizarVista();
        registrarEvento(mensaje);
    }

    // 4. Manejadores de Eventos
    btnMoverIzq.addEventListener("click", () => desplazar(-50));
    btnMoverDer.addEventListener("click", () => desplazar(50));

    btnAtacar.addEventListener("click", () => {
        animarAccion("atacando", 350);
        const log = guerrero.atacar();
        registrarEvento(log);
    });

    btnRecibirDanio.addEventListener("click", () => {
        animarAccion("herido", 400);
        const log = guerrero.recibirDanio(20);
        sincronizarVista();
        registrarEvento(log);
    });

    btnDesarmar.addEventListener("click", () => {
        const log = guerrero.desequiparArma();
        sincronizarVista();
        registrarEvento(log);
    });

    btnLimpiarLog.addEventListener("click", () => {
        contenedorLog.innerHTML = "";
    });

    // Control opcional por teclado (Flechas o A/D)
    window.addEventListener("keydown", (evento) => {
        if (evento.key === "ArrowLeft" || evento.key === "a" || evento.key === "A") {
            desplazar(-40);
        } else if (evento.key === "ArrowRight" || evento.key === "d" || evento.key === "D") {
            desplazar(40);
        } else if (evento.key === " " || evento.key === "Enter") {
            btnAtacar.click();
        }
    });

    // Inicialización del entorno
    sincronizarVista();
    registrarEvento("Entorno gráfico iniciado. El guerrero está listo en la arena.");
});