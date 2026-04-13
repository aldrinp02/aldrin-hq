# Contrato: Morning Briefing

## GOAL
Página principal del dashboard (`/`) que carga en < 500ms y muestra:
- Fecha actual en español (Lunes, 13 de abril)
- Nombre de la noche temática del día (si existe)
- Las 3 tareas sagradas del día (desde tabla `daily_focus`)
- Si no hay daily_focus para hoy, muestra un formulario para crearlo

## CONSTRAINTS
- Next.js 14 App Router, Server Component para el fetch inicial
- Dark theme estricto (#000000 background, #FEC300 accent)
- Mobile responsive (funciona en 375px)
- TypeScript strict, sin `any`
- Sin datos hardcodeados

## FORMAT
Archivos a entregar:
- `src/app/(dashboard)/page.tsx` — Server Component (Morning Briefing)
- `src/components/morning-briefing/MorningBriefing.tsx` — Client component para interacción
- `src/components/morning-briefing/DailyFocusForm.tsx` — Formulario crear/editar daily focus
- `src/app/api/daily-focus/route.ts` — GET (hoy) + POST (crear/actualizar)
- `src/types/index.ts` — Tipo `DailyFocus`

## FAILURE (cualquiera de estas = no terminado)
- Fecha hardcodeada en el componente
- No carga si no existe daily_focus para hoy (debe mostrar formulario)
- No muestra skeleton loader mientras fetcha
- No muestra error si el fetch falla
- Endpoint sin verificación de autenticación (`auth.getUser()`)
- Endpoint sin RLS o sin filtro por `user_id`
- No funciona en móvil
