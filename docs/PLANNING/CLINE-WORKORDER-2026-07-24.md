# Zenvas v2 — Cline Work Order (Audit Remediation)

**Dibuat:** 2026-07-24 · **Auditor:** Senior review (Claude/Cowork)
**Untuk dieksekusi oleh:** Cline (VSCode) — satu issue per sesi, berurutan
**Repo:** `C:\Zenvas-v2` · **App utama:** `apps/web` (Next.js 16.2.10, React 19, Prisma 7.8, NextAuth v5)

> Dokumen ini adalah backlog + prompt siap-tempel. Kerjakan **satu ISSUE per branch**,
> dari P0 → P2. Jangan gabung beberapa issue dalam satu commit.

---

## 0. Aturan kerja WAJIB untuk Cline (baca dulu, jangan dilewati)

Kita bekerja dengan banyak agent (Cline + Claude Code extension) di repo yang sama. Untuk menghindari tabrakan:

1. **Branch per issue.** Sebelum mulai: `git checkout main && git pull` lalu `git checkout -b fix/issue-XX-<slug>`. Satu issue = satu branch = satu PR/commit.
2. **Scope terkunci.** Hanya sentuh file yang tercantum di "Files in scope" pada issue tersebut. Kalau butuh menyentuh file lain, **stop dan lapor** dulu, jangan improvisasi.
3. **Jangan rusak tenant isolation.** Setiap query Prisma yang membaca data bisnis (lead, client, order, project, task, payout, chat) **harus** di-scope ke `organizationId`/brand milik user (lihat `lib/authorize.ts`). Jika ragu, pertahankan perilaku scoping yang sudah ada.
4. **Verifikasi wajib sebelum "selesai".** Jalankan berurutan dan pastikan lolos:
   ```
   cd apps/web
   npx prisma generate
   npx tsc --noEmit          # harus exit 0
   npm run build             # harus sukses (65 routes)
   ```
   Kalau ada test (setelah ISSUE-06): `npm test` juga harus hijau.
5. **Jangan commit `.env`, `.next/`, `node_modules/`, atau file generated.**
6. **Format laporan akhir tiap issue** (tulis di deskripsi PR/commit): file yang diubah, ringkasan perubahan, hasil `tsc`/`build`, dan checklist "Acceptance Criteria" yang sudah dicentang.
7. **Commit message:** `fix(scope): <ringkas>` atau `feat/test/docs/refactor(scope): ...`. Referensikan `ISSUE-XX`.
8. Kalau menemukan bug **di luar** scope issue, **jangan perbaiki diam-diam** — catat di bagian "Temuan tambahan" laporan, biar ditambahkan ke backlog.

---

## 1. Ringkasan kritis (senior review)

Fondasi Zenvas kuat: schema Prisma matang, multi-tenant lewat Organization→Brand, RBAC 4-role, ada 2 putaran audit internal. Tapi ada jurang antara **dokumentasi/abstraksi** dan **kode yang benar-benar jalan**:

- **Abstraksi keamanan jadi dead code.** `authorize.ts` punya matriks izin `can()` dan `enforceConfidentiality()` yang rapi — tapi **nol** dipakai di 59 route. Penegakan role & kerahasiaan (editor tak boleh lihat harga) dilakukan ad-hoc, hand-picked per route → tidak konsisten, gampang bocor di route baru.
- **Proteksi login mungkin tidak aktif.** Rate limiter (`proxy.ts`) menargetkan `/api/auth/login`, padahal NextAuth v5 memproses login di `/api/auth/callback/credentials`. Jadi rate-limit IP untuk brute-force login praktis tidak jalan (yang menyelamatkan hanya account-lockout 5x).
- **Bug runtime nyata** di superadmin create-user (`employmentType` default `"FULL_TIME"` — enum cuma `FREELANCE|INHOUSE`).
- **Belum production-ready:** upload masih base64 passthrough ke DB; tidak ada satu pun automated test; tidak ada validasi input terpusat (tanpa zod); config Odoo punya fallback hardcoded.
- **Dokumentasi menyesatkan:** README/CHECKPOINT bilang Next 14 + Prisma 5 + monorepo `packages/shared` — realita Next 16 + Prisma 7 + `packages/shared` **kosong** tanpa root turborepo.

