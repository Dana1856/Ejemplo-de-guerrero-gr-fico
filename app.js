// ============================================
// MODELO DE DOMINIO (POO)
// ============================================

/**
 * Entidad Arma.
 * En la agregación, esta entidad tiene un ciclo de vida propio
 * independiente de cualquier personaje.
 */
class Arma {
    #id;
    #nombre;
    #danio;

    constructor(id, nombre, danio) {
        this.#id = id;
        this.#nombre = nombre;
        this.#danio = danio;
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

    atacar() {
        return `Ataque con ${this.#nombre}: inflige ${this.#danio} puntos de daño.`;
    }
}

/**
 * Entidad Personaje.
 * Mantiene una relación de agregación con la clase Arma.
 * Recibe una referencia externa y puede desvincularse de ella sin destruirla.
 */
class Personaje {
    #nombre;
    #vida;
    #vidaMaxima;
    #arma; // Referencia a un objeto Arma o null

    constructor(nombre, vida) {
        this.#nombre = nombre;
        this.#vida = vida;
        this.#vidaMaxima = vida;
        this.#arma = null; // Inicialmente desarmado (muestra de agregación débil)
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

    getArma() {
        return this.#arma;
    }

    // Método clave de agregación: Asigna una referencia externa
    equiparArma(nuevaArma) {
        this.#arma = nuevaArma;
        return `${this.#nombre} equipó ${nuevaArma.getNombre()}.`;
    }

    // Desvincula la referencia. El arma sigue existiendo fuera del personaje.
    desequiparArma() {
        if (!this.#arma) {
            return `${this.#nombre} no tiene ningún arma equipada.`;
        }
        const nombreArmaAnterior = this.#arma.getNombre();
        this.#arma = null;
        return `${this.#nombre} guardó ${nombreArmaAnterior}. Ahora lucha con las manos vacías.`;
    }

    atacar() {
        if (this.#arma) {
            return `${this.#nombre} ataca. ${this.#arma.atacar()}`;
        }
        const danioBase = 5;
        return `${this.#nombre} ataca sin arma (golpe desarmado): inflige ${danioBase} puntos de daño.`;
    }

    recibirDanio(cantidad) {
        this.#vida = Math.max(0, this.#vida - cantidad);
        return `${this.#nombre} recibió ${cantidad} de daño. Vida restante: ${this.#vida}/${this.#vidaMaxima}.`;
    }
}

// ============================================
// CONTROLADOR Y GESTIÓN DE INTERFAZ (DOM)
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Instanciación independiente de armas (Armería externa)
    const armeria = [
        new Arma("espada-1", "Espada de Fuego", 35),
        new Arma("arco-1", "Arco Mágico", 22),
        new Arma("hacha-1", "Hacha de Guerra Pesada", 45),
        new Arma("daga-1", "Daga Sombría", 18)
    ];

    // 2. Instanciación del personaje sin arma
    const guerrero = new Personaje("Guerrero", 100);

    // 3. Referencias del DOM
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

    // Función para escribir en el registro gráfico
    function registrarEvento(mensaje) {
        const parrafo = document.createElement("p");
        parrafo.className = "linea-log";
        parrafo.textContent = `[${new Date().toLocaleTimeString()}] ${mensaje}`;
        contenedorLog.appendChild(parrafo);
        contenedorLog.scrollTop = contenedorLog.scrollHeight;
    }

    // Actualización de estado en la UI
    function actualizarInterfaz() {
        elementoNombre.textContent = guerrero.getNombre();
        elementoTextoVida.textContent = `${guerrero.getVida()} / ${guerrero.getVidaMaxima()}`;
        barraVida.value = guerrero.getVida();
        barraVida.max = guerrero.getVidaMaxima();

        const armaActual = guerrero.getArma();
        if (armaActual) {
            elementoArmaNombre.textContent = armaActual.getNombre();
            elementoArmaDanio.textContent = `Daño base: ${armaActual.getDanio()} pts`;
        } else {
            elementoArmaNombre.textContent = "Ninguna (Desarmado)";
            elementoArmaDanio.textContent = "Daño base: 5 pts";
        }

        renderizarArmeria();
    }

    // Renderiza la lista de armas disponibles en la armería externa
    function renderizarArmeria() {
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
            danio.textContent = `Daño: ${arma.getDanio()}`;

            info.appendChild(nombre);
            info.appendChild(danio);

            const boton = document.createElement("button");
            boton.className = "btn btn-secundario";
            boton.textContent = estaEquipada ? "En Uso" : "Equipar";
            boton.disabled = estaEquipada;

            boton.addEventListener("click", () => {
                const log = guerrero.equiparArma(arma);
                registrarEvento(log);
                actualizarInterfaz();
            });

            item.appendChild(info);
            item.appendChild(boton);
            contenedorListaArmas.appendChild(item);
        });
    }

    // 4. Asignación de manejadores de eventos
    btnAtacar.addEventListener("click", () => {
        const log = guerrero.atacar();
        registrarEvento(log);
    });

    btnRecibirDanio.addEventListener("click", () => {
        const log = guerrero.recibirDanio(20);
        registrarEvento(log);
        actualizarInterfaz();
    });

    btnDesarmar.addEventListener("click", () => {
        const log = guerrero.desequiparArma();
        registrarEvento(log);
        actualizarInterfaz();
    });

    btnLimpiarLog.addEventListener("click", () => {
        contenedorLog.innerHTML = "";
    });

    // Estado inicial
    actualizarInterfaz();
    registrarEvento("Sistema iniciado. El guerrero comienza desarmado.");
});