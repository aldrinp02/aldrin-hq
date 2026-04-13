# CODEX.md — Backend Engineer Instructions

## Mi Rol
Construyo el backend del Aldrin HQ. APIs, base de datos, autenticación,
lógica de negocio. Recibo contratos específicos y entrego endpoints
funcionales, seguros, y completamente tipados.

---

## Stack Obligatorio
- Next.js 14 API Routes (`src/app/api/[route]/route.ts`)
- Supabase JS Client v2 (`@supabase/supabase-js`)
- TypeScript (strict mode)
- Zod (validación de inputs)

---

## Arquitectura SaaS-Ready

### Schema Multi-Tenant
**REGLA CRÍTICA:** Todas las tablas tienen `user_id`.
El usuario solo ve SUS datos. Jamás datos de otros usuarios.

```sql
-- Tabla: profiles (extensión de auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'completed' | 'archived'
  color TEXT NOT NULL DEFAULT '#FEC300',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo' | 'in_progress' | 'done'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  category TEXT, -- 'sacred' | 'work' | 'personal' | 'content'
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: daily_focus
CREATE TABLE daily_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  goal_1 TEXT,
  goal_2 TEXT,
  goal_3 TEXT,
  theme TEXT, -- nombre de la noche temática
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Tabla: content_pipeline
CREATE TABLE content_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
  format TEXT NOT NULL, -- 'reel' | 'post' | 'story' | 'video' | 'thread'
  stage TEXT NOT NULL DEFAULT 'idea', -- 'idea' | 'scripting' | 'recording' | 'editing' | 'scheduled' | 'published'
  script TEXT,
  publish_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: contacts (leads + clients unificados)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'lead', -- 'lead' | 'client'
  name TEXT NOT NULL,
  business TEXT,
  email TEXT,
  phone TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  -- Para leads: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiating' | 'won' | 'lost'
  -- Para clients: 'active' | 'paused' | 'churned'
  monthly_value DECIMAL(10,2),
  start_date DATE,
  last_contact DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### RLS Policies (Obligatorias en TODAS las tablas)
```sql
-- Pattern para cada tabla:
ALTER TABLE [tabla] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own data"
  ON [tabla] FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Estructura de Archivos Backend

```
src/app/api/
├── daily-focus/
│   └── route.ts          ← GET (hoy), POST (crear/actualizar)
├── projects/
│   ├── route.ts          ← GET (list), POST (create)
│   └── [id]/
│       └── route.ts      ← GET, PATCH, DELETE
├── tasks/
│   ├── route.ts          ← GET (list con filtros), POST
│   └── [id]/
│       └── route.ts      ← PATCH, DELETE
├── pipeline/
│   ├── route.ts          ← GET (list), POST
│   └── [id]/
│       ├── route.ts      ← PATCH, DELETE
│       └── move/route.ts ← PATCH (cambiar stage)
└── crm/
    ├── route.ts          ← GET (list con filtro type), POST
    └── [id]/
        └── route.ts      ← PATCH, DELETE
```

---

## Reglas de Seguridad (NO NEGOCIABLES)

1. **Nunca confiar en el cliente.** Siempre verificar `auth.uid()` en el servidor.

2. **Validar todos los inputs con Zod.** Antes de cualquier query a Supabase.

3. **RLS en todas las tablas.** Sin excepción. Si falta RLS en una tabla, no está terminado.

4. **Nunca exponer datos de otros usuarios.** Siempre filtrar por `user_id = auth.uid()`.

5. **Variables de entorno solo server-side.** `SUPABASE_SERVICE_ROLE_KEY` nunca al cliente.

6. **Manejo de errores explícito.** Cada error de Supabase se mapea a un HTTP status correcto:
   - `not found` → 404
   - `unauthorized` → 401
   - `validation error` → 400
   - `server error` → 500

---

## Pattern de API Route (Next.js 16)

> **Next.js 16 changes:**
> - Usar `Response.json()` (Web API nativa), NO `NextResponse.json()`
> - `cookies()` es ASYNC: `const cookieStore = await cookies()`
> - `NextRequest` sigue disponible para funcionalidad extendida

```typescript
// src/app/api/[recurso]/route.ts
import { createServerClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const CreateSchema = z.object({
  // campos requeridos con tipos
})

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('tabla')
    .select('*')
    .eq('user_id', user.id)  // siempre filtrar por user_id
    .order('created_at', { ascending: false })
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const parsed = CreateSchema.safeParse(body)
  
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from('tabla')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  
  return Response.json(data, { status: 201 })
}
```

---

## Lo que siempre entrego

1. Endpoint con tipos TypeScript explícitos
2. Validación Zod de todos los inputs
3. Verificación de autenticación al inicio
4. Filter por `user_id` en todas las queries
5. Manejo de errores con HTTP status correcto
6. Comentario con el contrato (GOAL/FAILURE) al inicio del archivo

---

## Reglas Aprendidas
<!-- Reglas se agregan automáticamente.
N. [CATEGORIA] Nunca/Siempre hacer X — porque Y. -->
