# Progress — Aldrin HQ

Última actualización: 2026-04-13

## ✅ Completado

- [x] Next.js 14 inicializado (TypeScript + Tailwind + App Router)
- [x] CLAUDE.md — Orquestador con arquitectura SaaS-ready
- [x] GEMINI.md — Sistema de diseño + reglas frontend
- [x] CODEX.md — Schema completo + reglas backend
- [x] .mcp.json — Codex (x3) + Gemini + Playwright
- [x] .env.local — Template de variables de entorno
- [x] Estructura de carpetas (memory/, contracts/, src/types/, src/lib/supabase/, src/hooks/)

## 🔄 En Progreso

- [ ] Configurar keys en .env.local (requiere acción del usuario)
- [ ] Setup en Supabase: crear proyecto + ejecutar SQL del schema

## ⏳ Pendiente

### Infraestructura
- [ ] Instalar dependencias: @supabase/supabase-js, shadcn/ui, framer-motion, zod, lucide-react
- [ ] Crear src/lib/supabase/client.ts + server.ts
- [ ] Crear src/types/index.ts con todos los tipos del proyecto
- [ ] Configurar Supabase Auth (middleware.ts)
- [ ] Configurar .gitignore (agregar .env.local, node_modules)

### Backend (Codex)
- [ ] API: /api/daily-focus (GET + POST)
- [ ] API: /api/projects (CRUD)
- [ ] API: /api/tasks (CRUD + filtros)
- [ ] API: /api/pipeline (CRUD + move)
- [ ] API: /api/crm (CRUD)
- [ ] API: /api/profile (GET + PATCH)

### Frontend (Codex con GEMINI.md)
- [ ] Layout principal: Sidebar + Header
- [ ] Auth: Login page con Supabase
- [ ] Morning Briefing (home del dashboard)
- [ ] Vista Proyectos con progress bars
- [ ] Vista Tareas con filtros
- [ ] Pipeline Kanban con drag & drop
- [ ] CRM tabla leads + clientes
- [ ] Settings / Profile

### QA
- [ ] Tests de integración para cada API endpoint
- [ ] Verification Loop sobre código completo
- [ ] Pruebas en mobile (375px)
- [ ] Deploy en Vercel

---
*Actualizar este archivo conforme avanza el build.*
