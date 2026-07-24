# Zenvas v2 — Cline Fix Order (Round 5): Git Hygiene + Finish ISSUE-03

**Dibuat:** 2026-07-24 · **Oleh:** Senior review (Claude/Cowork)
**Prasyarat:** Round 1–4 sudah dikerjakan. Ini membereskan sisa masalah **sebelum** commit apa pun lagi.
**Repo:** `C:\Zenvas-v2` (Windows) · App: `apps/web`

> ⚠️ **JANGAN commit apa pun sebelum TASK 1 selesai.** Working tree sekarang berisi ~129 file
> "diff palsu" akibat konversi line-ending (CRLF↔LF). Kalau di-commit mentah, akan lahir diff
> ~41.000 baris yang mustahil di-review dan menghancurkan history untuk agent lain (Claude Code).

---

## Konteks masalah (baca dulu)

- `git diff --stat` → **152 file, 41.675 insertions, 41.493 deletions**.
- `git diff --ignore-all-space --stat` → **hanya 23 file, ~759 baris**.
- Selisihnya (~129 file) = **murni line-ending churn**, bukan perubahan konten.
- Penyebab: repo tidak punya `.gitattributes`, `core.autocrlf` kosong, dan file diedit lewat mount Linux sehingga ternormalisasi ke LF sementara blob di HEAD masih CRLF.
- Selain itu ada kerja "Round 4" nyata (registrasi App Chat, rename `COMMUNICATION_MODULE.md` → `OMNICHANNEL_INBOX.md`, perbaikan referensi 15 doc, `sidebar.tsx`) yang **belum di-commit** dan tercampur noise di atas.

Tujuan Round 5: normalkan line-ending seluruh repo ke **LF** secara permanen, pisahkan commit normalisasi dari commit konten Round 4, lalu selesaikan ISSUE-03 yang masih setengah jadi.

---

## TASK 1 — Bereskan line-ending (WAJIB pertama, jangan diskip)

**Prompt untuk Cline:**

> Kerjakan langkah demi langkah **persis** urutan ini. Jangan pakai `git checkout -- .` atau `git restore .` tanpa `--staged` (itu akan menghapus kerja Round 4). Kerja di branch: `git checkout master && git pull` lalu `git checkout -b chore/normalize-eol`.
>
> **Langkah 1 — Setel git & buat `.gitattributes`:**
> ```
> git config core.autocrlf false
> git config core.eol lf
> ```
> Buat file `C:\Zenvas-v2\.gitattributes` berisi:
> ```gitattributes
> # Normalisasi: semua file teks LF di repo & working tree
> * text=auto eol=lf
>
> # File biner — jangan pernah diutak-atik line-ending-nya
> *.png  binary
> *.jpg  binary
> *.jpeg binary
> *.gif  binary
> *.webp binary
> *.ico  binary
> *.pdf  binary
> *.woff binary
> *.woff2 binary
> ```
> Commit sendiri: `git add .gitattributes && git commit -m "chore: add .gitattributes, normalize to LF (ISSUE-EOL)"`
>
> **Langkah 2 — Renormalisasi seluruh repo:**
> ```
> git add --renormalize .
> ```
> Ini men-stage konversi LF untuk **semua** file (termasuk 23 file Round 4 yang juga punya perubahan konten).
>
> **Langkah 3 — Keluarkan file Round 4 dari stage** supaya commit normalisasi bersih dari konten:
> ```
> # daftar file yang punya perubahan KONTEN nyata (bukan sekadar EOL):
> git diff --cached --ignore-all-space --name-only
> ```
> Untuk **setiap** file yang muncul di daftar itu, un-stage: `git restore --staged <file>`.
> (Ini menyisakan di stage hanya ~129 file yang berubah **murni** line-ending.)
>
> **Langkah 4 — Commit normalisasi (pure EOL, tanpa konten):**
> ```
> git commit -m "chore: normalize line endings to LF across repo (ISSUE-EOL)"
> ```
>
> **Langkah 5 — Verifikasi commit normalisasi benar-benar kosong secara konten:**
> ```
> git show --stat HEAD          # harus ~129 file, semuanya EOL
> git show --ignore-all-space HEAD | grep -E '^[+-]' | grep -v '^[+-]{3}' | head
> ```
> Kalau langkah 5 memunculkan baris konten nyata (bukan hanya `+++/---` header), berarti ada file konten yang ikut ter-commit — **lapor, jangan lanjut**.
>
> **Acceptance criteria TASK 1:**
> - `.gitattributes` ada & ter-commit.
> - Ada 1 commit "normalize line endings" berisi HANYA perubahan EOL (~129 file), nol perubahan konten.
> - `git diff --stat` (working tree) sekarang tinggal menampilkan file Round 4 saja (≈23 file), bukan 150+.
> - Repo masih meng-compile (lihat TASK 3).
>
> **Jangan** push dulu; lanjut TASK 2 di branch yang sama atau branch baru sesuai instruksi.