Prinsip eksekusi: **perbaiki yang bikin crash & bocor dulu (P0), baru rapikan abstraksi & production-readiness (P1), lalu hardening (P2).**

---

# BACKLOG (kerjakan berurutan)

Prioritas: **P0** (correctness/security, kerjakan lebih dulu) → **P1** (production readiness) → **P2** (hardening/hygiene).

| # | Prioritas | Judul | Est |
|---|-----------|-------|-----|
| 01 | P0 | Bug enum `employmentType` di superadmin create-user | XS |
| 02 | P0 | Rate limiter tidak menutup endpoint login NextAuth | S |
| 03 | P0 | Sentralisasi RBAC + editor confidentiality (matikan dead code) | L |
| 04 | P1 | Ganti upload base64 → object storage | M |
| 05 | P1 | Sinkronkan dokumentasi vs realita (versi + monorepo) | S |
| 06 | P1 | Tambah automated test (tenant isolation, confidentiality, auth) | L |
| 07 | P2 | Validasi input terpusat (zod) + perkuat policy password/email | M |
| 08 | P2 | Hapus fallback kredensial Odoo hardcoded (fail-closed) | XS |
| 09 | P2 | Satu sumber kebenaran default apps/packages + panggil di register | S |
| 10 | P2 | Rate-limit store persisten (Upstash/Redis) untuk skala serverless | M |

---

## ISSUE-01 · P0 · Bug enum `employmentType` (runtime crash)

**Prompt untuk Cline:**

> **Context:** Di `apps/web/src/app/api/superadmin/users/route.ts` (sekitar baris 153), route POST membuat user dengan `employmentType: employmentType || "FULL_TIME"`. Enum Prisma `EmploymentType` hanya punya `FREELANCE` dan `INHOUSE` (lihat `apps/web/prisma/schema.prisma`). Akibatnya, membuat user tanpa `employmentType` (atau nilai selain kedua itu) akan **melempar error Prisma saat runtime** dan gagal membuat user.
>
> **Task:**
> 1. Ganti default menjadi nilai enum yang valid: `EmploymentType.FREELANCE` (impor dari `@/generated/prisma`), bukan string `"FULL_TIME"`.
> 2. Validasi `employmentType` yang masuk: jika ada, harus salah satu dari `["FREELANCE","INHOUSE"]`; kalau tidak, kembalikan `400`.
> 3. Cari apakah ada string `"FULL_TIME"`/`"PART_TIME"` lain di `apps/web/src` dan bereskan bila menyalahi enum (grep dulu).
>
> **Files in scope:** `apps/web/src/app/api/superadmin/users/route.ts` (dan file lain hanya jika grep menemukan pelanggaran enum yang sama).
>
> **Acceptance criteria:**
> - Membuat user superadmin tanpa mengirim `employmentType` berhasil (default `FREELANCE`), tidak crash.
> - `employmentType` invalid → `400` dengan pesan jelas.
> - `npx tsc --noEmit` exit 0, `npm run build` sukses.
>
> **Commit:** `fix(superadmin): use valid EmploymentType enum default (ISSUE-01)`

---

## ISSUE-02 · P0 · Rate limiter tidak menutup endpoint login NextAuth

**Prompt untuk Cline:**

