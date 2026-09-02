# Modo `/audit` — checklist de gaps

Protocolo para auditar un agent que ya existe. El objetivo no es puntuar bonito: es encontrar los gaps que van a doler y ordenarlos por lo que cuesta arreglarlos contra lo que cuesta no arreglarlos.

---

## Índice del checklist

| Bloque | Dimensión | Ítems |
|---|---|---|
| A | Complejidad y encuadre | 4 |
| B | Contrato y salida | 9 |
| C | Context engineering | 8 |
| CF | Control flow y estado | 12 |
| D | Tools | 15 |
| E | Modelo | 6 |
| F | Cache y costo | 8 |
| G | HITL, permisos y seguridad | 18 |
| H | Evals | 8 |
| I | Observabilidad y operación | 10 |

---

## Protocolo

### Paso 1 — Recolectar

Pedí lo que haya disponible, sin bloquear la auditoría por lo que falte:

- System prompt y definiciones de tools.
- Descripción del flujo: qué hace, para quién, cuántas corridas por día.
- Una o dos **trazas reales** de corridas — la mejor fuente de todas, mucho más informativa que el prompt.
- Métricas existentes: costo por corrida, latencia, tasa de éxito.
- Los tres últimos incidentes o quejas.

Si no hay nada de esto, la primera conclusión de la auditoría ya es un hallazgo: **no se puede operar lo que no se mide**.

### Paso 2 — Recorrer el checklist

Marcá cada ítem con uno de tres estados:

- **OK** — resuelto y verificable.
- **GAP** — falta o está mal resuelto.
- **N/A** — no aplica a este caso, con el motivo anotado.

No inventes un OK por ausencia de evidencia. "No pude verificar" es GAP hasta que se demuestre lo contrario.

Cuando un ítem da GAP y hace falta explicar la consecuencia o proponer el arreglo, abrí el archivo de fase indicado al inicio de cada bloque. El checklist dice qué falta; el archivo de fase dice por qué importa y cómo se resuelve.

### Paso 3 — Clasificar cada gap

| Severidad | Criterio |
|---|---|
| **Crítico** | Puede causar daño irreversible, pérdida de datos, exposición de información o gasto descontrolado |
| **Alto** | Degrada la calidad de forma sistemática o impide detectar problemas |
| **Medio** | Cuesta plata o latencia sin romper nada |
| **Bajo** | Deuda de diseño, molesta al iterar |

Cruzalo con esfuerzo estimado (bajo / medio / alto). Los críticos se arreglan aunque cuesten; los medios de esfuerzo bajo suelen ser las mejores victorias tempranas.

### Paso 4 — Reportar

Formato en la última sección de este documento.

---

## Checklist

### A. Complejidad y encuadre

Detalle y remedios: `fase-0-complejidad.md`

- [ ] A1. La decisión de que sea un agent y no un workflow está tomada explícitamente y se puede justificar.
- [ ] A2. El loop realmente varía: distintas corridas usan distintas tools o distinta cantidad de pasos. *(Si siempre es igual, es un workflow disfrazado.)*
- [ ] A3. Si es multi-agente, la tarea se descompone en hilos genuinamente independientes.
- [ ] A4. Existe una versión más simple que se probó y no alcanzó, y se sabe por qué.

### B. Contrato y salida

Detalle y remedios: `fase-1-contrato.md`

- [ ] B1. El formato de salida está definido y, si se consume programáticamente, validado contra un esquema.
- [ ] B2. Hay reintento definido ante fallo de validación de salida.
- [ ] B3. La salida incluye evidencia o fuentes cuando la tarea lo amerita.
- [ ] B4. Existe una rama "no tengo información suficiente" explícita y el agent la usa. *(Verificalo con un caso donde efectivamente no debería poder responder.)*
- [ ] B5. Las salidas largas se escriben fuera de contexto y se devuelve una referencia.
- [ ] B6. Está definido el criterio de éxito de la tarea.
- [ ] B7. Hay techo duro de iteraciones, tool calls y tokens por corrida.
- [ ] B8. Está definido qué pasa con un resultado parcial, distinto de un fracaso.
- [ ] B9. Hay ruta de escalamiento a humano con el contexto necesario.

### C. Context engineering

Detalle y remedios: `fase-2-contexto.md`

- [ ] C1. El system prompt está a la altitud correcta: ni árbol de decisión hardcodeado ni consignas vagas.
- [ ] C2. Está organizado en secciones delimitadas.
- [ ] C3. Los ejemplos son pocos, diversos y canónicos — no una lista de edge cases acumulados.
- [ ] C4. Cada instrucción del prompt responde a un failure mode observado, no a un miedo hipotético.
- [ ] C5. La estrategia de recuperación (precarga / just-in-time / híbrida) es una decisión, no un accidente.
- [ ] C6. Se conoce el presupuesto de tokens de arranque (system + tools + precarga) y qué fracción de la ventana ocupa.
- [ ] C7. Hay una estrategia definida para cuando la corrida se acerca al límite de contexto.
- [ ] C8. Si usa notas o memoria persistente, está verificado que las **lee** al reanudar.

