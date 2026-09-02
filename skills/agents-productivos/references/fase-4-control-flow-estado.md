# Fase 4 — Control flow y estado

La tesis incomoda un poco: **un agent productivo es, en su mayor parte, software determinístico que llama a un modelo en unos pocos puntos elegidos a propósito**. Esta es la fase que más suele faltar en agents que funcionan en demo y se caen en producción.

### 4.1 ¿Quién es dueño del loop?

Dos posturas legítimas; elegí a conciencia en vez de heredar la del framework:

- **El modelo conduce**: definís prompt, tools y modelo, y el modelo planifica dentro de ese entorno. Menos código, mejor adaptación a pedidos mal especificados, y exigencia mucho mayor de guardrails, evals y observabilidad.
- **El código conduce**: el flujo es código común, y el modelo se invoca en dos o tres puntos donde la decisión realmente requiere juicio. Más barato, predecible y testeable.

La postura del código rinde mejor cuanto más regulado, repetitivo y auditado sea el dominio. La mayoría de los agents de soporte, back-office y operaciones caen más cerca de esa postura de lo que sus equipos suponen al arrancar — y es coherente con la matemática de la fase 0: cada decisión que sacás del modelo multiplica confiabilidad.

**Escotilla de emergencia**: tope de iteraciones, timeout de reloj y condiciones explícitas de completitud. Los tres juntos, siempre, independientemente de la postura.

### 4.2 Estado fuera del modelo

El modelo arranca de cero en cada llamada. Tratá eso como ventaja: la aplicación guarda el estado real del trabajo —conversación, plan, progreso, resultados, pendientes de reintento— en almacenamiento serializable y **reconstruye el contexto desde ahí en cada llamada**.

Lo que esto habilita y no se consigue de otra forma: pausar y reanudar tareas largas, recuperarse de una caída, y escalar horizontalmente (si el estado vive afuera, cualquier instancia atiende cualquier request).

Ojo con confundirlo con las notas estructuradas de la fase 5: las notas resuelven el límite de la ventana de contexto, el estado externo resuelve durabilidad y escalado. Son cosas distintas y un agent productivo necesita las dos.

**Reconciliación**: antes de una acción con efecto, releé el estado real del recurso en vez de confiar en lo que quedó en contexto veinte pasos atrás. Muchos errores que parecen alucinaciones son razonamiento correcto sobre datos vencidos.

**Memoria**: distinguí contexto de corto plazo, memoria persistente (hechos durables) y recuperación. La memoria persistente se sobreusa: si el dato puede quedar desactualizado, recuperalo en vez de memorizarlo.

---

## 2. Quién es dueño del loop

Hay dos posturas legítimas y conviene elegir a conciencia en vez de heredar la del framework que se esté usando.

**Postura A — el modelo conduce.** Definís system prompt, tools y modelo, y dejás que planifique dentro de ese entorno acotado. Menos código de branching, mejor adaptación a pedidos mal especificados, más fácil cambiar de modelo o sumar tools sin reescribir la orquestación. Exige guardrails, evals y observabilidad mucho más fuertes.

**Postura B — el código conduce.** El flujo general es código común: secuencia de pasos, condicionales y llamadas a sistemas externos. En dos o tres puntos donde la decisión realmente requiere juicio, se invoca al modelo. En todo el resto, lógica determinística — más barata, predecible y testeable.

**Cómo elegir**: la postura B rinde mejor cuanto más regulado, repetitivo y auditado sea el dominio, y cuanto mayor sea el costo de improvisar. La postura A rinde mejor cuanto más variable e impredecible sea la entrada. La mayoría de los agents productivos de back-office, soporte y operaciones caen más cerca de B de lo que sus equipos suponen al arrancar.

El punto de acuerdo entre ambas posturas: **empezá con la versión más simple que resuelve el problema y otorgá autonomía sólo donde la lógica simple se queda corta.**

### La escotilla de emergencia

Independientemente de la postura, todo loop necesita un límite duro que lo obligue a frenar. Tres controles juntos, no uno:

- Tope de iteraciones.
- Timeout de reloj.
- Condiciones explícitas de completitud.

Los tres garantizan que el agent se detiene aunque el modelo quiera seguir. Un loop con condiciones de salida débiles consume tokens y plata en cada vuelta sin que nada falle visiblemente.

---

---

## 3. Estado fuera del modelo

El modelo arranca de cero en cada llamada: ve sólo el contexto que le pasás, toma una decisión y descarta todo. Tratá esa propiedad como una **ventaja de diseño**, no como una limitación.

La aplicación guarda el estado real del trabajo —la conversación, el plan, el progreso, los resultados de tools, lo que falta reintentar— en almacenamiento serializable, y **reconstruye el contexto desde ahí en cada llamada**.

Lo que esto habilita, y que no se consigue de ninguna otra forma:

- **Pausar y reanudar** una tarea larga sin perder el hilo.
- **Recuperarse de una caída** cargando el estado guardado y continuando.
- **Escalar horizontalmente**: si el estado vive afuera, cualquier instancia del servicio puede atender cualquier request, porque todo lo necesario se reconstruye. Sin esto no hay balanceo de carga posible.
- **Testear**: mismo estado más mismo evento produce el mismo resultado.

El modelo mental útil: el modelo es una función que toma `(estado actual, evento nuevo)` y devuelve `(estado siguiente, acción a ejecutar)`.

**Cuidado con el antipatrón**: cuando el plan vive únicamente dentro del contexto del modelo, una caída o una tarea larga se lleva puesto todo el trabajo. Las notas estructuradas (ver `fase-5-arquitectura.md`) son una versión liviana de esto, pero no son lo mismo: las notas resuelven el límite de la ventana de contexto, el estado externo resuelve durabilidad, reanudación y escalado. Un agent productivo necesita las dos cosas por motivos distintos.

### Memoria: tres tipos que no hay que mezclar

| Tipo | Para qué | Riesgo |
|---|---|---|
| **Contexto de corto plazo** | La tarea actual | Se pierde al terminar; no guardes acá nada que necesites después |
| **Memoria persistente** | Hechos durables: preferencias estables, estado de un caso largo | Envejece mal; hay que definir qué la invalida |
| **Recuperación (RAG)** | Conocimiento que cambia: documentos, políticas, catálogos | Depende críticamente de la calidad del chunking y la recuperación |

La memoria persistente se sobreusa. Para conocimiento que cambia, la recuperación es casi siempre mejor: mantiene al agent anclado en el documento vigente en vez de en una copia congelada dentro del prompt. Regla práctica: si el dato puede quedar desactualizado, no lo memorices — recuperalo.

---

---

## 4. Reconciliación con la verdad del sistema

Existen dos estados que pueden divergir sin que nadie lo note:

- Lo que el modelo **cree** que está pasando, según su contexto.
- Lo que **efectivamente** dice el sistema de registro (la base, el CRM, el inventario).

Cuando divergen, el agent actúa sobre una foto vieja. Es una de las causas más frecuentes de errores que parecen alucinaciones pero no lo son: el modelo razonó bien sobre datos vencidos.

Mitigación: antes de una acción con efecto, releé el estado real del recurso involucrado en vez de confiar en lo que quedó en el contexto veinte pasos atrás. Es una llamada extra que evita la clase de error más difícil de depurar.

---
