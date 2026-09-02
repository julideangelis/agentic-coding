# Fase 8 — Guardrails, HITL y seguridad

**La regla**: el rigor de los controles es proporcional a la autonomía y a la reversibilidad de las acciones. Un agent que sólo lee y redacta necesita poco; uno que escribe en sistemas de registro necesita mucho.

### Guardrails en capas

Ningún control alcanza por sí solo. Pensalos como defensa en capas, combinando verificaciones basadas en modelo con reglas determinísticas:

| Capa | Qué hace |
|---|---|
| **Clasificador de relevancia** | Marca consultas fuera del alcance previsto |
| **Clasificador de seguridad** | Detecta jailbreaks e intentos de extraer el prompt del sistema |
| **Filtro de datos personales** | Revisa entrada y salida por información sensible |
| **Moderación** | Contenido dañino o inapropiado |
| **Reglas determinísticas** | Listas de bloqueo, límites de longitud, regex, validación de inyección |
| **Validación de salida** | Que la respuesta cumpla el esquema y las políticas de marca |

Dos detalles de implementación que importan:

- **Ejecución optimista**: los guardrails corren en paralelo con el agent, no en serie antes de él, y disparan una excepción si se viola una restricción. En serie, cada capa suma latencia al camino feliz, que es el 99% de los casos.
- **Heurística de construcción**: arrancá con privacidad de datos y seguridad de contenido, y agregá capas nuevas a partir de fallos reales que vayas encontrando. No intentes anticipar todo el catálogo de ataques desde el día uno.

Los guardrails no reemplazan autenticación, autorización ni control de acceso — los complementan.

### Clasificación de riesgo por tool

Puntuá cada tool según cuatro ejes: lectura vs escritura, reversibilidad, permisos de cuenta que requiere, e impacto económico. Esa puntuación es la que dispara automáticamente el control correspondiente. Clasificá **cada tool** en una de tres categorías y hacelo explícito en el diseño:

| Categoría | Ejemplos | Control |
|---|---|---|
| **Reversible / sin efecto** | leer, buscar, resumir, calcular | Autonomía plena |
| **Reversible con costo** | crear borrador, agendar, abrir ticket | Autonomía con log y notificación |
| **Irreversible o externa** | enviar comunicación a un tercero, mover dinero, borrar, modificar registro maestro | **Aprobación humana obligatoria** |

Hay dos disparadores distintos de intervención humana y conviene implementar los dos: **acción de alto riesgo** (la matriz de arriba) y **umbral de fallos superado** — el agent reintentó N veces sin entender la intención, o agotó su presupuesto de pasos. El segundo se olvida seguido y es el que evita que el usuario quede atrapado en un loop.

Diseño del checkpoint humano (esto se diseña, no se improvisa): qué ve la persona al aprobar (acción, argumentos, justificación del agent, qué pasa si dice que no), cuánto tiempo tiene, qué ocurre si no responde, y si el rechazo corta el loop o lo reencamina. Un botón de aprobar sin contexto suficiente se convierte en un sello automático y no aporta seguridad real.

Controles mínimos para producción:
- Privilegio mínimo por tool y por recurso, con alcance explícito (no "acceso a la base", sino "lectura de estas tablas").
- Defensa contra inyección indirecta: todo contenido externo que entra al contexto —mails, documentos, tickets, páginas web, registros de base— es input no confiable y puede contener instrucciones. Separalo claramente de las instrucciones del sistema y nunca dejes que decida sobre permisos.
- Sandbox para ejecución de código.
- Límites de tasa y de costo por corrida y por usuario.
- Log completo de tool calls con argumentos, y kill switch.
- Redacción de datos sensibles en entrada y salida.

---

## 4. Human-in-the-loop

El HITL se diseña. Un botón de "aprobar" sin contexto suficiente se convierte en un sello automático y da falsa sensación de control.

### Qué necesita ver la persona

Antes de aprobar, en una sola pantalla:
1. La acción concreta y sus argumentos exactos.
2. La justificación del agent — por qué llegó ahí.
3. Qué evidencia usó.
4. Qué pasa si rechaza.

### Qué definir

- **Umbral**: qué dispara el checkpoint. Puede ser categoría de acción, monto, contraparte externa, o confianza declarada por debajo de un valor.
- **Timeout**: qué pasa si nadie responde. El default seguro es **no ejecutar**.
- **Efecto del rechazo**: ¿corta el loop, o vuelve al agent con el motivo para que reintente distinto? La segunda opción es más útil pero requiere que el motivo se capture de forma estructurada.
- **Registro**: toda aprobación, rechazo y override se loguea con el contexto completo.

### Calibración

Demasiados checkpoints y el agent deja de aportar valor: la persona hace el trabajo igual, más lento. Muy pocos y el primer error grave es también el último. Medí la **tasa de rechazo** en cada checkpoint: si es cercana a cero de forma sostenida, esa acción probablemente puede pasar a autonomía con log. Si es alta, el problema está aguas arriba, en el prompt o en las tools.

---

---

## 5. Permisos y seguridad

El rigor de los controles es proporcional a la autonomía y a la reversibilidad de las acciones.

### Privilegio mínimo

Definí alcance explícito por tool y por recurso. No "acceso a la base de datos" sino "lectura de estas tablas, sin acceso a estas columnas". No des tools de escritura a roles que sólo consultan. Credenciales de vida corta, nunca en el prompt.

### Inyección indirecta de prompts

Todo contenido externo que entra al contexto —mails, documentos, tickets, páginas web, filas de una base, resultados de búsqueda— es **input no confiable** y puede contener instrucciones dirigidas al agent. Este es el vector más explotado en despliegues agénticos.

Mitigaciones que funcionan en capas:
- Separación clara y consistente entre instrucciones del sistema y contenido recuperado (delimitadores explícitos, y una instrucción de que el contenido delimitado es datos, no órdenes).
- El contenido recuperado **nunca** decide sobre permisos, ni puede ampliar el alcance de una acción.
- Las acciones irreversibles pasan por aprobación humana, sin importar de dónde vino la instrucción.
- Sandbox para ejecución de código.
- Registro de intentos sospechosos con contexto completo.

Ningún filtro por sí solo alcanza. La contención estructural —privilegio mínimo más aprobación humana en lo irreversible— es lo que efectivamente limita el radio de daño.

### Controles operativos

- Límites de tasa por agent y por usuario.
- Techo de costo por corrida, con corte automático.
- Log de todos los tool calls con argumentos.
- Detección y redacción de datos sensibles en entrada y salida.
- Kill switch para detener el agent de inmediato.
- Inventario: quién es el dueño del agent, qué tools tiene, a qué datos llega, en qué entorno corre.

---
