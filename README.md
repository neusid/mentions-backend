# Mentions Backend

Backend service untuk menerima, mencari, dan menghitung data mention.

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Vitest

## Setup

Install dependencies:

```bash
npm install
```

Delete `.example` dari file `.env.example`:

Jalankan migration PostgreSQL:

```bash
psql "$DATABASE_URL" -f src/db/migrations/001_create_mentions_table.sql
```

Jalankan server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

## Project Structure

```text
src/
├── app.ts
├── types/
│   └── mention.ts
├── services/
│   ├── normalize.ts
│   └── dedupe.ts
├── db/
│   ├── client.ts
│   └── migrations/
│       └── 001_create_mentions_table.sql
└── routes/
    ├── ingest.ts
    ├── mentions.ts
    └── stats.ts

tests/
├── normalize.test.ts
└── dedupe.test.ts
```

## API

### POST /internal/mentions/bulk

Menerima array mention, melakukan normalization, membuat `dedupeKey`, lalu menyimpan data ke PostgreSQL.

Endpoint ini idempotent. Jika mention yang sama dikirim lagi, data tersebut dilewati dan tidak dibuat sebagai row baru.

### GET /mentions

Untuk mencari mention.

Parameter:

- `q` - keyword pada title dan content
- `source` - filter source
- `from` - tanggal mulai
- `to` - tanggal akhir
- `page` - nomor halaman
- `limit` - jumlah data per halaman

Sort menggunakan:

```text
published_at DESC, id DESC
```

`id` digunakan sebagai tie-breaker agar hasil pagination tetap stabil.

### GET /mentions/stats

Group berdasarkan source:

```text
GET /mentions/stats?group_by=source
```

Group berdasarkan hari:

```text
GET /mentions/stats?group_by=day
```

## Normalization

Data yang masuk bisa memiliki format yang berbeda.

Normalization yang dilakukan:

- HTML tag dihapus dari title dan content
- `script` dan `style` dihapus
- HTML entity umum seperti `&nbsp;`, `&quot;`, dan `&amp;` dinormalisasi
- source dibuat lowercase dan whitespace dihapus
- tanggal diubah menjadi `Date`
- mendukung ISO date, Unix timestamp, dan `DD/MM/YYYY`
- engagement string seperti `"1,204"` diubah menjadi `1204`
- nilai engagement yang tidak valid menjadi `0`

## Duplicate Detection

Duplicate menggunakan `dedupeKey`.

Key dibuat dari:

```text
source + title/content + tanggal
```

Kemudian data tersebut dibuat menjadi SHA-256 hash.

`external_id` tidak digunakan sebagai satu-satunya duplicate identifier karena ID dari source yang berbeda bisa berbeda untuk mention yang sama.

Database memiliki `UNIQUE` constraint pada `dedupe_key`, dan insert menggunakan:

```sql
ON CONFLICT (dedupe_key) DO NOTHING
```

Dengan cara ini, mengirim data yang sama dua kali tidak membuat duplicate row.

## Database

Database menggunakan PostgreSQL.

Table utama:

```text
mentions
```

Migration:

```text
src/db/migrations/001_create_mentions_table.sql
```

Kolom utama:

- `id`
- `external_id`
- `source`
- `title`
- `content`
- `url`
- `author`
- `published_at`
- `engagement`
- `dedupe_key`
- `created_at`

## Tests

Test menggunakan Vitest:

```bash
npm test
```

Test mencakup:

- HTML cleaning
- script removal
- HTML entity
- source normalization
- ISO date
- Unix timestamp
- `DD/MM/YYYY`
- invalid date
- engagement normalization
- duplicate detection
- title fallback ke content
- duplicate dengan tanggal berbeda tetapi masih pada hari yang sama

## Design Decisions

Saya memilih PostgreSQL karena endpoint membutuhkan filtering, pagination, dan aggregation.

Saya menggunakan database `UNIQUE` constraint pada `dedupe_key` agar idempotency juga dijaga oleh database.

Saya menggunakan struktur sederhana karena project ini masih kecil dan fokus assessment adalah ingestion, search, dan stats.

## Assumptions

- `published_at` bisa kosong.
- Engagement bisa berupa number atau string.
- Source bisa memiliki perbedaan kapitalisasi dan whitespace.
- Title bisa kosong.
- Jika title tidak ada, content digunakan untuk duplicate detection.

## Trade-offs

Duplicate detection saat ini menggunakan exact deterministic hash.

Kelebihannya sederhana dan mudah dipahami.

Kekurangannya, perubahan besar pada title atau content dapat membuat data dianggap berbeda walaupun sebenarnya mention yang sama.

## Time Spent

Dikerjakan sekitar **6 jam** dalam **2 sesi**.

## With Another Week

Dengan waktu tambahan, saya akan:

- meningkatkan duplicate detection
- menambah integration test dengan PostgreSQL
- menambahkan logging dan monitoring
- melakukan performance testing dengan dataset yang lebih besar