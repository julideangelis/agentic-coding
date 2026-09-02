# Fase 5 — Arquitectura

Single vs multi-agente, patrones de coordinación, y qué hacer cuando la corrida excede la ventana de contexto.

### 5.1 Single vs multi-agente

Empezá siempre con un solo agent. Pasá a subagentes sólo si se cumple alguna de estas:

- La tarea se descompone en hilos **independientes** que pueden explorarse en paralelo (research, búsqueda amplia, revisión de muchas fuentes).
- Un subpaso genera mucho contexto del cual casi nada le sirve al agent principal (aislamiento de contexto).
- Distintos subpasos necesitan sets de tools o expertise realmente distintos.

Lo que hay que saber antes de decidir: multi-agente consume aproximadamente **15 veces** los tokens de una interacción de chat típica (un agent simple ya usa ~4x), y el gasto de tokens explica cerca del **80%** de la varianza de rendimiento en estos sistemas. O sea: el multi-agente funciona en buena medida *porque* gasta más, no a pesar de eso. El beneficio principal es exhaustividad, no velocidad, y rinde mal en tareas fuertemente interdependientes donde cada paso depende del anterior.

**Patrón de referencia: orquestador-worker.** El agent líder planifica, persiste el plan fuera de contexto, delega tareas bien delimitadas y sintetiza. Cada subagente explora con ventana limpia y devuelve un destilado corto (del orden de 1.000–2.000 tokens), no su transcripción.

**Patrón alternativo: handoff descentralizado.** Los agents operan como pares y se transfieren la ejecución entre sí según especialidad — un agent de triage recibe la consulta y le pasa el control completo al especialista, que sigue interactuando con el usuario. Sirve cuando no hace falta que nadie mantenga control central ni sintetice, típicamente en triage de conversaciones.

**El antipatrón que costó una discusión pública.** Hubo un debate real en la industria: un equipo argumentó públicamente contra los diseños multi-agente porque los subagentes paralelos toman decisiones independientes que después entran en conflicto; un día después Anthropic publicó su sistema multi-agente de research con mejoras enormes. La contradicción se resolvió en un patrón compartido: **un único orquestador dueño del contexto completo, que lanza subagentes aislados y de vida corta, cada uno resolviendo una tarea y devolviendo un resumen**. Lo que falla no es el multi-agente, es que los subagentes se comuniquen entre sí como pares sobre trabajo interdependiente. Si estás diseñando subagentes que se pasan resultados parciales entre ellos, revisá esa decisión.

### 5.2 Tareas de horizonte largo

Si la corrida puede superar la ventana de contexto, elegí palanca según la forma de la tarea:

| Palanca | Cuándo | Cuidado |
|---|---|---|
| **Compactación** | Flujo conversacional con mucho ida y vuelta | Compactar de más pierde detalle sutil; empezá maximizando recall y después ajustá precisión |
| **Limpieza de tool results** | Siempre que se pueda | Es la forma más segura y liviana: un resultado ya consumido no necesita seguir en contexto |
| **Notas estructuradas** | Trabajo iterativo con hitos, tareas de horas | Requiere que el agent lea sus notas al reanudar; verificalo explícitamente |
| **Subagentes** | Exploración paralela | Costo alto, coordinación no trivial |

---

## 5. Horizonte largo

Cuando la tarea puede exceder la ventana de contexto:

### Compactación

Resumir la conversación cerca del límite y reiniciar con el resumen. El arte está en qué se conserva y qué se descarta: comprimir de más pierde detalle sutil cuya importancia sólo aparece después.

Método para afinar el prompt de compactación: primero maximizá recall (que capture todo lo relevante de trazas complejas reales), después iterá para mejorar precisión eliminando lo superfluo.

Conservar: decisiones tomadas, restricciones, problemas sin resolver, estado actual. Descartar: resultados de tools ya consumidos, mensajes redundantes.

### Limpieza de tool results

La forma más segura y liviana de compactación. Una vez que un resultado fue consumido y su conclusión quedó en el hilo, el resultado crudo no necesita seguir ocupando contexto. Empezá por acá antes de implementar compactación completa.

### Notas estructuradas

El agent escribe notas persistentes fuera del contexto y las relee después. Da memoria persistente con muy poco overhead y permite rastrear progreso, dependencias y estado a través de decenas de tool calls.

Verificá explícitamente que el agent **lea** sus notas al reanudar. Es el punto donde más falla el patrón en la práctica.

### Subagentes

Cada subagente explora con ventana limpia y devuelve un destilado corto; el contexto detallado de búsqueda queda aislado adentro y el agent líder se dedica a sintetizar.

### Cómo elegir

- Compactación → flujo conversacional con mucho ida y vuelta.
- Notas → desarrollo iterativo con hitos claros.
- Subagentes → investigación y análisis donde la exploración paralela paga.
