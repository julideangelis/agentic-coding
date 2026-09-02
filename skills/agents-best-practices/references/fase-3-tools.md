# Fase 3 — Diseño de tools

Las tools son el contrato entre el agent y el mundo, y son donde más rápido se degrada el rendimiento.

Armá el inventario clasificando cada tool en uno de tres tipos — la distinción importa porque cada tipo tiene un régimen de control distinto:

| Tipo | Para qué | Ejemplos |
|---|---|---|
| **Datos** | Traer contexto para ejecutar el flujo | Consultar el CRM, leer un documento, buscar en la web |
| **Acción** | Actuar sobre sistemas externos | Enviar un mail, actualizar un registro, derivar un ticket |
| **Orquestación** | Otros agents expuestos como tool | Agent de reembolsos, agent de research |

Reglas de decisión:

- **La prueba del ingeniero humano**: si una persona que conoce el sistema no puede decir con certeza cuál tool corresponde en una situación dada, el agent tampoco va a poder. Ese solapamiento es el failure mode más común.
- **Consolidá por workflow, no por endpoint**. Una tool `get_contexto_cliente` que junta datos, transacciones y notas en una llamada vale más que tres tools que replican la API interna. Envolver endpoints uno a uno es el antipatrón por defecto.
- **Devolvé señal, no estructuras**. Nombres y etiquetas en lenguaje natural en vez de UUIDs y campos técnicos. Los identificadores crípticos aumentan las alucinaciones; resolverlos a lenguaje interpretable mejora la precisión.
- **Poné techo a las respuestas**. Paginación, filtros y truncado con defaults sensatos. Un solo tool result gigante puede envenenar el resto de la corrida.
- **Los errores son prompts**. Un error tiene que decirle al agent qué hacer distinto, no arrojarle un stack trace. Este es el cambio de mentalidad más rentable del diseño de tools.
- **Namespacing** por servicio y recurso cuando hay muchas tools (`crm_buscar_cliente`, `crm_crear_nota`).
- **El problema no es la cantidad sino el solapamiento.** Hay implementaciones que manejan bien más de 15 tools bien definidas y distintas, y otras que fracasan con menos de 10 que se pisan. Si mejorar nombres, parámetros y descripciones no arregla la confusión, ahí sí conviene partir en varios agents.
- **Toda tool de acción tiene que ser segura de reintentar.** Un sistema autónomo va a chocar contra un fallo de red ambiguo —la llamada salió, la respuesta no volvió— y no va a saber si la acción ocurrió. Clave de idempotencia, timeouts explícitos, tope de reintentos y fallback definido. Sin esto, el mismo reembolso se emite dos veces; es cuestión de tiempo y volumen, no de mala suerte.

---

## 4. Diseño de tools

### Elegir qué tools construir

Más tools no es mejor. El antipatrón dominante es envolver endpoints existentes uno a uno sin preguntarse si esa granularidad le sirve a un agent.

Un programa tradicional puede recorrer una lista de contactos uno por uno sin costo. Un agent que recibe la lista completa tiene que leerla token por token y quema su recurso más escaso en información irrelevante. La tool correcta no es `listar_contactos`, es `buscar_contacto` o directamente `enviar_mensaje_a_contacto`.

Ejemplos de consolidación:

| En vez de | Construí |
|---|---|
| `listar_usuarios`, `listar_eventos`, `crear_evento` | `agendar_evento` (busca disponibilidad y agenda) |
| `leer_logs` | `buscar_logs` (devuelve sólo líneas relevantes con contexto) |
| `get_cliente`, `listar_transacciones`, `listar_notas` | `get_contexto_cliente` (compila lo reciente y relevante) |

Cada consolidación hace dos cosas: reduce las tools en contexto y **saca cómputo agéntico del contexto y lo mete adentro de la tool**, donde es determinístico y barato.

### Namespacing

Con muchas tools —propias y de servidores MCP de terceros— el solapamiento confunde. Agrupá por prefijo de servicio y de recurso: `asana_buscar`, `jira_buscar`; `asana_proyectos_buscar`, `asana_usuarios_buscar`. La elección entre prefijo y sufijo tiene efectos medibles y varía por modelo: probalo contra tus propias evals.

### Qué devolver

Priorizá relevancia contextual sobre flexibilidad. Evitá identificadores técnicos de bajo nivel (`uuid`, `mime_type`, `url_thumbnail_256px`) y preferí campos que informen la próxima acción (`nombre`, `tipo`, `estado`).

Los modelos manejan mucho mejor nombres y términos en lenguaje natural que identificadores crípticos. Resolver UUIDs arbitrarios a nombres interpretables —o incluso a un esquema de índices simple— reduce alucinaciones de forma significativa.

Cuando el agent necesita ambos, exponé un parámetro de formato de respuesta (`conciso` / `detallado`) y dejá que él elija. Un mismo resultado en versión concisa puede costar un tercio de los tokens.

El formato de la respuesta (JSON, XML, Markdown) también afecta el rendimiento y no hay un ganador universal: depende de la tarea. Es algo para medir, no para asumir.

### Eficiencia de tokens

Implementá paginación, selección de rango, filtros y truncado con defaults sensatos en cualquier tool que pueda devolver mucho. Como referencia, Claude Code limita las respuestas de tools a 25.000 tokens por defecto.

Si truncás, decíselo al agent con una instrucción útil: empujalo hacia búsquedas chicas y dirigidas en lugar de una búsqueda amplia.

### Errores como instrucciones

Un error de tool es una oportunidad de guiar el comportamiento. Comparar:

- Malo: `Error 422: invalid parameter`
- Bueno: `El parámetro fecha_desde debe tener formato AAAA-MM-DD. Recibido: "el lunes pasado". Resolvé la fecha relativa antes de llamar.`

El segundo hace que el agent se recupere solo. El primero hace que reintente igual y falle igual.

### Descripciones de tools

Escribilas como se las explicarías a alguien que entra al equipo: hacé explícito el contexto implícito, la terminología interna, las relaciones entre recursos, los formatos esperados. Nombrá los parámetros sin ambigüedad (`user_id`, no `user`).

Refinamientos chicos en las descripciones producen mejoras desproporcionadas. Es la intervención de mejor relación esfuerzo/resultado en todo el diseño de tools.

---

---

## 5. Idempotencia y reintentos

Un sistema autónomo va a chocar tarde o temprano contra un fallo de red ambiguo: la llamada se envió, la respuesta no volvió. El agent no sabe si la acción ocurrió.

Por eso toda tool de acción debe ser **segura de reintentar**, o al menos capaz de detectar duplicados. Concretamente:

- Clave de idempotencia por operación, generada antes de la llamada.
- Chequeo previo de "esto ya se hizo" en operaciones que no admitan clave.
- Timeouts explícitos por tool, distintos según si la operación es de lectura o de escritura.
- Política de reintento con backoff, y un tope de reintentos que dispare el camino de escalamiento.
- Comportamiento de fallback definido cuando el servicio de abajo no responde: ruta estática, humano, o degradación explícita. Nunca silencio.

Un agent sin idempotencia eventualmente va a emitir el mismo reembolso dos veces. No es una hipótesis: es una cuestión de tiempo y volumen.

---