> **Context:** `apps/web/src/proxy.ts` adalah middleware Next 16 (konvensi `proxy.ts`, ter-compile ke `.next/server/middleware.js`). `RATE_LIMITS` dan `config.matcher` menargetkan `/api/auth/login`. Tapi login front-end memakai `signIn("credentials", …)` dari `next-auth/react` (lihat `apps/web/src/app/(auth)/login/page.tsx`), yang **POST ke `/api/auth/callback/credentials`**, bukan `/api/auth/login`. Jadi rate-limit brute-force login **tidak pernah aktif**. Endpoint `/api/auth/register` sudah benar (path cocok).
>
> **Task:**
> 1. **Verifikasi dulu** jalur asli: konfirmasi path yang di-hit saat login (NextAuth v5 credentials = `/api/auth/callback/credentials`). Jangan ubah kalau ternyata berbeda — lapor temuan.
> 2. Update `RATE_LIMITS` dan `config.matcher` di `proxy.ts` agar menutup jalur login yang benar (`/api/auth/callback/credentials`) sambil mempertahankan `/api/auth/register`. Hapus/patch entri `/api/auth/login` yang mati.
> 3. Pastikan matcher middleware valid untuk Next 16 (matcher harus literal/regex yang didukung). Uji bahwa 6+ percobaan login gagal dalam 1 menit dari IP sama menghasilkan `429`.
> 4. Tambahkan komentar `// NOTE:` yang menegaskan store ini in-memory (per-instance) — bukan pengganti account-lockout, dan akan digantikan store persisten di ISSUE-10.
>
> **Files in scope:** `apps/web/src/proxy.ts` (boleh baca `login/page.tsx` & `api/auth/[...nextauth]/route.ts` untuk verifikasi, tapi jangan ubah).
>
> **Acceptance criteria:**
> - Login gagal berulang dari 1 IP kena `429` setelah ambang (5/menit).
> - `/api/auth/register` tetap ter-rate-limit.
> - Header `X-RateLimit-*` muncul pada request yang lolos.
> - `tsc` + `build` hijau.
>
> **Commit:** `fix(security): rate-limit the real NextAuth login path (ISSUE-02)`

---

## ISSUE-03 · P0 · Sentralisasi RBAC + editor confidentiality

**Prompt untuk Cline (kerjakan metodis, bertahap):**

