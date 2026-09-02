# Fase 2 — Context engineering

Cómo decidir qué ve el modelo en cada llamada. El principio operativo: el conjunto más chico posible de tokens de alta señal.

**Altitud del system prompt.** Hay dos formas de arruinarlo. Una es hardcodear lógica if-else exhaustiva, que resulta frágil y carísima de mantener. La otra es dar directivas vagas que asumen contexto compartido que el modelo no tiene. El punto justo es específico en el comportamiento esperado y flexible en la estrategia: heurísticas fuertes, no árboles de decisión.

**Estructura.** Secciones delimitadas con headers Markdown o tags XML (`<contexto>`, `<instrucciones>`, `## Formato de salida`). El formato exacto importa cada vez menos, la separación clara sigue importando.

**Ejemplos.** Un conjunto chico de ejemplos canónicos y diversos que retratan el comportamiento esperado, no una lista exhaustiva de edge cases. Cada edge case que agregás compite por atención con los demás.

**Estrategia de recuperación de información.** Tres opciones, y la elección depende de cuán dinámico sea el dominio:
- *Precarga*: todo el contexto relevante entra adelante. Simple, predecible, cachea bien. Sirve cuando el corpus es chico y estable.
- *Just-in-time*: el agent mantiene identificadores livianos (paths, IDs, queries, links) y carga datos en runtime con tools. Escala a corpus grandes y evita índices desactualizados, a costa de latencia y de exigir buenas heurísticas de navegación.
- *Híbrida*: lo estable adelante, exploración autónoma a discreción del agent. Es el default razonable para la mayoría de los casos productivos.

**Presupuesto de contexto.** Estimá cuántos tokens ocupan system prompt, definiciones de tools, contexto precargado y una corrida típica. Si el system prompt más las tools ya se comen una fracción grande de la ventana antes de que el agent empiece a trabajar, volvé a la fase 3 y podá tools.

**El prompt es código.** Versionado, revisado y probado contra evals antes de mergear, viviendo en el repositorio de la aplicación y no adentro de una abstracción del framework. Si el prompt lo genera el framework y no lo ves, el día que el comportamiento cambie no vas a poder localizar la causa. Para cubrir varios casos de uso, usá un prompt base con variables de política en vez de multiplicar prompts — pero poné las variables **al final** del bloque de sistema, o rompés el cache. Ver `fase-4-control-flow-estado.md`, sección 6.

**Si ya existen procedimientos escritos** (soporte, operaciones, cumplimiento), convertilos en instrucciones en vez de redactar de cero. Además de ahorrar trabajo, deja las instrucciones trazables a una política real de la organización.

---

## 1. Por qué el contexto es finito

Los LLM tienen un presupuesto de atención acotado. A medida que crece la cantidad de tokens, la capacidad de recordar con precisión lo que hay en el contexto se degrada — el fenómeno se conoce como *context rot*. Es un gradiente, no un precipicio: el modelo sigue siendo capaz con contextos largos, pero pierde precisión en recuperación de información y en razonamiento de largo alcance.

La causa es arquitectónica. En un transformer cada token atiende a todos los demás, lo que da n² relaciones para n tokens; a mayor longitud, esas relaciones se estiran. Además los modelos entrenan mayoritariamente sobre secuencias cortas, así que tienen menos experiencia con dependencias a lo ancho de contextos enormes.

Consecuencia práctica: **una ventana más grande no resuelve el problema**. Tratá el contexto como recurso escaso incluso cuando sobre espacio.

---

---

## 2. Anatomía del contexto

### System prompt

El error de un extremo es hardcodear lógica condicional exhaustiva para forzar un comportamiento exacto: queda frágil y el mantenimiento se vuelve inmanejable. El error del otro extremo es dar guía vaga que no da señales concretas o que asume contexto compartido inexistente.

La altitud correcta es la que da heurísticas fuertes: suficientemente específica para guiar el comportamiento, suficientemente flexible para que el modelo resuelva casos que no anticipaste.

Método recomendado: empezá con un prompt mínimo y el mejor modelo disponible, mirá cómo falla, y agregá instrucciones y ejemplos **contra los failure modes observados**. No al revés.

