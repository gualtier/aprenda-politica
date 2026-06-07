import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = 'https://agsfkmxgklkhhmwxtdzo.supabase.co'
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const BUCKET = 'gov-plans'
const PDF_DIR = '/tmp/gov_plans'
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

// ── Ensure bucket exists ──────────────────────────────────────────────────────
const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
  public: true,
  fileSizeLimit: 10 * 1024 * 1024, // 10MB
})
if (bucketErr && !bucketErr.message.includes('already exists')) {
  console.error('Bucket error:', bucketErr.message)
  process.exit(1)
}
console.log(`Bucket "${BUCKET}" ready.`)

// ── Upload PDFs and collect URL mapping ──────────────────────────────────────
const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'))
console.log(`Uploading ${files.length} PDFs...`)

// SQ → public URL
const sqToUrl = {}

for (const filename of files) {
  // Extract SQ_CANDIDATO from filename: 2024ES80002366610_01.pdf → 80002366610
  const m = filename.match(/\d{4}ES(\d{11,12})(?:_\d+)?\.pdf/)
  if (!m) { console.warn(`  ? Skipping ${filename}`); continue }
  const sq = m[1]

  const filePath = path.join(PDF_DIR, filename)
  const data = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, data, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) {
    console.error(`  ✗ ${filename}:`, error.message)
  } else {
    const url = `${PUBLIC_BASE}/${filename}`
    sqToUrl[sq] = url
    console.log(`  ✓ ${filename} → ${url.slice(-40)}`)
  }
}

// ── Update DB ─────────────────────────────────────────────────────────────────
console.log(`\nUpdating DB for ${Object.keys(sqToUrl).length} politicians...`)

let updated = 0
for (const [sq, url] of Object.entries(sqToUrl)) {
  const { error } = await supabase
    .from('politicians')
    .update({ government_plan_url: url })
    .eq('external_id', sq)

  if (error) {
    console.error(`  ✗ SQ ${sq}:`, error.message)
  } else {
    updated++
  }
}

console.log(`Done. DB updated for ${updated} politicians.`)
