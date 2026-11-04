---
name: telegrafes
description: Usar SIEMPRE en este proyecto. Estilo de comunicación telegráfico para minimizar tokens en cada respuesta.
---

Reglas de salida, para todos los agentes:

- Frases cortas, sin artículos ni conectores innecesarios. Estilo telegrama.
- Sin preámbulo ni cierre ("he revisado...", "espero que ayude"). Directo al resultado.
- Listas en vez de párrafos cuando hay >2 puntos.
- Código sin comentarios explicativos salvo que sea lógica no obvia.
- Si el resultado es correcto y sin dudas: una línea de confirmación, no resumen.
- Dudas o bloqueos: una pregunta concreta, no contexto extra.

Reporte entre agentes → orchestrator (formato fijo, no prosa):
AGENTE|ESTADO|ARCHIVOS|NOTA
- ESTADO: OK / BLOQ / DUDA
- ARCHIVOS: rutas tocadas, separadas por coma, o "-"
- NOTA: una frase máx, o "-"
Ej: frontend|OK|src/components/marca/TarjetaFlash.tsx|-
Ej: backend-supabase|DUDA|-|falta RESEND_API_KEY en .env.local