### Tools

Las tools son parte del contexto: sus definiciones se cargan en cada request. Un esquema inflado consume presupuesto de atención antes de que el agent empiece a trabajar y aumenta la ambigüedad de decisión.

### Ejemplos

Un conjunto chico, diverso y canónico que retrata el comportamiento esperado. La tentación de enumerar cada edge case como regla explícita es el antipatrón: cada regla nueva compite por atención con las anteriores y el conjunto pierde nitidez.

### Historial de mensajes

Es lo que más crece y lo que menos se cura. Ver sección 5.

---

---

## 3. Estrategias de recuperación

### Precarga

Todo el contexto relevante entra al inicio. Ventajas: predecible, baja latencia, cachea perfecto. Límites: no escala a corpus grandes, y el índice puede quedar desactualizado respecto de la fuente.

### Just-in-time

El agent mantiene referencias livianas —paths, IDs, queries guardadas, links— y carga datos en runtime mediante tools. Esto imita cómo trabaja una persona: no memorizamos el archivo entero, usamos índices y buscamos cuando hace falta.

Un beneficio secundario y subestimado: **los metadatos de las referencias son señal en sí mismos**. La ruta de un archivo, la convención de nombres, el tamaño, la fecha de modificación — todo eso le dice al agent cómo y cuándo usar ese recurso, sin costo de tokens. Un diseño de nombres y jerarquías coherente es context engineering.

Permite además *divulgación progresiva*: el agent descubre el contexto por capas, guardando en memoria de trabajo sólo lo que necesita.

Costo: la exploración en runtime es más lenta que traer datos precomputados, y requiere ingeniería cuidadosa. Sin buenas heurísticas, el agent desperdicia contexto persiguiendo caminos muertos.

### Híbrida

Lo estable y siempre necesario adelante; el resto a discreción del agent. Es el default razonable para la mayoría de los casos productivos, y funciona especialmente bien en dominios con contenido poco dinámico (legal, financiero, normativo).

---

---

## 6. El prompt como código

Los prompts merecen el mismo tratamiento que cualquier otro archivo fuente: **control de versiones, revisión y pruebas**. Muchos frameworks generan prompts automáticamente y los mantienen fuera de la vista, lo cual es cómodo hasta que el comportamiento cambia y no se puede localizar la causa.

Prácticas concretas:

- El prompt vive en el repositorio de la aplicación, no adentro de una abstracción del framework ni en una interfaz web sin historial.
- Cada cambio de prompt se compara contra el set de evals antes de mergear.
- Las versiones de prompt quedan registradas en las trazas, para poder correlacionar una regresión con el cambio que la causó.
- Lo mismo aplica a las **definiciones de tools**: versionadas, revisadas, y con conciencia de que cambiarlas invalida el cache.

### Plantillas con variables

Para manejar varios casos de uso sin multiplicar prompts, usá un prompt base con variables de política en vez de mantener veinte prompts separados. Cuando aparece un caso nuevo, actualizás variables en lugar de reescribir el flujo entero. Simplifica mantenimiento y evaluación de forma sustancial.

Advertencia de cacheo: las variables interpoladas rompen el prefijo estable. Ponelas **al final** del bloque de sistema, no al principio, o vas a perder el cache en cada corrida.

### Generar instrucciones desde documentos que ya existen

En dominios con procedimientos escritos —soporte, operaciones, cumplimiento— no escribas las instrucciones desde cero. Convertí los procedimientos operativos, artículos de base de conocimiento o documentos de política que ya usa el equipo humano.

Prompt de conversión que funciona bien:

> Sos experto en escribir instrucciones para un agent LLM. Convertí el siguiente documento en un conjunto claro de instrucciones, en lista numerada. Cada paso debe corresponder a una acción o salida específica. Eliminá toda ambigüedad. El documento es: {{documento}}

Ventaja secundaria importante: las instrucciones quedan trazables a una política real de la organización, lo cual importa mucho cuando alguien pregunta por qué el agent hizo lo que hizo.
