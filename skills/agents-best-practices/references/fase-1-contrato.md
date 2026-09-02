# Fase 1 — El contrato de la tarea

Definí, antes de escribir una línea de prompt, qué entra, qué sale y cuándo termina. Esta fase es la que más se saltea y la que más incidentes genera.

### 1.1 Salida estructurada

El contrato de salida es parte del diseño, no del formateo final. Decidí:

- **Formato**: JSON con esquema, Markdown con secciones fijas, o un artefacto (documento, ticket, fila en una tabla). Si algo aguas abajo consume la salida programáticamente, tiene que ser un esquema estricto y validado —no "JSON esperado"—, con reintento ante fallo de validación.
- **Campos obligatorios**: la respuesta, y además el **grado de confianza**, las **fuentes o evidencia**, y los **supuestos** que tomó. Un agent productivo que no puede mostrar en qué se basó no es auditable.
- **La rama "no sé"**: definí explícitamente cómo se ve una salida cuando el agent no tiene información suficiente. Si no la definís, va a inventar. Esta es la única forma barata de contener alucinaciones en producción, y el costo de no tenerla es concreto: hay casos documentados de agents de soporte que inventaron políticas de producto inexistentes y generaron cancelaciones masivas, y de aerolíneas obligadas judicialmente a honrar una política de tarifas que su chatbot fabricó. Un agent que le habla a clientes convierte la tasa de alucinación en riesgo legal y comercial.
- **Escritura fuera de contexto**: si la salida es larga (un reporte, un dataset), que el agent la escriba en un archivo o sistema externo y devuelva sólo una referencia. No hagas pasar el entregable completo por la ventana de contexto.

### 1.2 Condición de terminación

Un loop sin condición de salida clara es un incidente esperando ocurrir. Definí las cuatro:

- **Éxito**: qué tiene que ser verdad para que el agent declare la tarea terminada.
- **Techo duro**: máximo de iteraciones, de tool calls y de tokens por corrida. Siempre. Sin excepción.
- **Escalamiento**: cuándo entrega a un humano, con qué contexto y por qué canal.
- **Fracaso parcial**: qué devuelve cuando resolvió parte del problema. "Falló" y "resolvió 3 de 5 ítems" son estados distintos y aguas abajo se tratan distinto.

### 1.3 Criterio de éxito medible

Escribí ahora la frase que vas a poder verificar después: "el agent funciona si ___ % de los casos reales terminan con ___ sin intervención humana". Si no se puede completar esa frase, todavía no hay proyecto, hay una intención. Esta frase se convierte después en la eval de la fase 9.
