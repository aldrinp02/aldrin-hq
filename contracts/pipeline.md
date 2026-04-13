# Contrato: Pipeline de Contenido

## GOAL
Vista Kanban (`/pipeline`) con columnas por etapa (idea → scripting → recording →
editing → scheduled → published). Permite mover tarjetas entre etapas via drag & drop.
CRUD completo: crear, editar, eliminar contenido.

## CONSTRAINTS
- Drag & drop: usar `@dnd-kit/core` + `@dnd-kit/sortable` (no HTML5 nativo)
- Next.js 14 App Router
- Dark theme estricto
- Mobile: columnas en scroll horizontal en < 768px
- TypeScript strict

## FORMAT
- `src/app/(dashboard)/pipeline/page.tsx`
- `src/components/pipeline/KanbanBoard.tsx` — contenedor principal con drag context
- `src/components/pipeline/KanbanColumn.tsx` — columna individual con droppable
- `src/components/pipeline/KanbanCard.tsx` — tarjeta draggable
- `src/components/pipeline/PipelineForm.tsx` — formulario crear/editar
- `src/app/api/pipeline/route.ts` — GET + POST
- `src/app/api/pipeline/[id]/route.ts` — PATCH + DELETE
- `src/app/api/pipeline/[id]/move/route.ts` — PATCH (cambiar stage)

## FAILURE
- Drag & drop no persiste en Supabase (solo mueve localmente)
- Datos hardcodeados en las columnas
- Sin optimistic updates (UI debe responder inmediatamente, sync después)
- Sin estado de loading en operaciones
- Falla en móvil (debe hacer scroll horizontal)
- Endpoint sin autenticación
