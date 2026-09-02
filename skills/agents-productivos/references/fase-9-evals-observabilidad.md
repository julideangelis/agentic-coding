# Fase 9 — Evals y observabilidad

**La unidad de evaluación es la trayectoria, no la respuesta final.** Evaluar un agent como si fuera un modelo es la razón más común por la que los agents fallan en producción. Dimensiones a puntuar por separado: selección de tool, extracción de argumentos, uso del resultado, recuperación ante error, coherencia del plan, completitud de la tarea.

**No evalúes el camino exacto.** Los sistemas agénticos son no determinísticos por diseño: dos corridas válidas pueden usar distintas tools en distinto orden y llegar a la misma respuesta correcta. Puntuá contra una rúbrica de resultado (exactitud factual, evidencia, completitud, calidad de fuentes, eficiencia de tools), no contra una secuencia esperada.

Construcción del set de evals:
- Casos **realistas** que exijan varios tool calls. Los casos de juguete no detectan nada.
- Verificadores ni demasiado estrictos (rechazar respuestas correctas por diferencias de formato) ni sobreajustados a una estrategia.
- Un set held-out que no mirás durante la iteración.
- Loop de producción: cada incidente real se convierte en un caso de regresión.

Métricas a instrumentar además de la exactitud: tokens por corrida, cantidad de tool calls, errores de tools, latencia por paso y total, tasa de escalamiento a humano, y **costo desagregado por corrida, usuario y flujo**. El failure mode silencioso más caro es el agent que empieza a gastar diez veces lo esperado por corrida sin que nadie lo note.

---

## 1. Evals de trayectoria

Evaluar un agent como si fuera un modelo —mirando sólo la respuesta final— es la razón más común por la que los agents fallan en producción. La unidad de evaluación es la **trayectoria**.

Dimensiones a puntuar por separado:

| Dimensión | Qué mide | Falla típica |
|---|---|---|
| Selección de tool | ¿Eligió la tool correcta? | Solapamiento entre tools |
| Extracción de argumentos | ¿Los parámetros son correctos? | La tool correcta con argumentos mal formados es el bug más común en producción |
| Uso del resultado | ¿La respuesta se apoya en lo que devolvió la tool? | Ignora el resultado y responde de memoria |
| Recuperación ante error | ¿Reacciona bien a un fallo? | Reintenta idéntico hasta agotar el presupuesto |
| Coherencia del plan | ¿Los pasos avanzan hacia el objetivo? | Bucles, trabajo duplicado, deriva del tema |
| Completitud | ¿Resolvió toda la tarea? | Resuelve la parte fácil y declara éxito |

### No evalúes el camino exacto

Los agents son no determinísticos por diseño. Ante la misma consulta, dos corridas pueden usar distinta cantidad de subagentes, distintas tools y distinto orden, y ambas ser correctas. Una eval que exige "llamó tool X y después tool Y" falla porque no existe un único camino correcto.

El enfoque que funciona es LLM como juez contra una **rúbrica de resultado**. En el sistema de research de Anthropic la rúbrica evalúa exactitud factual, exactitud de citas, completitud, calidad de fuentes y eficiencia en el uso de tools — sin verificar la secuencia.

Complemento útil: podés registrar qué tools esperabas que se usaran, como señal diagnóstica sobre si el agent entiende el propósito de cada una, pero sin convertirlo en criterio de aprobación.

---

---

## 2. Construir el set de evals

**Casos realistas que exijan varios tool calls.** Los entornos de juguete no estresan nada. Contraste:

- Débil: "Buscá el ticket 45892."
- Fuerte: "El cliente 9182 dice que le cobraron tres veces la misma compra. Encontrá los registros relevantes y determiná si hubo otros clientes afectados por el mismo problema."

- Débil: "Agendá una reunión con Ana la semana que viene."
- Fuerte: "Agendá una reunión con Ana la semana que viene para revisar el proyecto Acme. Adjuntá las notas de la última reunión de planificación y reservá sala."

**Verificadores calibrados.** Ni tan estrictos que rechacen respuestas correctas por diferencias de formato o puntuación, ni tan sobreajustados a una estrategia que penalicen alternativas válidas.

**Set held-out** que no mirás durante la iteración. Sin eso, optimizás contra tus propias evals y no lo notás.

**Loop de producción**: cada incidente real se convierte en caso de regresión. Es la única forma de que el set mejore con el tiempo en vez de envejecer.

**Leé las trazas crudas, no sólo los puntajes.** Lo que el agent omite suele importar más que lo que dice. Mirá dónde se traba, qué reintenta y qué evita.

---

---

## 3. Observabilidad

Cada corrida produce un árbol de eventos: llamadas al modelo, tool calls, pasos de razonamiento, errores. La traza es la verdad de lo que pasó; sin ella se depura a ciegas. El monitoreo tradicional de aplicaciones no sirve: muestra que el request devolvió 200, no que el agent entró en bucle, eligió la tool equivocada o inventó una política.

Qué instrumentar:

- **Trazas estructuradas** con spans anidados que preserven la relación padre-hijo entre agent y subagentes, incluyendo lecturas y escrituras de memoria.
- **Costo desagregado** por corrida, agent, usuario y flujo.
- **Métricas operativas**: tokens por corrida, cantidad de tool calls, errores de tools por tipo, latencia por paso y total.
- **Métricas de producto**: tasa de completitud sin intervención, tasa de escalamiento a humano, tasa de rechazo en los checkpoints de aprobación.
- **Detección de deriva** contra una línea base capturada al lanzamiento. Sin baseline no hay deriva detectable, sólo sorpresas.
- **Loop traza → dataset**: las trazas riesgosas se convierten automáticamente en casos de evaluación.

Una nota sobre la deriva: las regresiones de un agent no se parecen a un incidente de infraestructura. No hay error, no hay caída — sólo respuestas que empeoran. Si las alarmas sólo miran disponibilidad, el agent se degrada en silencio hasta que un usuario escala.

---

---

## 6. Rollout

Orden recomendado para llevarlo a producción:

1. **Shadow**: el agent corre sobre casos reales, nadie ve su salida, se comparan resultados contra lo que hizo el equipo.
2. **Asistido**: la salida va a una persona que decide, con métrica de tasa de aceptación.
3. **Autónomo acotado**: autonomía plena en el segmento de menor riesgo, con techo de volumen.
4. **Ampliación**: se abre el alcance por segmento a medida que las métricas se sostienen.

En cada escalón la pregunta es la misma: ¿la tasa de intervención justifica pasar al siguiente? Si nadie está mirando esa métrica, no hay escalón siguiente.
