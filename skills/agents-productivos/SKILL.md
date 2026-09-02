---
name: agents-productivos
description: Guía de diseño y auditoría para agents de producción que NO son coding agents, como asistentes de soporte, research, back-office, análisis y orquestación de procesos. Cubre las decisiones de complejidad (agent vs workflow), contrato de salida estructurada, context engineering, diseño de tools, arquitectura single vs multi-agente, elección de modelo, prompt caching y economía de tokens, human-in-the-loop, evals de trayectoria y observabilidad. Usá esta skill siempre que alguien esté diseñando, revisando, escalando, abaratando o depurando un agent, incluso si no menciona best practices ni producción. Alcanza con que hable de un agent con tools, un asistente que ejecuta acciones, un flujo agéntico o subagentes, o que pregunte por qué su agent es lento, caro, inconsistente o se va de tema. También activala ante pedidos de auditar, revisar o armar un checklist de un agent existente.
---
# Agents productivos: guía de diseño y auditoría

Este documento es el mapa. El contenido de cada fase vive en su propio archivo en `references/` — leé sólo los que necesites para la decisión que tenés adelante, no todos de entrada.

## Elegí el modo

| Situación | Modo | Qué hacer |
|---|---|---|
| Se está diseñando o rediseñando un agent | **Diseño** | Recorrer las fases 0 → 9 de abajo, en orden, leyendo el archivo de cada una |
| Ya existe un agent y se quiere encontrar qué le falta | **Auditoría** (`/audit`) | Ir directo a `references/audit.md` y seguir ese protocolo |

En modo diseño no hace falta cerrar las diez fases en una sola conversación. Lo que sí importa es no saltear las fases 0 y 1: casi todos los agents que fracasan en producción fallan ahí, no en las capas técnicas de más abajo.

## El principio rector

Un agent es un LLM usando tools en un loop. Todo lo demás —arquitectura, cache, memoria, subagentes— existe para resolver un solo problema: **el contexto es un recurso finito con rendimientos decrecientes**. La atención del modelo se reparte entre todos los tokens presentes, así que cada token que agregás le resta presupuesto a los demás. El objetivo permanente es el conjunto más chico posible de tokens de alta señal que haga probable el resultado deseado.

"Mínimo" no significa "corto": significa que no sobra nada. Un system prompt de 2.000 tokens donde cada línea cambia el comportamiento es mejor que uno de 400 que deja al agent adivinando.

## Cómo conducir la conversación de diseño

No dispares las diez fases como un cuestionario. Preguntá lo mínimo para desbloquear cada decisión, proponé un default razonado, y dejá que la persona lo corrija. Cuando falte información, decí qué asumís en vez de frenar.

Al cerrar cada fase, registrá la decisión y el motivo. El entregable final es un documento de diseño, no una charla.

Leé el archivo de la fase **antes** de hacer las preguntas de esa fase. Cada archivo tiene los defaults razonados y los failure modes conocidos; preguntar sin eso produce entrevistas genéricas.

---

## Las diez fases

### Fase 0 — ¿Esto necesita ser un agent?
`references/fase-0-complejidad.md`

La decisión más cara del proyecto. Cubre las tres señales de que un agent aporta valor real, la escala de complejidad de cinco escalones, y la matemática del error compuesto (95% por paso × 20 pasos = 36%) que define el techo de confiabilidad de todo lo demás.

**Salida de la fase**: qué escalón de complejidad, y por qué se descartó el anterior.

### Fase 1 — El contrato de la tarea
`references/fase-1-contrato.md`

Qué entra, qué sale y cuándo termina. Salida estructurada, campos de evidencia y confianza, la rama "no sé", las cuatro condiciones de terminación y el criterio de éxito medible.

**Salida de la fase**: esquema de salida, condiciones de terminación, y la frase verificable de éxito.

### Fase 2 — Context engineering
`references/fase-2-contexto.md`

