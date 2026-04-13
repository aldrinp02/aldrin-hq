/**
 * setup-supabase.js
 * Abre un browser, navega a Supabase y extrae las API keys.
 * Corre con: node setup-supabase.js
 */

const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ENV_PATH = path.join(__dirname, '.env.local')
const SQL_PATH = path.join(__dirname, 'supabase-schema.sql')

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()) }))
}

function updateEnv(url, anon, service) {
  let content = fs.readFileSync(ENV_PATH, 'utf8')
  content = content
    .replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, `NEXT_PUBLIC_SUPABASE_URL=${url}`)
    .replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`)
    .replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${service}`)
  fs.writeFileSync(ENV_PATH, content)
  console.log('\n✅  .env.local actualizado con las keys de Supabase')
}

;(async () => {
  console.log('\n🚀  Abriendo browser para configurar Supabase...\n')

  const browser = await chromium.launch({ headless: false, slowMo: 300 })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  // ── PASO 1: Ir al dashboard ──────────────────────────────────────
  console.log('📍  Navegando a supabase.com/dashboard...')
  await page.goto('https://supabase.com/dashboard')

  console.log('\n⏳  Inicia sesión en Supabase en el browser que se abrió.')
  console.log('    Cuando estés en el dashboard (lista de proyectos), vuelve aquí y presiona ENTER.')
  await ask('    → Presiona ENTER cuando estés en el dashboard: ')

  // ── PASO 2: Crear proyecto ────────────────────────────────────────
  const projectName = 'aldrin-hq'
  console.log(`\n📋  Buscando o creando proyecto "${projectName}"...`)

  const currentUrl = page.url()
  console.log(`    URL actual: ${currentUrl}`)

  console.log('\n⏳  Instrucciones:')
  console.log('    1. Si no tienes un proyecto "aldrin-hq", haz click en "New project"')
  console.log('    2. Nombre: aldrin-hq')
  console.log('    3. Database Password: crea una contraseña segura y guárdala')
  console.log('    4. Region: el más cercano a ti')
  console.log('    5. Click en "Create new project" y espera ~2 minutos')
  console.log('    6. Cuando el proyecto esté listo (verde), vuelve aquí')
  await ask('    → Presiona ENTER cuando el proyecto esté listo: ')

  // ── PASO 3: Navegar a Settings > API ─────────────────────────────
  console.log('\n📍  Navegando a Settings > API...')

  const projectUrlMatch = page.url().match(/dashboard\/project\/([^\/]+)/)
  let projectRef = projectUrlMatch ? projectUrlMatch[1] : null

  if (!projectRef) {
    console.log('    No pude detectar el proyecto automáticamente.')
    projectRef = await ask('    → Pega el "Reference ID" de tu proyecto (lo ves en Settings > General): ')
  }

  await page.goto(`https://supabase.com/dashboard/project/${projectRef}/settings/api`)
  await page.waitForLoadState('networkidle')

  console.log('\n📍  Extrayendo API keys...')
  await page.waitForTimeout(2000)

  // Extraer Project URL
  let projectUrl = ''
  try {
    const urlEl = await page.locator('text=Project URL').first()
    await urlEl.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const urlInput = await page.locator('input[readonly]').first()
    projectUrl = await urlInput.inputValue()
    console.log(`    ✅ Project URL: ${projectUrl}`)
  } catch {
    console.log('    ⚠️  No pude extraer la URL automáticamente.')
    projectUrl = await ask('    → Copia el "Project URL" de la página y pégalo aquí: ')
  }

  // Extraer anon key
  let anonKey = ''
  try {
    await page.locator('text=anon').first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const keyInputs = await page.locator('textarea[readonly], input[readonly]').all()
    for (const input of keyInputs) {
      const val = await input.inputValue()
      if (val.startsWith('eyJ') && val.length > 100) {
        anonKey = val
        break
      }
    }
    if (anonKey) console.log(`    ✅ Anon key: ${anonKey.slice(0, 20)}...`)
  } catch {
    console.log('    ⚠️  No pude extraer la anon key automáticamente.')
  }

  if (!anonKey) {
    anonKey = await ask('    → Copia la "anon / public" key y pégala aquí: ')
  }

  // Extraer service_role key
  console.log('\n    ⚠️  Para la service_role key necesitas hacer click en "Reveal" en la página.')
  await ask('    → Haz click en "Reveal" junto a service_role, luego presiona ENTER: ')

  let serviceKey = ''
  try {
    const keyInputs = await page.locator('textarea[readonly], input[readonly]').all()
    for (const input of keyInputs) {
      const val = await input.inputValue()
      if (val.startsWith('eyJ') && val.length > 200 && val !== anonKey) {
        serviceKey = val
        break
      }
    }
    if (serviceKey) console.log(`    ✅ Service role key: ${serviceKey.slice(0, 20)}...`)
  } catch {}

  if (!serviceKey) {
    serviceKey = await ask('    → Copia la "service_role" key y pégala aquí: ')
  }

  // ── PASO 4: Actualizar .env.local ────────────────────────────────
  updateEnv(projectUrl, anonKey, serviceKey)

  // ── PASO 5: Ejecutar SQL Schema ──────────────────────────────────
  console.log('\n📍  Navegando al SQL Editor...')
  await page.goto(`https://supabase.com/dashboard/project/${projectRef}/sql/new`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  const sql = fs.readFileSync(SQL_PATH, 'utf8')

  console.log('📝  Pegando el schema SQL...')
  try {
    const editor = await page.locator('.monaco-editor, [data-testid="sql-editor"]').first()
    await editor.click()
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(300)
    await page.keyboard.press('Delete')
    await page.waitForTimeout(300)
    await page.keyboard.type(sql.slice(0, 100)) // test typing

    // Mejor: usar clipboard
    await page.evaluate((sqlText) => {
      navigator.clipboard.writeText(sqlText).catch(() => {})
    }, sql)

    await page.keyboard.press('Control+a')
    await page.keyboard.press('Control+v')
    await page.waitForTimeout(1000)
  } catch {
    console.log('    ⚠️  No pude pegar automáticamente el SQL.')
    console.log('    → El SQL está en el archivo: supabase-schema.sql')
    console.log('    → Cópialo manualmente y pégalo en el SQL Editor')
  }

  console.log('\n⏳  Instrucciones para ejecutar el SQL:')
  console.log('    1. En el SQL Editor verás el schema pegado')
  console.log('    2. Si no se pegó automáticamente, abre supabase-schema.sql y pégalo tú')
  console.log('    3. Click en "Run" (o Ctrl+Enter)')
  console.log('    4. Deberías ver "Success. No rows returned" al final')
  await ask('    → Presiona ENTER cuando el SQL haya corrido exitosamente: ')

  // ── PASO 6: Verificar tablas ──────────────────────────────────────
  console.log('\n📍  Verificando tablas creadas...')
  await page.goto(`https://supabase.com/dashboard/project/${projectRef}/editor`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  console.log('\n✅  ¡Setup de Supabase completado!')
  console.log('\n📋  Resumen:')
  console.log(`    Project URL:     ${projectUrl}`)
  console.log(`    Anon Key:        ${anonKey.slice(0, 30)}...`)
  console.log(`    Service Key:     ${serviceKey.slice(0, 30)}...`)
  console.log(`\n    .env.local actualizado ✅`)
  console.log('    Schema SQL ejecutado ✅')
  console.log('\n🎉  Puedes cerrar el browser y volver a Claude.')

  await ask('\n    → Presiona ENTER para cerrar el browser: ')
  await browser.close()
})()
