# Fase 7 — Cache y economía de tokens

La palanca de costo más grande de un agent, y la más fácil de romper sin darse cuenta.

Lo esencial para diseñar bien desde el principio:

- El cacheo funciona por **coincidencia literal de prefijo**, no por similitud semántica. El orden del prefijo es `tools → system → messages`.
- Todo lo estable va **adelante**; todo lo que cambia por corrida (timestamp, ID de sesión, datos del usuario, resultados de tools volátiles) va **atrás**. Un solo elemento variable arriba del prefijo anula el cache de todo lo que sigue.
- Las lecturas cacheadas cuestan una fracción del input normal, pero la escritura tiene un sobreprecio: si el prefijo nunca se reutiliza, cachear sale **más caro** que no cachear.
- Un esquema de tools grande se reenvía en cada paso del loop. En agents con muchas tools, cachear las definiciones suele ser la mayor ganancia individual.
- Cachear todo el contexto de forma ingenua puede empeorar la latencia. Las mediciones publicadas sobre cargas agénticas reales muestran reducciones de costo del orden de 45–80% y mejoras de tiempo al primer token del 13–31% **con placement estratégico**, no con caching indiscriminado.

Check de diseño: escribí el prefijo del request en orden y marcá dónde cae el borde estable/variable. Si el borde queda muy arriba, reordená antes de escribir código.

---

## 3. Mecánica del prompt caching

El cacheo reutiliza el cómputo de atención (los tensores KV) de un prefijo ya procesado. Lo que hay que entender para diseñar bien:

**Coincidencia literal de prefijo.** El sistema compara la secuencia inicial de tokens byte a byte. No hay similitud semántica: un carácter distinto arriba invalida todo lo que sigue.

**Orden del prefijo**: `tools → system → messages`. Como las tools van primero, cambiar una definición de tool invalida el cache del system prompt aunque el system prompt sea idéntico.

**Economía**: las lecturas cacheadas cuestan una fracción del input normal (aproximadamente una décima parte), pero escribir al cache tiene un sobreprecio sobre el input base. La consecuencia importante: **si el prefijo no se reutiliza, cachear sale más caro que no cachear**. Cachear contenido volátil es una forma silenciosa de quemar plata.

**TTL**: el default es del orden de minutos; existen opciones de duración extendida a mayor costo de escritura. Un agent con pausas largas entre pasos puede estar pagando escrituras sin cosechar lecturas.

**Puntos de corte**: hay un número acotado de breakpoints explícitos por request (típicamente cuatro). Reservalos para bloques grandes y estables. También existe un modo automático que ubica el corte en el último bloque cacheable y lo va corriendo a medida que crece la conversación, útil para flujos conversacionales.

**Estrategia por velocidad de cambio**: si tenés secciones que cambian a distinto ritmo, ordenalas de más estable a más volátil y poné los cortes en las fronteras.

**Rendimiento medido**: en un estudio sobre más de 500 sesiones agénticas con búsqueda web real, el cacheo redujo el costo de API entre 45% y 80% y mejoró el tiempo al primer token entre 13% y 31% según proveedor. El hallazgo relevante para el diseño: el control estratégico de bloques —poner el contenido dinámico al final del system prompt y excluir resultados de tools volátiles— rinde de forma más consistente que cachear todo el contexto de forma ingenua, que en algunos casos **empeora** la latencia.

---

---

## 4. Qué rompe el cache

Lista de verificación. Cada uno de estos invalida total o parcialmente el prefijo:

- Un timestamp, fecha actual, ID de sesión o nombre de usuario **arriba** del prefijo. Es el error más frecuente y el más caro.
- Cambiar cualquier definición de tool (invalida también el system prompt que viene después).
- Cambiar de modelo. Tratá cada modelo como un carril de cache separado.
- Activar, desactivar o cambiar el presupuesto de extended thinking.
- Agregar o quitar imágenes u otros adjuntos grandes en los mensajes.
- Reordenar o reformatear el historial de conversación entre turnos.
- Inyectar resultados de tools volátiles en una posición temprana.

Regla de diseño: escribí el request en orden y marcá con una línea dónde termina lo que es idéntico entre corridas. Todo lo variable va después de esa línea.

---

---

## 5. Costo por corrida

Calculalo explícitamente antes de construir, con esta estructura:

```
Por paso del loop:
  input  = system + tools + historial acumulado + resultado de tool
  output = razonamiento + llamada a tool o respuesta

Costo corrida = Σ pasos (input_cacheado × precio_lectura
                       + input_nuevo × precio_input
                       + output × precio_output)
```

Cifras de referencia útiles para dimensionar antes de medir:

- Un agent simple consume del orden de **4x** los tokens de una interacción de chat equivalente.
- Un sistema multi-agente consume del orden de **15x**.
- En sistemas de research multi-agente, el gasto de tokens explica aproximadamente el **80%** de la varianza de rendimiento. Bajar el gasto baja la calidad; la pregunta correcta no es "cómo gasto menos" sino "cómo gasto donde rinde".

Instrumentá costo desagregado por corrida, por usuario y por flujo desde el día uno. El failure mode más caro y más silencioso es el agent que empieza a gastar diez veces lo previsto por corrida y nadie se entera hasta la factura.
