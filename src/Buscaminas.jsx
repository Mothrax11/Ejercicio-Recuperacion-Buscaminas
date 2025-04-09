import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';

function Buscaminas() {
    const [tablero, setTablero] = useState([]);
    const [casillasRestantes, setCasillasRestantes] = useState(1);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [tamañoTablero, setTamañoTablero] = useState(8);
    const [clickInicalHecho, setClickInicialHecho] = useState(false);
    const [minas, setMinas] = useState(10);
    const [inicioJuego, setInicioJuego] = useState(false);

    // Crear el tablero basado en el tamaño y las minas seleccionadas
    function crearTablero(primeraClickFila, primeraClickColumna) {
        const tablero = [];
        for (let fila = 0; fila < tamañoTablero; fila++) {
            const filaNueva = [];
            for (let columna = 0; columna < tamañoTablero; columna++) {
                filaNueva.push({
                    revelada: false,
                    esBomba: false,
                    marcada: false,
                    bombasCercanas: 0
                });
            }
            tablero.push(filaNueva);
        }

        // Pone las bombas esquivando el primer click para no perder instantáneamente
        let bombasPuestas = 0;
        while (bombasPuestas < minas) {
            const filaAleatoria = Math.floor(Math.random() * tamañoTablero);
            const columnaAleatoria = Math.floor(Math.random() * tamañoTablero);
            if ((filaAleatoria !== primeraClickFila || columnaAleatoria !== primeraClickColumna) && !tablero[filaAleatoria][columnaAleatoria].esBomba) {
                tablero[filaAleatoria][columnaAleatoria].esBomba = true;
                bombasPuestas++;
            }
        }

        // Calcula la cantidad de bombas que tiene una casilla a su alrededor
        for (let fila = 0; fila < tamañoTablero; fila++) {
            for (let columna = 0; columna < tamañoTablero; columna++) {
                let cantidadBombas = 0;
                for (let filaPegada = -1; filaPegada <= 1; filaPegada++) {
                    for (let columnaPegada = -1; columnaPegada <= 1; columnaPegada++) {
                        const nuevaFila = fila + filaPegada;
                        const nuevaColumna = columna + columnaPegada;
                        if (nuevaFila >= 0 && nuevaFila < tamañoTablero && nuevaColumna >= 0 && nuevaColumna < tamañoTablero) {
                            if (tablero[nuevaFila][nuevaColumna].esBomba) {
                                cantidadBombas++;
                            }
                        }
                    }
                }
                tablero[fila][columna].bombasCercanas = cantidadBombas;
            }
        }
        return tablero;
    }

    const primerClickHandler = (fila , columna) => {
        if(clickInicalHecho == false){
            let tablero;
            do {
                tablero = crearTablero(fila, columna);
            } while (
                tablero[fila][columna].esBomba || 
                tablero[fila][columna].bombasCercanas !== 0
            );
            
            setClickInicialHecho(true);
            setTablero(tablero);
            setCasillasRestantes(tamañoTablero * tamañoTablero - minas);

        //Uso parte del codigo para revelarCasilla para que se haga aquí directamente la primera revelacion
        //Intenté hacerlo haciendo una llamada pero no me funcionaba
        const copia = copiarTablero(tablero);
        const celdasARevisar = [[fila, columna]];
        let nuevasReveladas = 0;

        while (celdasARevisar.length > 0) {
            const [f, c] = celdasARevisar.shift();
            const celda = copia[f][c];

            if (celda.revelada || celda.marcada) continue;

            celda.revelada = true;
            nuevasReveladas++;

            if (celda.esBomba) {
                setJuegoTerminado(true);
                alert("¡Perdiste! 💣");
                return;
            }

            if (celda.bombasCercanas === 0) {
                for (let df = -1; df <= 1; df++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nf = f + df;
                        const nc = c + dc;
                        if (nf >= 0 && nf < tamañoTablero && nc >= 0 && nc < tamañoTablero) {
                            celdasARevisar.push([nf, nc]);
                        }
                    }
                }
            }
        }

        const restantes = tamañoTablero * tamañoTablero - minas - nuevasReveladas;
        setCasillasRestantes(restantes);
        setTablero(copia);

        if (restantes === 0) {
            setJuegoTerminado(true);
            alert("¡Ganaste! 🎉");
        }
        } else {
            revelarCasilla(fila,columna)
        }
      }

    const copiarTablero = (tableroOriginal) => {
        const copia = [];
        for (let fila = 0; fila < tamañoTablero; fila++) {
            const filaCopia = [];
            for (let columna = 0; columna < tamañoTablero; columna++) {
                const celda = tableroOriginal[fila][columna];
                filaCopia.push({
                    revelada: celda.revelada,
                    esBomba: celda.esBomba,
                    marcada: celda.marcada,
                    bombasCercanas: celda.bombasCercanas
                });
            }
            copia.push(filaCopia);
        }
        return copia;
    };

    const ponerBandera = (e, fila, columna) => {
        e.preventDefault();
        if (juegoTerminado) return;

        const nuevoTablero = copiarTablero(tablero);
        const celda = nuevoTablero[fila][columna];
        if (!celda.revelada) {
            celda.marcada = !celda.marcada;
        }
        setTablero(nuevoTablero);
    };

    const revelarCasilla = (fila, columna) => {
        if (juegoTerminado) return;

        const nuevoTablero = copiarTablero(tablero);
        const celdasARevisar = [[fila, columna]];
        let nuevasReveladas = 0;

        while (celdasARevisar.length > 0) {
            const [f, c] = celdasARevisar.shift();
            const celda = nuevoTablero[f][c];

            if (celda.revelada || celda.marcada) continue;

            celda.revelada = true;
            nuevasReveladas++;

            if (celda.esBomba) {
                setJuegoTerminado(true);
                alert("¡Perdiste! 💣");
                return;
            }
             //Cuando se da click en una casilla que no es bomba, pero no tiene nada alrededor, revela todas las de su alrededor que no sean bombas
            if (celda.bombasCercanas === 0) {
                for (let df = -1; df <= 1; df++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nuevaFila = f + df;
                        const nuevaColumna = c + dc;

                        if (nuevaFila >= 0 && nuevaFila < tamañoTablero && nuevaColumna >= 0 && nuevaColumna < tamañoTablero) {
                            celdasARevisar.push([nuevaFila, nuevaColumna]);
                        }
                    }
                }
            }
        }
        const totalRestantes = casillasRestantes - nuevasReveladas;
        setCasillasRestantes(totalRestantes)
        setTablero(nuevoTablero);

        if (casillasRestantes === 0) {
            setJuegoTerminado(true);
            alert("¡Ganaste! 🎉");
        }
    };

    const reiniciarJuego = () => {
        const nuevoTablero = crearTablero();
        setTablero(nuevoTablero);
        setJuegoTerminado(false);
        setCasillasRestantes(tamañoTablero * tamañoTablero - minas);
        setClickInicialHecho(false)
    };

    const iniciarJuego = () => {
        setInicioJuego(true);
        const nuevoTablero = crearTablero();
        setTablero(nuevoTablero);
        setClickInicialHecho(false)
        setJuegoTerminado(false)
    };

    if (!inicioJuego) {
        return (
            <div>
                <Form>
                    <Form.Group controlId="formTamañoTablero">
                        <Form.Label>Tamaño del Tablero</Form.Label>
                        <Form.Control 
                            type="number" 
                            value={tamañoTablero} 
                            onChange={(e) => setTamañoTablero(Number(e.target.value))}
                            min="4"
                        />
                    </Form.Group>

                    <Form.Group controlId="formCantidadMinas">
                        <Form.Label>Cantidad de Minas</Form.Label>
                        <Form.Control 
                            type="number" 
                            value={minas} 
                            onChange={(e) => setMinas(Number(e.target.value))}
                            min="1"
                            max={tamañoTablero * tamañoTablero - 1}
                        />
                    </Form.Group>

                    <Button onClick={() => iniciarJuego()}>Iniciar Juego</Button>
                </Form>
            </div>
        );
    }

    return (
        <>
            <header>
                <h1 hidden={clickInicalHecho}>Haz doble click en una casilla para iniciar!</h1>
            </header>
            <body>
                <div>
                    {tablero.map((fila, filaIndex) => (
                        <div key={filaIndex} style={{ display: 'flex' }}>
                            {fila.map((celda, celdaIndex) => (
                                <Button 
                                    key={celdaIndex} 
                                    style={{ width: 30, height: 30, fontSize: 16, backgroundColor: celda.revelada ? '#ddd' : '#999' }} 
                                    onClick={() => primerClickHandler(filaIndex, celdaIndex)} 
                                    onContextMenu={(e) => ponerBandera(e, filaIndex, celdaIndex)}>
                                    {celda.revelada ? celda.esBomba ? '💣' : celda.bombasCercanas || '' : celda.marcada ? '🚩' : ''}
                                </Button>
                            ))}
                        </div>
                    ))}
                </div>
                <div>
                    <Button onClick={reiniciarJuego}>Reiniciar Juego</Button>
                </div>
            </body>
        </>
    );
}

export default Buscaminas;
