// SpringDoc OpenAPI group spec → TypeScript 타입 생성.
// 백엔드는 group(role)별로 분리된 spec 을 제공한다 (/v3/api-docs/{group}).
// admin group 은 현재 백엔드에 path 0 개라 생성 대상에서 제외 — 생기면 GROUPS 에 추가.
//
// 실행:   pnpm --filter @magampick/api-types gen
// base override:  MAGAMPICK_API_DOCS_BASE=http://localhost:8080 pnpm --filter @magampick/api-types gen
import openapiTS, { astToString } from 'openapi-typescript'
import { writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const BASE = process.env.MAGAMPICK_API_DOCS_BASE ?? 'https://api.dev.magampick.com'

// out: 생성 파일명(앱 경계) / group: SpringDoc group 이름 (URL 에 그대로 들어감)
const GROUPS = [
  { out: 'customer', group: '1. Public (소비자)' },
  { out: 'seller', group: '2. Seller (사장)' },
]

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '../src')

const header = (group, url) =>
  `/**\n` +
  ` * AUTO-GENERATED — 직접 수정 금지.\n` +
  ` * SpringDoc OpenAPI group: ${group}\n` +
  ` * 재생성: pnpm --filter @magampick/api-types gen\n` +
  ` */\n\n`

await mkdir(srcDir, { recursive: true })

for (const { out, group } of GROUPS) {
  const url = `${BASE}/v3/api-docs/${encodeURIComponent(group)}`
  process.stdout.write(`▶ ${out} ← ${url}\n`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${out}: HTTP ${res.status} — ${url}`)
  const schema = await res.json()

  const ast = await openapiTS(schema)
  const contents = header(group, url) + astToString(ast)

  const file = resolve(srcDir, `${out}.ts`)
  await writeFile(file, contents)
  process.stdout.write(`  ✓ ${file} (${Object.keys(schema.paths ?? {}).length} paths)\n`)
}

process.stdout.write('done\n')
