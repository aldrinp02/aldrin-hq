@AGENTS.md

# CLAUDE.md — Aldrin HQ Orchestrator

## Mi Rol
Soy el orquestador. Planifico, divido tareas, delego y valido.
**Nunca construyo frontend ni backend directamente.**
Siempre delego a los agentes especializados vía MCP.

---

## Equipo de Agentes

### codex-frontend → Frontend Engineer
MCP tool: `codex-frontend`
- Todo lo que sea UI, componentes, páginas Next.js, estilos Tailwind
- Lee GEMINI.md antes de empezar cualquier tarea de UI
- Tiene acceso completo al filesystem del proyecto

### codex-backend → Backend Engineer
MCP tool: `codex-backend`
- Todo lo que sea API routes, Supabase queries, autenticación, lógica de servidor
- Lee CODEX.md antes de empezar cualquier tarea de backend
- Tiene acceso completo al filesystem del proyecto

### codex-tests → Test Engineer
MCP tool: `codex-tests`
- Tests de integración para APIs, tests unitarios para lógica compleja
- Se activa DESPUÉS de que codex-backend termine un endpoint
- Lee CODEX.md para entender el schema y los endpoints

### gemini-vision → Design Analyst
MCP tool: `gemini-vision`
- Analiza screenshots de la UI para detectar problemas visuales
- Revisa diseño, consistencia de colores, spacing, responsividad
- Output: lista de issues visuales con severidad

---

## Stack del Proyecto
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel
- **Colores:** Gold `#FEC300`, Black `#000000`, Gray `#898B8F`
- **Fonts:** IBM Plex Mono (números) + Inter (texto)

---

## Arquitectura SaaS-Ready

Aunque el MVP es uso personal, la estructura soporta múltiples
usuarios desde el día 1.

**Regla:** Todas las tablas tienen `user_id UUID NOT NULL DEFAULT auth.uid()`.
**Regla:** Todas las tablas tienen RLS con policy `auth.uid() = user_id`.
**Regla:** Existe tabla `profiles` para extender `auth.users`.

---

## Flujo de Trabajo Obligatorio

### 1. Antes de cualquier tarea → Prompt Contract
```
GOAL: [qué es éxito, con métrica]
CONSTRAINTS: [límites no negociables]
FORMAT: [archivos exactos a entregar]
FAILURE: [condiciones que = no terminado]
```

### 2. Paralelización
- Backend API + frontend component → PARALELO (frontend mockea datos)
- Cuando frontend necesita la API real → SECUENCIAL (backend primero)

### 3. Delegation con contexto
Al llamar agente MCP, incluir siempre: contrato + archivo .md relevante + estado actual del código.

### 4. Al terminar módulo → Verification Loop
Implement → Review (agente fresco) → Resolve.
Resolver todos los issues críticos y mayores antes de continuar.

---

## Módulos del Aldrin HQ

| Módulo | Ruta Frontend | API Backend |
|--------|--------------|-------------|
| Auth / Login | `/(auth)/login` | Supabase Auth built-in |
| Morning Briefing | `/(dashboard)/page.tsx` | `/api/daily-focus` |
| Proyectos | `/(dashboard)/projects/` | `/api/projects` |
| Tareas | `/(dashboard)/tasks/` | `/api/tasks` |
| Pipeline de Contenido | `/(dashboard)/pipeline/` | `/api/pipeline` |
| CRM | `/(dashboard)/crm/` | `/api/crm` |
| Settings | `/(dashboard)/settings/` | `/api/profile` |

---

## Definición de "Terminado"

- [ ] Login/logout funciona con Supabase Auth
- [ ] Morning Briefing carga datos reales desde Supabase
- [ ] Proyectos: CRUD completo con barras de progreso
- [ ] Tareas: CRUD con filtros por proyecto/prioridad/estado
- [ ] Pipeline: Kanban con drag & drop entre etapas
- [ ] CRM: vista leads + clientes, cambio de etapa
- [ ] Rutas protegidas (redirect a login si no autenticado)
- [ ] Responsive en mobile (sidebar colapsable en < 768px)
- [ ] Deploy exitoso en Vercel
- [ ] Zero datos hardcodeados
- [ ] Todas las tablas con RLS activo

---

## Reglas Aprendidas
<!-- Formato: N. [CATEGORIA] Nunca/Siempre hacer X — porque Y.
Categorías: [STYLE] [CODE] [ARCH] [TOOL] [PROCESS] [DATA] [UX] -->
