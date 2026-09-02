# Fase 6 — Elección del modelo

No hay un modelo correcto: hay un modelo correcto **por paso** de un flujo concreto. No elijas por defecto ni por reputación: elegí por perfil de tarea.

Dimensiones a evaluar para **este** caso de uso:

1. **Profundidad de razonamiento requerida** — ¿la tarea necesita planificar y recuperarse de errores, o es ejecución acotada con criterio claro?
2. **Presupuesto de latencia** — ¿hay alguien esperando en pantalla? ¿es batch nocturno?
3. **Costo por corrida tolerable** — calculalo con el consumo estimado de la fase 2, no con el precio por millón de tokens.
4. **Profundidad de tool calling** — las tareas con muchos pasos encadenados castigan más los modelos débiles: cada error se compone.
5. **Volumen** — a alto volumen, la diferencia de precio entre niveles se vuelve la variable dominante del proyecto.

Heurísticas:

- Empezá el desarrollo con el modelo **más capaz** disponible y sin optimizar. Primero conseguí que el comportamiento sea correcto; recién después bajá de nivel y medí cuánto perdés. Optimizar antes de tener comportamiento correcto es la forma más común de perder semanas.
- **Rutear por paso, no por agent.** El patrón que mejor rinde en costo es modelo grande para planificación y síntesis, modelo chico y rápido para ejecución, extracción, clasificación y subagentes. Ese es exactamente el patrón orquestador-worker.
- **Extended thinking** donde hay planificación o decisiones ambiguas; apagado donde la tarea es mecánica. Cambiarlo afecta el cacheo, así que decidilo antes de optimizar cache.
- Cambiar de modelo **invalida el cache**: tratá cada modelo como un carril distinto.
- Verificá el lineup y los precios vigentes en la documentación antes de fijar la decisión — los nombres y niveles de modelo cambian seguido.

Cerrá la fase con una tabla: paso → modelo → por qué → costo estimado por corrida.

---

## 1. Elegir el modelo óptimo para el caso de uso

No hay un modelo correcto: hay un modelo correcto **por paso** de un flujo concreto. El método:

### Paso A — Caracterizá la tarea

Puntuá el caso de uso en cinco ejes:

| Eje | Pregunta | Empuja hacia |
|---|---|---|
| Razonamiento | ¿Hay que planificar, priorizar, o recuperarse de resultados inesperados? | Modelo más capaz |
| Latencia | ¿Hay alguien esperando en pantalla? | Modelo más rápido |
| Profundidad de tool calling | ¿Cuántos pasos encadenados hasta el resultado? | Modelo más capaz (los errores se componen) |
| Ambigüedad de entrada | ¿La entrada es limpia y estructurada o texto libre desordenado? | Modelo más capaz si es desordenada |
| Volumen | ¿Cuántas corridas por día? | A mayor volumen, el costo domina |

Un agent de soporte que clasifica y responde con base de conocimiento no necesita lo mismo que un agent de research que planifica una investigación de veinte pasos.

### Paso B — Empezá arriba

Desarrollá con el modelo más capaz disponible y sin optimizaciones. Primero conseguí comportamiento correcto. Recién cuando el agent funciona, bajá de nivel y medí cuánto perdés contra tus evals.

El orden inverso —empezar barato y "ver si alcanza"— confunde dos preguntas distintas (¿está mal diseñado? ¿o el modelo no da?) y hace imposible depurar.

### Paso C — Medí la degradación, no la asumas

Corré el mismo set de evals con cada candidato y compará tres cosas: exactitud, tokens por corrida y latencia. Un modelo más chico a veces **gasta más tokens totales** porque necesita más pasos e intentos, y termina saliendo igual o más caro. Esto es común y sorprende siempre.

### Paso D — Verificá el lineup vigente

Los nombres, niveles y precios de los modelos cambian con frecuencia. Confirmá contra la documentación oficial antes de fijar la decisión, y no hardcodees supuestos de una generación anterior.

---

---

## 2. Ruteo por paso

El patrón de mejor relación costo/rendimiento en agents productivos:

| Función | Perfil de modelo |
|---|---|
| Planificación, descomposición, síntesis final | El más capaz |
| Ejecución de subtareas acotadas, subagentes | Nivel intermedio, rápido |
| Clasificación, extracción, routing, validación | El más chico que pase las evals |

Esto es exactamente el patrón orquestador-worker: en el sistema multi-agente de research de Anthropic, un modelo de nivel superior como líder con subagentes de nivel intermedio superó a un único agente del nivel superior por un margen amplio en evaluaciones internas.

**Extended thinking**: activalo donde hay planificación o decisiones ambiguas; apagalo donde la tarea es mecánica. Tiene costo en tokens y latencia, y cambiar la configuración afecta los bloques de mensajes y por lo tanto el cache. Decidí esto **antes** de optimizar cacheo.

---
