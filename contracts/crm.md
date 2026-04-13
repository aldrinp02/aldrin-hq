# Contrato: CRM

## GOAL
Vista CRM (`/crm`) con tabla unificada de leads y clientes.
- Toggle entre vistas: "Leads" y "Clientes"
- Por cada contacto: nombre, negocio, etapa, valor mensual, último contacto
- Cambiar etapa directamente desde la tabla (click en badge)
- CRUD completo con formulario modal

## CONSTRAINTS
- Tabla única `contacts` con campo `type` ('lead' | 'client')
- Next.js 14 App Router
- Dark theme estricto
- Mobile: tabla con scroll horizontal en < 768px
- TypeScript strict

## FORMAT
- `src/app/(dashboard)/crm/page.tsx`
- `src/components/crm/CRMTable.tsx` — tabla con toggle leads/clientes
- `src/components/crm/ContactRow.tsx` — fila individual con badge de etapa
- `src/components/crm/ContactForm.tsx` — modal crear/editar contacto
- `src/components/crm/StageSelector.tsx` — selector de etapa inline
- `src/app/api/crm/route.ts` — GET (con filtro ?type=lead|client) + POST
- `src/app/api/crm/[id]/route.ts` — PATCH + DELETE

## FAILURE
- Tabs hardcodeados (deben filtrar datos reales)
- Sin paginación o virtualización cuando hay > 50 contactos
- Cambio de etapa no persiste en DB
- Sin confirmación al eliminar contacto
- Endpoint mezcla datos de diferentes usuarios
