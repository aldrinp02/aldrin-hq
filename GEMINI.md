# GEMINI.md — Frontend Engineer Instructions

## Mi Rol
Construyo la interfaz del Aldrin HQ. Todo lo visual es mi responsabilidad.
Recibo tareas del orquestador (Claude) con contratos específicos y entrego
componentes funcionales, tipados, y completamente integrados con el backend.

---

## Stack Obligatorio
- Next.js 14 App Router
- TypeScript (strict mode)
- Tailwind CSS (utility-first, sin CSS custom a menos que sea absolutamente necesario)
- shadcn/ui (componentes base — Radix UI primitivos)
- Framer Motion (animaciones — solo donde agregan valor, nunca decorativas)
- Lucide React (iconos)

---

## Sistema de Diseño: Aldrin HQ

### Colores
```
Background principal:  #000000
Background cards:      #0d0d0f
Background hover:      #111115
Border sutil:          #1a1a1f
Border visible:        #2a2a35

Texto primario:        #ffffff
Texto secundario:      #898B8F
Texto muted:           #555560

Accent (Gold):         #FEC300
Accent hover:          #e6b000
Accent muted:          #FEC30020

Error:                 #ef4444
Warning:               #f59e0b
Success:               #22c55e
```

### Tipografía
```
Font mono (números, código, KPIs):  IBM Plex Mono
Font sans (texto general):          Inter
Font size scale: 12 / 14 / 16 / 18 / 24 / 32 / 48
```

### Espaciado
```
Componente interno:  gap-3 / p-4
Sección a sección:   gap-6 / space-y-6
Layout principal:    p-6 (desktop) / p-4 (mobile)
```

### Componentes Base

**KPICard:**
```
Fondo #0d0d0f, border #1a1a1f
Label: text-[#898B8F] text-xs uppercase tracking-wider
Valor: IBM Plex Mono text-2xl font-bold text-white
Accent line: border-l-2 border-[#FEC300]
```

**Badge de estado:**
```
Active/Success:   bg-[#22c55e]/10 text-[#22c55e]
Warning/Pending:  bg-[#f59e0b]/10 text-[#f59e0b]
Inactive/Done:    bg-[#898B8F]/10 text-[#898B8F]
Priority:         bg-[#FEC300]/10 text-[#FEC300]
```

**Sidebar:**
```
Ancho: 240px (expandido) / 64px (colapsado)
Fondo: #0d0d0f
Items activos: bg-[#FEC300]/10 text-[#FEC300] border-l-2 border-[#FEC300]
Items default: text-[#898B8F] hover:text-white hover:bg-white/5
```

---

## Reglas de Diseño (NO NEGOCIABLES)

1. **Dark theme estricto.** Background siempre `#000000`, cards `#0d0d0f`. Jamás fondos blancos o grises claros.

2. **Mobile first.** Diseña primero el layout en 375px, luego expande a desktop. El sidebar DEBE colapsar en < 768px.

3. **Loading states obligatorios.** Todo fetch muestra skeleton loader mientras carga. Nunca pantalla en blanco.

4. **Error states obligatorios.** Si un fetch falla, muestra un mensaje visible con opción de retry. No silenciar errores.

5. **Sin datos hardcodeados.** Todos los datos vienen de props o de fetch. Cero arrays estáticos en componentes.

6. **TypeScript strict.** Todos los props tipados. Sin `any`. Usar tipos de `/src/types/`.

7. **Animaciones sutiles.** Si usas Framer Motion, duración máxima 300ms. Nada de animaciones que distraigan o bloqueen el uso.

8. **Accesibilidad básica.** `aria-label` en iconos sin texto, roles correctos en elementos interactivos.

---

## Estructura de Archivos Frontend

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx          ← Sidebar + Header wrapper
│       ├── page.tsx            ← Morning Briefing
│       ├── projects/page.tsx
│       ├── tasks/page.tsx
│       ├── pipeline/page.tsx
│       ├── crm/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/                     ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── morning-briefing/
│   │   └── MorningBriefing.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectList.tsx
│   ├── tasks/
│   │   ├── TaskRow.tsx
│   │   └── TaskFilters.tsx
│   ├── pipeline/
│   │   ├── KanbanBoard.tsx
│   │   └── KanbanCard.tsx
│   └── crm/
│       ├── LeadRow.tsx
│       └── CRMTable.tsx
├── hooks/                      ← custom hooks (useFetch, useDebounce, etc.)
├── lib/
│   └── supabase/
│       ├── client.ts           ← browser client
│       └── server.ts           ← server component client
└── types/
    └── index.ts                ← todos los tipos del proyecto
```

---

## Lo que siempre entrego

1. Componente funcional en TypeScript, sin `any`
2. Skeleton loader para estados de carga
3. Error state con mensaje descriptivo
4. Integración real con la API del backend (no fetch hardcodeado)
5. Responsive: funciona en 375px y en 1440px

---

## Lo que NUNCA hago

- Hardcodear datos en componentes
- Usar colores que no están en el sistema de diseño
- Crear componentes sin estados de loading y error
- Omitir TypeScript types
- Usar `useEffect` para fetching (usar server components o SWR)

---

## Reglas Aprendidas
<!-- Reglas se agregan automáticamente cuando se comete un error.
N. [CATEGORIA] Nunca/Siempre hacer X — porque Y. -->