> **Context:** `apps/web/src/lib/authorize.ts` mendefinisikan `can(action)` (matriks izin per role) dan `enforceConfidentiality(data, role)` (allowlist field untuk EDITOR sesuai CONSTITUTION #1 "editor tak lihat harga/uang"). **Keduanya tidak dipakai di satu route pun.** Saat ini tiap route mengecek role secara ad-hoc (mis. `if (session.user.role === "EDITOR") return 403`) dan menyaring field secara manual (lihat `api/leads/route.ts` yang hand-pick field aman). Ini tidak konsisten dan rawan bocor di route baru.
>
> **Tujuan:** Jadikan `authorize.ts` sumber kebenaran yang benar-benar menegakkan izin, tanpa mengubah perilaku yang sudah benar (jangan longgarkan akses).
>
> **Task — lakukan bertahap, jangan sekaligus asal:**
> 1. **Buat helper guard terpusat** di `lib/authorize.ts` (atau `lib/guards.ts`): `requireUser()` (401 jika belum login), `requireAction(action)` (memanggil `can()`, 403 jika tidak boleh), dan `scopeToBrands(where)` (menyisipkan filter `brandId in accessibleBrands`). Kembalikan tipe yang rapi (mis. `{ user }` atau `NextResponse` error) supaya route pemakainya ringkas.
> 2. **Audit dulu, jangan langsung edit.** Buat tabel cakupan (tulis ke `docs/PLANNING/RBAC-COVERAGE.md`) untuk **semua** file di `apps/web/src/app/api/**/route.ts`: kolom = [route, method, cek auth? , cek role?, tenant-scoped?, confidentiality editor?]. Tandai gap.
> 3. **Terapkan guard** ke route yang punya gap, **satu grup endpoint per commit kecil** (mis. leads dulu, lalu orders, dst.), sambil **mempertahankan** scoping brand/org yang sudah ada. Untuk setiap route yang mengembalikan data finansial (amount, price, payout, budget) ke EDITOR, salurkan lewat `enforceConfidentiality()` atau helper penyaring setara — hilangkan hand-pick manual yang duplikatif.
> 4. **Verifikasi tidak ada regresi akses.** Untuk tiap route yang diubah, konfirmasi OWNER/MANAGER tetap dapat data penuh, EDITOR tetap terbatas (tanpa field uang), dan user dari organisasi lain tetap `403/empty`.
> 5. Jika ada `Action` baru yang perlu ditambahkan ke matriks (mis. `read:chat`, `manage:apps`), tambahkan ke tipe `Action` + `rolePermissions` dengan PRODUCER/EDITOR yang tepat. **Jangan** memberi EDITOR izin finansial.
>
> **Files in scope:** `apps/web/src/lib/authorize.ts`, `apps/web/src/lib/guards.ts` (baru, opsional), semua `apps/web/src/app/api/**/route.ts`, `docs/PLANNING/RBAC-COVERAGE.md` (baru).
>
> **Acceptance criteria:**
> - `can()` dan `enforceConfidentiality()` benar-benar dipanggil (bukan dead code lagi) — buktikan dengan grep di laporan.
> - Tabel `RBAC-COVERAGE.md` terisi penuh, tidak ada baris dengan gap yang belum dijelaskan.
> - Tidak ada pelonggaran akses: uji manual OWNER vs EDITOR vs cross-org untuk minimal leads, orders, projects, tasks, payouts, board.
> - `tsc` + `build` hijau.
>
> **Catatan:** Ini issue besar. Boleh dipecah jadi beberapa commit dalam branch yang sama (`fix/issue-03-rbac`), tapi jangan tinggalkan setengah jalan tanpa laporan status.
>
> **Commit (contoh):** `refactor(security): centralize RBAC guard + editor confidentiality (ISSUE-03)`

---

## ISSUE-04 · P1 · Ganti upload base64 → object storage

**Prompt untuk Cline:**

> **Context:** `apps/web/src/app/api/upload/route.ts` masih mengembalikan `data:<mime>;base64,...` dan nilai itu disimpan ke kolom seperti `Project.posterUrl`. Ini menggemukkan DB, lambat, dan tidak production-ready (sudah ditandai `TODO(ZEN-UPLOAD)`). CONSTITUTION Rule #10 (v1.3) mengizinkan Zenvas mengelola object storage sendiri.
>
> **Task:**
> 1. Abstraksikan storage di `lib/storage.ts` dengan interface `putObject`/`getPublicUrl` (dan/atau presigned URL). Implementasi default: **S3/R2-compatible** via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, dikonfigurasi lewat env (`S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL`).
> 2. **Pilih pola presigned-URL** (client upload langsung ke bucket) untuk file besar: route mengembalikan presigned PUT URL + final public URL; simpan hanya URL final di DB. Pertahankan validasi tipe (JPEG/PNG/GIF/WebP) dan batas ukuran (naikkan dari 5MB bila perlu, mis. 15MB, taruh di env `UPLOAD_MAX_MB`).
> 3. Update `.env.example` dengan variabel baru. Jika env storage tidak diset, route harus `501`/`500` dengan pesan jelas (**bukan** diam-diam fallback base64).
> 4. Update pemanggil upload di UI (cari komponen yang POST ke `/api/upload`) agar cocok dengan kontrak baru. Hapus komentar/pesan "base64 passthrough".
> 5. Hapus/arsipkan `TODO(ZEN-UPLOAD)` setelah selesai.
>
> **Files in scope:** `apps/web/src/app/api/upload/route.ts`, `apps/web/src/lib/storage.ts` (baru), `apps/web/.env.example`, komponen UI pemanggil upload (grep `"/api/upload"`), `apps/web/package.json` (tambah dependency AWS SDK).
>
> **Acceptance criteria:**
> - Upload menghasilkan URL objek eksternal (bukan `data:`), DB menyimpan URL pendek.
> - Env storage kosong → error eksplisit, tanpa fallback base64.
> - Validasi tipe & ukuran tetap jalan. `tsc` + `build` hijau.
>
> **Commit:** `feat(upload): object storage (S3/R2 presigned) replacing base64 (ISSUE-04)`

---

## ISSUE-05 · P1 · Sinkronkan dokumentasi vs realita

**Prompt untuk Cline:**

> **Context:** Dokumen menyesatkan:
> - README.md, `docs/PROCESS/CHECKPOINT.md`, dan header `apps/web/prisma/schema.prisma` menyebut **Next.js 14 + Prisma 5.x**. Realita `package.json`: **Next 16.2.10, React 19, Prisma 7.8, NextAuth v5**.
> - README menggambarkan **monorepo** dengan `packages/shared` + struktur turborepo. Realita: `packages/shared` **kosong**, **tidak ada** root `package.json`/`turbo.json`. Ini de-facto single-app.
>
> **Task (default: samakan dokumen ke realita — jangan mengarang fitur):**
> 1. Update versi tech stack di README.md, `docs/PROCESS/CHECKPOINT.md`, dan komentar header `schema.prisma` → Next 16 / React 19 / Prisma 7 / NextAuth v5.
> 2. Perbaiki bagian arsitektur: hilangkan klaim monorepo/turborepo & `workspace/` yang tak ada. Deskripsikan struktur nyata (`apps/web` sebagai app utama, `packages/shared` kosong/placeholder). **JANGAN** membuat turborepo baru di issue ini.
> 3. Kalau `packages/shared` memang tidak dipakai, tandai jelas sebagai placeholder di docs (keputusan "jadikan monorepo beneran" = issue terpisah, butuh keputusan owner — cukup catat sebagai open question).
> 4. Perbarui `docs/PROCESS/CHECKPOINT.md` "Last Commit"/tanggal, dan pastikan tabel status modul tidak mengklaim sesuatu yang belum ada (mis. Client Portal masih ⏳).
> 5. Buat `CHANGELOG-AUDIT-2026-07-24-cline.md` singkat mencatat perubahan doc ini (ikuti pola changelog yang sudah ada).
>
> **Files in scope:** `README.md`, `docs/PROCESS/CHECKPOINT.md`, `apps/web/prisma/schema.prisma` (hanya komentar header), file changelog baru. **Jangan sentuh kode runtime.**
>
> **Acceptance criteria:** Tidak ada lagi klaim "Next 14 / Prisma 5 / monorepo turborepo" yang salah. Grep `Next.js 14`, `Prisma 5`, `turbo` tidak menghasilkan klaim keliru.
>
> **Commit:** `docs: align stack & structure docs with reality (ISSUE-05)`

---

## ISSUE-06 · P1 · Automated test (tenant isolation, confidentiality, auth)

**Prompt untuk Cline:**

> **Context:** Tidak ada satu pun automated test (`*.test.*` / `*.spec.*`). Untuk app dengan logika izin sensitif (isolasi tenant, editor tak lihat uang, lockout login), ini risiko regresi tinggi — apalagi dikerjakan banyak agent.
>
> **Task:**
> 1. Pasang **Vitest** (`vitest`, `@vitest/coverage-v8`) + script `"test": "vitest run"` dan `"test:watch": "vitest"` di `apps/web/package.json`.
> 2. **Prioritaskan unit test murni** (tanpa DB) untuk fungsi keputusan di `lib/authorize.ts`: `can()` untuk tiap role×action, `enforceConfidentiality()` (EDITOR tidak menerima field uang; OWNER/MANAGER menerima penuh), `validateTaskDepth()`.
> 3. Test untuk `lib/superadmin.ts` (`isSuperAdmin`/`requireSuperAdmin`) dengan env mock.
> 4. **Integration test** (opsional bila waktu cukup, gunakan test DB / Prisma mock): `getAccessibleBrandIds()` hanya mengembalikan brand dalam organisasi user; user org-lain dapat array kosong.
> 5. Test auth lockout logic (5x gagal → `lockedUntil` terset) — boleh dengan Prisma di-mock.
> 6. Tulis panduan singkat `apps/web/TESTING.md`: cara menjalankan test & konvensi.
>
> **Files in scope:** `apps/web/package.json`, `apps/web/vitest.config.ts` (baru), `apps/web/src/**/__tests__/*` atau `*.test.ts` di samping sumbernya, `apps/web/TESTING.md`.
>
> **Acceptance criteria:** `npm test` hijau; minimal mencakup `can`, `enforceConfidentiality`, `validateTaskDepth`, `isSuperAdmin`. Test confidentiality membuktikan field seperti `payoutAmount`/`amount`/`price`/`budget` **tidak** lolos untuk EDITOR.
>
> **Commit:** `test: add Vitest suite for authz & confidentiality (ISSUE-06)`

---

## ISSUE-07 · P2 · Validasi input terpusat (zod) + policy password/email

**Prompt untuk Cline:**

> **Context:** Tidak ada library validasi; tiap route memvalidasi manual (sering hanya cek "field kosong"). `register` menerima password min **6** karakter tanpa validasi format email; field `emailVerified` ada di schema tapi tidak ada alur verifikasi.
>
> **Task:**
> 1. Tambah `zod`. Buat skema input untuk endpoint mutasi utama (register, leads, clients, orders, projects, tasks, team invite, superadmin user). Simpan skema di `lib/validation/` dan parse `await request.json()` lewat `schema.safeParse(...)`, kembalikan `400` dengan detail error terstruktur bila gagal.
> 2. Perkuat policy register: email harus format valid; password minimal 8 + minimal kombinasi (mis. huruf+angka). Selaraskan pesan error.
> 3. **Jangan** ubah kontrak sukses yang sudah dipakai UI (nama field response tetap). Hanya perketat validasi input.
> 4. (Opsional, catat sebagai sub-task bila besar) scaffold alur email verification token — atau minimal buat issue turunan.
>
> **Files in scope:** `apps/web/src/lib/validation/*` (baru), route mutasi terkait, `apps/web/package.json`. Hindari menyentuh scope ISSUE-03 di file yang sama secara bersamaan — koordinasikan urutan (kerjakan setelah ISSUE-03 merged).
>
> **Acceptance criteria:** Input invalid → `400` konsisten dengan detail; register menolak email/again password lemah; `tsc` + `build` + `test` hijau.
>
> **Commit:** `feat(validation): zod input schemas + stronger register policy (ISSUE-07)`

---

## ISSUE-08 · P2 · Hapus fallback kredensial Odoo hardcoded

**Prompt untuk Cline:**

> **Context:** `apps/web/src/lib/odoo.ts` punya `ODOO_CONFIG` dengan fallback hardcoded (`url: "https://bisnis.kreatifproduction.com"`, `db: "kreatifproduction"`, `username: "admin"`). Ini membocorkan detail infra ke dalam kode dan berisiko "diam-diam konek ke instance produksi" saat env tak diset. Sudah ada `getOdooConfig()` yang benar (throw kalau env kurang).
>
> **Task:**
> 1. Hapus objek `ODOO_CONFIG` dengan fallback hardcoded. Pastikan seluruh kode memakai `getOdooConfigLazy()`/`getOdooConfig()` yang **fail-closed** (throw bila env tidak lengkap).
> 2. Pastikan tidak ada domain/DB/username produksi tersisa sebagai literal di seluruh `apps/web/src` (grep `kreatifproduction`).
> 3. Konfirmasi `.env.example` sudah mendokumentasikan `ODOO_*` (sudah ada) — perjelas bahwa semuanya wajib untuk fitur Odoo.
>
> **Files in scope:** `apps/web/src/lib/odoo.ts` (dan file lain hanya jika grep menemukan literal produksi).
>
> **Acceptance criteria:** Tanpa env Odoo, fungsi Odoo melempar error jelas (bukan konek ke default). Tidak ada literal `kreatifproduction`/`admin` tersisa. `tsc` + `build` hijau.
>
> **Commit:** `fix(security): remove hardcoded Odoo config fallback (ISSUE-08)`

---

## ISSUE-09 · P2 · Satu sumber kebenaran default apps/packages

**Prompt untuk Cline:**

> **Context:** Default apps organisasi didefinisikan di dua tempat: `schema.prisma` (`apps String[] @default([])`, `packages @default(["project-os","human-capital-os"])`) dan `lib/db-defaults.ts` (`DEFAULT_APPS`, `DEFAULT_PACKAGES`). Selain itu `api/auth/register/route.ts` membuat Organization **tanpa** memanggil `ensureDefaultApps()`, sehingga org OWNER baru bisa punya `apps: []`.
>
> **Task:**
> 1. Tetapkan `lib/db-defaults.ts` sebagai satu-satunya sumber kebenaran. Selaraskan `@default(...)` di schema agar konsisten dengan `DEFAULT_APPS`/`DEFAULT_PACKAGES` (atau kosongkan default schema dan selalu set via kode) — pilih satu pendekatan, dokumentasikan di komentar.
> 2. Panggil `ensureDefaultApps(organization.id)` setelah membuat Organization di `register` (jalur "tanpa invite code / OWNER baru") dan di `onboarding/setup` bila relevan.
> 3. Jika mengubah default schema, buat migration Prisma yang benar (`prisma migrate dev --name align_org_defaults`) — jangan hanya `db push`. Commit folder migration.
>
> **Files in scope:** `apps/web/src/lib/db-defaults.ts`, `apps/web/src/app/api/auth/register/route.ts`, `apps/web/src/app/api/onboarding/setup/route.ts`, `apps/web/prisma/schema.prisma`, `apps/web/prisma/migrations/*` (baru bila perlu).
>
> **Acceptance criteria:** Registrasi OWNER baru → organisasi punya default apps/packages terisi. Tidak ada dua definisi default yang bertentangan. `tsc` + `build` hijau; migration tercommit bila schema berubah.
>
> **Commit:** `fix(org): single source of truth for default apps + seed on register (ISSUE-09)`

---

## ISSUE-10 · P2 · Rate-limit store persisten (skala serverless)

**Prompt untuk Cline:**

> **Context:** `proxy.ts` memakai `Map` in-memory. Di lingkungan serverless/multi-instance, tiap instance punya store sendiri → rate limit mudah dilewati dan `setInterval` cleanup tidak reliabel. (Selesaikan ISSUE-02 dulu.)
>
> **Task:**
> 1. Abstraksikan store rate-limit di belakang interface kecil (`incr(key, windowMs)`). Implementasi default: **Upstash Redis** (`@upstash/redis` / `@upstash/ratelimit`) via env (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
> 2. Jika env Redis tidak diset, **fallback ke in-memory** (dev) dengan `console.warn` sekali — jangan crash.
> 3. Hapus `setInterval` global bila store persisten menangani TTL.
> 4. Update `.env.example`.
>
> **Files in scope:** `apps/web/src/proxy.ts`, `apps/web/src/lib/rate-limit.ts` (baru), `apps/web/.env.example`, `apps/web/package.json`.
>
> **Acceptance criteria:** Dengan env Upstash, rate-limit konsisten lintas request; tanpa env, jalan in-memory + warning. `tsc` + `build` hijau.
>
> **Commit:** `feat(security): persistent rate-limit store via Upstash (ISSUE-10)`

---

## Temuan tambahan (backlog cadangan — belum diprioritaskan)

- `emailVerified` ada di schema tapi tidak ada alur verifikasi email (kandidat setelah ISSUE-07).
- Registrasi OWNER self-serve tanpa verifikasi → potensi spam organisasi. Pertimbangkan email verification / captcha.
- `docs/MODULES/` (23 file) & `docs/TESTING/` belum diaudit penuh — kontradiksi doc mungkin masih ada (sesuai catatan changelog Round 1 & 2).
- Belum ada CI (GitHub Actions) untuk menjalankan `tsc`/`build`/`test` per-PR — sangat disarankan begitu ISSUE-06 ada.

---

## Urutan eksekusi yang disarankan

1. **ISSUE-01, 02, 08** dulu (kecil, cepat, high-value, low-risk).
2. **ISSUE-05** (docs, tak sentuh runtime — aman dikerjakan paralel oleh agent lain).
3. **ISSUE-06** (test) — pasang jaring pengaman sebelum refactor besar.
4. **ISSUE-03** (RBAC) — besar; kerjakan setelah ada test. Jangan paralel dengan ISSUE-07 di file route yang sama.
5. **ISSUE-04, 09, 07, 10**.

> Untuk koordinasi multi-agent: satu agent = satu ISSUE branch pada satu waktu. Jangan ada dua agent mengedit `apps/web/src/app/api/**` bersamaan (ISSUE-03 & ISSUE-07 saling bertabrakan — serialkan).