Altitud del system prompt, estructura, ejemplos, y la elección entre precarga, just-in-time e híbrida. Incluye el presupuesto de contexto y el tratamiento del prompt como código versionado.

**Salida de la fase**: estrategia de recuperación y presupuesto estimado de tokens.

### Fase 3 — Diseño de tools
`references/fase-3-tools.md`

Taxonomía datos/acción/orquestación, consolidación por workflow, qué devolver, errores como instrucciones, y la exigencia de idempotencia en toda tool de acción.

**Salida de la fase**: inventario de tools con tipo, riesgo y si es reintentable.

### Fase 4 — Control flow y estado
`references/fase-4-control-flow-estado.md`

Quién es dueño del loop —el modelo o el código—, la escotilla de emergencia, el estado en almacenamiento externo, y los tres tipos de memoria. La fase que más suele faltar.

**Salida de la fase**: postura de control, dónde vive el estado, límites duros del loop.

### Fase 5 — Arquitectura
`references/fase-5-arquitectura.md`

Single vs multi-agente con los números de costo reales, patrón orquestador-worker vs handoff descentralizado, el antipatrón de subagentes que se hablan entre sí, y las palancas de horizonte largo.

**Salida de la fase**: topología y palanca de horizonte largo.

### Fase 6 — Elección del modelo
`references/fase-6-modelo.md`

Los cinco ejes para caracterizar la tarea, el método de empezar arriba y medir la degradación, y el ruteo por paso en vez de por agent.

**Salida de la fase**: tabla paso → modelo → por qué → costo estimado.

### Fase 7 — Cache y economía de tokens
`references/fase-7-cache-costos.md`

Mecánica del prefijo literal, la lista de lo que rompe el cache, y el cálculo de costo por corrida.

**Salida de la fase**: orden del prefijo con el borde estable/variable marcado.

### Fase 8 — Guardrails, HITL y seguridad
`references/fase-8-guardrails-hitl.md`

Guardrails en capas con ejecución optimista, clasificación de riesgo por tool, diseño del checkpoint humano, privilegio mínimo y defensa contra inyección indirecta.

**Salida de la fase**: capas de guardrails y matriz de aprobación humana.

### Fase 9 — Evals y observabilidad
`references/fase-9-evals-observabilidad.md`

Evals de trayectoria, por qué no se puntúa el camino exacto, qué instrumentar, y el orden de rollout de shadow a autónomo.

**Salida de la fase**: 5–10 casos iniciales y las métricas a instrumentar.

---

## Entregable del modo diseño

Cerrá con un documento que junte las salidas de las diez fases, en ese orden, más una sección final de **riesgos abiertos**: lo que no se decidió y qué haría falta para decidirlo.

### Una advertencia sobre el andamiaje

Parte de lo que se construye para compensar las limitaciones de los modelos actuales va a volverse innecesario a medida que los modelos mejoren. Es el argumento más fuerte contra la sobre-ingeniería, y conviene tenerlo presente: revisá periódicamente si alguna capa de andamiaje sigue ganándose el lugar.

El contrapunto también es válido, y es lo que separa el andamiaje transitorio del permanente: la ventana de contexto finita, la necesidad de pausar y reanudar de forma segura, la coherencia entre un dato en la página 5 y el mismo dato en la página 800, y la idempotencia frente a fallos de red **no se resuelven con modelos mejores**. Esas capas se quedan.

---

## Modo `/audit`

Cuando el pedido sea revisar un agent existente en vez de diseñar uno, leé `references/audit.md`: tiene el protocolo de recolección, el checklist completo por dimensión, la escala de severidad y el formato del reporte.

Los archivos de fase siguen siendo útiles en modo auditoría: cuando un check da GAP y hace falta explicar la consecuencia o proponer el arreglo, abrí el archivo de la fase correspondiente. El checklist dice *qué* falta; el archivo de fase dice *por qué importa* y *cómo se resuelve*.