### CF. Control flow y estado

Detalle y remedios: `fase-4-control-flow-estado.md`

- [ ] CF1. Está definido explícitamente quién es dueño del loop: el modelo o el código.
- [ ] CF2. Hay escotilla de emergencia completa: tope de iteraciones **más** timeout **más** condiciones de completitud. *(Los tres, no uno.)*
- [ ] CF3. Los puntos donde se invoca al modelo son deliberados; no hay decisiones dadas al modelo que la lógica determinística podría resolver.
- [ ] CF4. La superficie de decisión está acotada — se le pregunta al modelo cuál de N opciones, no "qué hacés ahora", donde eso es posible.
- [ ] CF5. El estado vive en almacenamiento serializable fuera del modelo, no sólo en el contexto.
- [ ] CF6. El agent puede pausar y reanudar una tarea larga.
- [ ] CF7. El agent se recupera de una caída sin perder el trabajo hecho.
- [ ] CF8. Cualquier instancia del servicio puede atender cualquier request. *(Si no, no hay escalado horizontal.)*
- [ ] CF9. Antes de una acción con efecto, se relee el estado real del recurso en vez de confiar en el contexto acumulado.
- [ ] CF10. Los tres tipos de memoria están diferenciados; nada que pueda desactualizarse está memorizado en vez de recuperado.
- [ ] CF11. Los prompts están versionados en el repositorio y se comparan contra evals antes de mergear.
- [ ] CF12. La versión de prompt queda registrada en las trazas, para poder correlacionar una regresión con su causa.

### D. Tools

Detalle y remedios: `fase-3-tools.md`

- [ ] D1. Ninguna tool se solapa con otra al punto de que una persona informada dudaría cuál usar.
- [ ] D2. Las tools están consolidadas por workflow, no espejando endpoints de la API interna.
- [ ] D3. Las respuestas devuelven lenguaje natural interpretable en vez de identificadores crípticos.
- [ ] D4. Toda tool que puede devolver mucho tiene paginación, filtro o truncado con default sensato.
- [ ] D5. Los mensajes de error son accionables para el agent, no stack traces.
- [ ] D6. Las descripciones hacen explícito el contexto implícito y la terminología interna.
- [ ] D7. Los parámetros están nombrados sin ambigüedad.
- [ ] D8. Hay namespacing si el conjunto de tools es grande o mezcla servidores de terceros.
- [ ] D9. Se revisó si alguna tool se puede eliminar. *(Casi siempre hay una.)*
- [ ] D10. Cada tool está clasificada por tipo: datos, acción u orquestación.
- [ ] D11. Toda tool de acción es idempotente o detecta duplicados. *(Preguntá directamente: ¿qué pasa si la llamada sale y la respuesta no vuelve?)*
- [ ] D12. Hay timeouts explícitos por tool, diferenciados entre lectura y escritura.
- [ ] D13. Hay política de reintento con tope, y el tope dispara escalamiento en vez de fallar en silencio.
- [ ] D14. Hay comportamiento de fallback definido cuando el servicio de abajo no responde.
- [ ] D15. Las definiciones de tools están versionadas.

### E. Modelo

Detalle y remedios: `fase-6-modelo.md`

- [ ] E1. La elección de modelo se justificó contra el perfil de la tarea, no por default.
- [ ] E2. Se midió al menos un modelo alternativo contra las mismas evals.
- [ ] E3. La comparación incluyó tokens totales y latencia, no sólo exactitud. *(Un modelo más chico puede gastar más tokens totales por necesitar más pasos.)*
- [ ] E4. Los pasos distintos usan modelos distintos donde tiene sentido.
- [ ] E5. Extended thinking está activado donde hay planificación y apagado donde no.
- [ ] E6. La elección se revisó contra el lineup vigente y no quedó atada a una generación anterior.

### F. Cache y costo

Detalle y remedios: `fase-7-cache-costos.md`

- [ ] F1. Hay prompt caching implementado.
- [ ] F2. No hay timestamps, IDs de sesión ni datos de usuario **arriba** del prefijo estable. *(Gap más frecuente de toda la auditoría.)*
- [ ] F3. Las definiciones de tools son estables entre corridas y están del lado cacheable.
- [ ] F4. Los resultados de tools volátiles no contaminan el prefijo.
- [ ] F5. Se verificó la tasa de aciertos de cache real, no se asume que funciona.
- [ ] F6. No se está pagando escritura de cache sobre contenido que no se reutiliza.
- [ ] F7. Se conoce el costo por corrida y está instrumentado por corrida, usuario y flujo.
- [ ] F8. Hay techo de costo con corte automático.

### G. HITL, permisos y seguridad

Detalle y remedios: `fase-8-guardrails-hitl.md`