---

## TASK 2 — Commit kerja Round 4 secara bersih

**Prompt untuk Cline:**

> Setelah TASK 1, working tree tinggal berisi perubahan konten Round 4 (App Chat + docs) + file untracked. Commit-nya rapi & terpisah.
>
> 1. Pastuk daftar sisa: `git status -s` dan `git diff --ignore-all-space --stat`.
> 2. Sertakan file untracked yang memang bagian Round 4 / audit:
>    - `CHANGELOG-AUDIT-2026-07-24-round4.md`
>    - `docs/MODULES/OMNICHANNEL_INBOX.md`
>    - `docs/PLANNING/CLINE-WORKORDER-2026-07-24.md`
>    - `docs/PLANNING/CLINE-FIX-2026-07-24-round5.md` (file ini)
> 3. Pastikan rename `COMMUNICATION_MODULE.md` → `OMNICHANNEL_INBOX.md` terekam sebagai rename (git akan deteksi otomatis kalau kedua perubahan di-stage bersama).
> 4. Commit:
>    ```
>    git add -A
>    git commit -m "feat(chat+docs): register Team Chat app, omnichannel rename, doc reference fixes (Round 4)"
>    ```
> 5. Verifikasi diff commit ini **bersih & kecil**: `git show --ignore-all-space --stat HEAD` harus ≈23 file dengan perubahan yang masuk akal (apps.ts +chat, app-checks.ts +hasChatApp, sidebar.tsx nav, APP_REGISTRY.md, 15 module docs ganti referensi, dsb). Kalau tiba-tiba ratusan file lagi → berarti TASK 1 belum benar, **stop & lapor**.
>
> **Acceptance criteria TASK 2:** satu commit Round 4 yang reviewable (≈23 file, `--ignore-all-space` menampilkan hanya perubahan nyata). Tidak ada file tersisa yang belum di-commit kecuali yang memang sengaja diabaikan.

---

## TASK 3 — Selesaikan ISSUE-03 (RBAC sweep) yang masih setengah jadi

**Konteks temuan review:** Guard sudah dibuat (`requireUser`, `requireAction`, `enforceConfidentiality`, `enforceConfidentialityArray` di `lib/authorize.ts`) dan dipakai di ~9 route bisnis. TAPI:
- `enforceConfidentiality` hanya dipakai di **1** route (`api/leads`).
- Mayoritas dari 59 route masih pakai cek role ad-hoc; sweep "standardize all routes" (Phase 2/3 di `docs/PLANNING/RBAC-COVERAGE.md`) **belum** dilakukan.
- Tabel di `RBAC-COVERAGE.md` masih menulis "Routes using can() = 0 → DEAD CODE" — **basi/tidak jujur** terhadap keadaan sekarang.

**Prompt untuk Cline:**

