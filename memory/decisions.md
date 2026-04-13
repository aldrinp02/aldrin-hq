# Decisiones de Arquitectura — Aldrin HQ

## 2026-04-13 — Setup inicial

### Arquitectura SaaS-Ready desde día 1
**Decisión:** Todas las tablas incluyen `user_id` y RLS.
**Razón:** El HQ es personal ahora pero la meta es escalar a SaaS.
Añadir multi-tenancy después es costoso; hacerlo bien desde el inicio es gratis.

### Schema de CRM unificado
**Decisión:** Tabla única `contacts` con campo `type` ('lead' | 'client').
**Razón:** Leads y clientes comparten la mayoría de campos. Una tabla
permite reportes unificados y simplifica las queries.
**Trade-off:** Requiere filtrar siempre por `type`. Aceptable.

### Agentes MCP
**Decisión:** 3 instancias de Codex (frontend/backend/tests) + Gemini para análisis visual.
**Razón:** Codex CLI tiene `mcp-server` nativo. `gemini-mcp` es un wrapper de la API.
`@google/gemini-mcp` no existe en npm — usamos `gemini-mcp` (comunitario).

### Localización del proyecto
**Decisión:** Proyecto en `PRODUCTO/aldrin-hq` dentro del Ecosystem.
**Razón:** El HQ es un producto dentro del ecosistema de Aldrin.
**Nota:** Agregar `node_modules` a exclusiones de OneDrive para evitar sync masivo.

---
*Agregar nuevas decisiones aquí con fecha y razón.*
