# Fase 0 — ¿Esto necesita ser un agent?

La decisión más cara del proyecto, y la que casi nadie toma explícitamente.

### Dónde un agent aporta valor real

Priorizá flujos que resistieron la automatización tradicional. Hay tres señales positivas:

- **Decisión con matices**: el trabajo requiere juicio, excepciones o sensibilidad al contexto. El contraste útil es un motor de reglas contra un investigador experimentado: el primero marca lo que viola un criterio preestablecido, el segundo detecta lo sospechoso aunque ninguna regla se haya roto.
- **Reglas difíciles de mantener**: existe un sistema de reglas que creció tanto que actualizarlo es caro y riesgoso.
- **Datos no estructurados**: hay que interpretar lenguaje natural, extraer sentido de documentos o conversar.

Si ninguna de las tres aplica claramente, una solución determinística probablemente alcance.

### La matemática que define el techo

Si cada paso es correcto el 95% de las veces, veinte pasos encadenados salen todos bien apenas el **36%** de las veces (0,95²⁰). La confiabilidad se multiplica, no se promedia. De acá salen tres consecuencias que atraviesan todo el diseño:

- Cada punto de decisión que sacás del modelo y ponés en código determinístico multiplica confiabilidad.
- Preguntarle al modelo "¿cuál de estas tres opciones?" falla mucho menos que preguntarle "¿qué hacés ahora?".
- Validar entre pasos corta la cadena antes de que un error temprano se propague.

### Preguntas a responder

- ¿El camino de resolución es predecible? Si podés dibujar el diagrama de flujo completo, es un **workflow** (pasos orquestados por código), no un agent.
- ¿Cuántos pasos hay entre el pedido y el resultado? Uno o dos → probablemente alcance un prompt con tools, sin loop.
- ¿Cuánta autonomía tolera la organización en este dominio?
- ¿El valor del resultado justifica un costo variable e impredecible por corrida?

Escala de menor a mayor complejidad, y quedate en el escalón más bajo que funcione:

1. **Prompt único** (con o sin tools) — clasificación, extracción, redacción.
2. **Cadena de prompts** con validación entre pasos — el camino es fijo.
3. **Router** — clasificar la entrada y despachar a un handler especializado.
4. **Agent** (loop autónomo) — cantidad de pasos impredecible, el modelo decide la estrategia.
5. **Multi-agente** — sólo si la tarea se descompone en hilos verdaderamente paralelos e independientes.

Señal de que se sobrediseñó: el agent tiene un loop pero en la práctica siempre llama las mismas tres tools en el mismo orden. Eso es un workflow disfrazado, con el costo y la varianza de un agent y ninguno de sus beneficios.

---

## 1. El error compuesto

La razón matemática por la que los agents que impresionan en demo se caen con tráfico real:

Si cada paso es correcto el 95% de las veces —un número que suena excelente— la probabilidad de que veinte pasos encadenados salgan todos bien es 0,95²⁰ ≈ **36%**. La confiabilidad se multiplica, no se promedia.

Consecuencias de diseño, en orden de importancia:

1. **Menos pasos con modelo es mejor que más pasos con modelo.** Cada punto de decisión que sacás del modelo y ponés en código determinístico multiplica confiabilidad, no la suma.
2. **Achicar la superficie de decisión.** No es lo mismo preguntarle al modelo "¿qué hacés ahora?" que "¿cuál de estas tres opciones corresponde?". La segunda pregunta falla mucho menos.
3. **Puntos de verificación intermedios** cortan la cadena: validar la salida de un paso antes de encadenar el siguiente evita que un error temprano se propague por quince pasos más.

Usá esta cuenta en la fase 0 cuando alguien proponga un agent de veinte pasos autónomos. Es más persuasiva que cualquier argumento cualitativo.

---