- [ ] G1. Cada tool está clasificada por reversibilidad (sin efecto / reversible con costo / irreversible).
- [ ] G2. Toda acción irreversible o externa requiere aprobación humana.
- [ ] G3. La pantalla de aprobación muestra acción, argumentos, justificación y consecuencia del rechazo.
- [ ] G4. Está definido el timeout de aprobación y el default es no ejecutar.
- [ ] G5. Está definido qué hace el agent ante un rechazo.
- [ ] G6. Se mide la tasa de rechazo por checkpoint. *(Cercana a cero de forma sostenida = checkpoint que podría relajarse; alta = problema aguas arriba.)*
- [ ] G7. Privilegio mínimo con alcance explícito por tool y recurso.
- [ ] G8. El contenido externo recuperado está claramente separado de las instrucciones del sistema.
- [ ] G9. Ningún contenido recuperado puede ampliar permisos ni disparar acciones irreversibles por sí solo.
- [ ] G10. Ejecución de código en sandbox, si aplica.
- [ ] G11. Límites de tasa por agent y por usuario.
- [ ] G12. Log completo de tool calls con argumentos.
- [ ] G13. Redacción de datos sensibles en entrada y salida.
- [ ] G14. Existe kill switch y alguien sabe usarlo.
- [ ] G15. Hay guardrails en capas, no una sola verificación: al menos relevancia, seguridad, datos personales y validación de salida.
- [ ] G16. Los guardrails corren en paralelo al agent, no encadenados antes de él sumando latencia al camino feliz.
- [ ] G17. Cada guardrail existente responde a un fallo real observado, no a un catálogo genérico copiado.
- [ ] G18. Además del riesgo de la acción, hay un disparador de escalamiento por **umbral de fallos** (N reintentos sin entender la intención).

### H. Evals

Detalle y remedios: `fase-9-evals-observabilidad.md`

- [ ] H1. Existe un set de evals. *(Si no, este es el gap crítico que bloquea todos los demás: sin evals no se puede verificar ninguna corrección.)*
- [ ] H2. Los casos son realistas y exigen varios tool calls.
- [ ] H3. Se evalúa la trayectoria, no sólo la respuesta final.
- [ ] H4. No se puntúa contra una secuencia esperada de tools.
- [ ] H5. La rúbrica cubre exactitud, evidencia, completitud y eficiencia.
- [ ] H6. Hay un set held-out que no se usa para iterar.
- [ ] H7. Los incidentes de producción se convierten en casos de regresión.
- [ ] H8. Alguien lee las trazas crudas, no sólo los puntajes agregados.

### I. Observabilidad y operación

Detalle y remedios: `fase-9-evals-observabilidad.md`

- [ ] I1. Hay traza estructurada de cada corrida, con spans anidados si hay subagentes.
- [ ] I2. Se registran tokens, tool calls, errores de tools y latencia por paso.
- [ ] I3. Hay línea base capturada al lanzamiento para poder detectar deriva.
- [ ] I4. Hay alarmas sobre calidad, no sólo sobre disponibilidad.
- [ ] I5. Se mide tasa de completitud sin intervención y tasa de escalamiento.
- [ ] I6. Las trazas riesgosas alimentan el set de evals.
- [ ] I7. El agent tiene dueño identificado.
- [ ] I8. Se puede reproducir una corrida a partir de su traza para depurarla.
- [ ] I9. Producto, ingeniería, seguridad y operaciones miden **las mismas** métricas de éxito. *(Si cada área optimiza la suya —uno calidad, otro costo, otro riesgo de escalamiento— nadie sabe si el sistema mejora.)*
- [ ] I10. Se comparan arquitecturas, prompts y modelos entre sí, no sólo se revisan corridas malas aisladas.

---

## Formato del reporte

```markdown
# Auditoría — [nombre del agent]

## Resumen
[3–5 líneas: qué hace el agent, en qué estado está, y el hallazgo principal.]

## Semáforo por dimensión
| Dimensión | Estado | Gaps |
|---|---|---|
| Complejidad y encuadre | 🟢 / 🟡 / 🔴 | n |
| Contrato y salida | | |
| Context engineering | | |
| Control flow y estado | | |
| Tools | | |
| Modelo | | |
| Cache y costo | | |
| HITL y seguridad | | |
| Evals | | |
| Observabilidad | | |

## Hallazgos críticos
Por cada uno: qué falta, qué puede pasar si no se arregla, qué hacer.

## Hallazgos altos y medios
Agrupados por dimensión, con esfuerzo estimado.

## Plan sugerido
1. Ahora: [críticos + medios de esfuerzo bajo]
2. Próximo ciclo: [altos]
3. Deuda: [bajos]

## No verificable
Lo que no se pudo evaluar y qué haría falta para hacerlo.
```

Dos reglas al escribir el reporte:

**Ordená por impacto, no por número de ítem.** Si el gap crítico es F2, F2 va primero, no A1.

**No entregues sólo la lista.** Cada hallazgo necesita la consecuencia concreta. "No hay evals" no mueve a nadie; "no hay forma de saber si el próximo cambio de prompt empeora el agent, y ya hubo dos incidentes de calidad este mes" sí.