> Branch: `git checkout -b fix/issue-03-rbac-sweep`. **Jangan longgarkan akses** — pertahankan semua tenant/brand scoping & role gate yang sudah ada. Tujuan: konsistensi + kerahasiaan finansial editor menyeluruh, bukan menambah izin.
>
> 1. **Refresh audit.** Perbarui `docs/PLANNING/RBAC-COVERAGE.md`: ganti angka "0 uses / DEAD CODE" dengan keadaan nyata sekarang (jumlah route yang sudah pakai guard vs belum). Tandai baris per-route: sudah-guard / masih-ad-hoc / tidak-perlu (mis. route yang murni user-scoped seperti `notifications`, `profile`, `chat`).
> 2. **Terapkan `enforceConfidentiality`/`enforceConfidentialityArray` ke SEMUA route yang bisa mengembalikan field finansial ke EDITOR/PRODUCER** yang tak berhak. Minimal audit & rapikan: `orders`, `orders/[id]`, `projects/[id]` (payout/amount di task), `projects/[id]/tasks`, `board`, `tasks/[id]`, `payouts`, `wallet`. Ganti hand-pick manual (mis. penyaringan field manual di `leads`) dengan helper terpusat agar seragam. Field sensitif yang TIDAK boleh bocor ke EDITOR: `amount`, `price`, `payoutAmount`, `budget`, `budgetNumeric`, `odooInvoice*`.
> 3. **Standardкан guard**: untuk route yang masih `if (session.user.role === ...) return 403` ad-hoc, ganti ke `requireAction(...)` bila ada Action yang cocok. Tambahkan Action baru ke `Action`/`rolePermissions` bila perlu (mis. `read:chat`, `manage:apps`) — jangan beri EDITOR izin finansial.
> 4. **Bukti anti-regresi.** Untuk setiap route yang diubah, konfirmasi (via test atau uji manual) bahwa: OWNER/MANAGER tetap dapat data penuh; EDITOR tidak menerima field uang; user lintas-organisasi tetap `403`/empty.
> 5. **Perluas test** (`src/lib/__tests__/`): tambahkan test yang menegaskan `enforceConfidentiality` membuang `amount/price/payoutAmount/budget` untuk EDITOR, dan meloloskannya untuk OWNER/MANAGER. Kalau memungkinkan, tambah test tingkat-route untuk minimal `orders` & `payouts`.
> 6. Update `RBAC-COVERAGE.md` bagian "Recommendations/Phase" → tandai Phase 2/3 selesai, sisakan hanya yang benar-benar out-of-scope dengan alasan tertulis.
>
> **Files in scope:** `apps/web/src/lib/authorize.ts`, semua `apps/web/src/app/api/**/route.ts` yang punya gap, `apps/web/src/lib/__tests__/*`, `docs/PLANNING/RBAC-COVERAGE.md`.
>
> **Acceptance criteria TASK 3:**
> - `grep -rl 'enforceConfidentiality' src/app/api` menampilkan **semua** route finansial, bukan cuma `leads`.
> - Tidak ada route finansial yang mengembalikan `amount/price/payoutAmount/budget` ke EDITOR tanpa melewati helper.
> - `RBAC-COVERAGE.md` mencerminkan keadaan nyata (tidak ada lagi klaim "0 uses / DEAD CODE").
> - `npm test` hijau (termasuk test confidentiality baru); `tsc --noEmit` exit 0; `npm run build` sukses.
>
> **Commit:** `refactor(security): complete RBAC guard sweep + editor confidentiality across routes (ISSUE-03)`

---

## TASK 4 — Gate verifikasi (jalankan di mesin Windows, bukan VM)

**Prompt untuk Cline:**

> Setelah TASK 1–3, jalankan di `apps/web`:
> ```
> npx prisma generate
> npx tsc --noEmit          # harus exit 0
> npm test                  # vitest harus hijau
> npm run build             # harus sukses (semua route compile)
> ```
> Kalau `npm test` gagal karena binding native (mis. rolldown), jalankan `npm install` dulu di Windows agar binary platform benar. Laporkan hasil ketiga perintah apa adanya (jangan diklaim hijau tanpa output). Kalau ada yang merah, **perbaiki atau lapor** — jangan tinggalkan setengah.

---

## Catatan koordinasi multi-agent

- Karena TASK 1 menyentuh ~129 file (normalisasi EOL), **pastikan Claude Code / agent lain tidak sedang mengedit** saat ini dikerjakan, lalu semua agent `git pull` setelahnya. Kalau tidak, akan konflik masif.
- Setelah Round 5, `.gitattributes` mencegah masalah ini berulang. Idealnya tambahkan CI (GitHub Actions) yang menjalankan `tsc` + `test` + `build` per-PR supaya gate tidak bergantung pada ingatan.

---

## Ringkasan status Round 1–4 (hasil review, untuk referensi)

| Issue | Status |
|---|---|
| 01 employmentType | ✅ benar |
| 02 rate-limit login | ✅ benar (matcher `callback/credentials`) |
| 03 RBAC | ⚠️ setengah jadi → **TASK 3** |
| 04 object storage | ✅ benar (S3/R2 presigned) |
| 05 sinkron docs | ✅ benar |
| 06 tests | ✅ ada (68 assertion) — perlu dijalankan di Windows |
| 07 zod validation | ✅ benar |
| 08 hapus Odoo hardcoded | ✅ benar |
| 09 default apps | ✅ benar |
| 10 rate-limit persisten | ✅ benar (Upstash + fallback) |
| **Git hygiene (EOL)** | 🔴 **rusak → TASK 1 & 2** |
