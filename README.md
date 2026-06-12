# ------------------- IMPORTANT -------------------
# Vibe Code Btw, แค่ใช้งานเล่นๆ เฉยๆ
# -------------------------------------------------


# Fisch Masterline Rod Checklist

เว็บ checklist สำหรับติดตามความคืบหน้า **Rod Journal** และ **Bestiary** เพื่อปลดล็อก **Masterline Rod** ในเกม Fisch

ข้อมูลเบ็ด/ปลา scrape จาก [Fischipedia](https://fischipedia.org) และกรองตามเงื่อนไข Masterline Rod โดยอัตโนมัติ

## โครงสร้าง

| ส่วน | เทคโนโลยี | Deploy |
|------|-----------|--------|
| Scraper | Python | Local / GitHub Actions |
| Frontend | Angular 19 | GitHub Pages |
| Backend | FastAPI + PostgreSQL | Railway |

## เริ่มต้นใช้งาน (Local)

### 1. Scrape ข้อมูล wiki

```bash
pip install -r scraper/requirements.txt
python scraper/scrape.py
```

Output: `frontend/src/assets/data/rods.json`, `fish.json`

### 2. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
# ตั้ง DATABASE_URL ชี้ไป PostgreSQL
uvicorn main:app --reload --port 8000
```

### 3. Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

เปิด http://localhost:4200

## Deploy

### GitHub Pages (Frontend)

1. เปิด GitHub Pages ใน repo settings → Source: **GitHub Actions**
2. แก้ `frontend/src/environments/environment.prod.ts` ใส่ Railway API URL
3. Push ไป branch `main` → workflow `Deploy Frontend to GitHub Pages` จะ build และ deploy อัตโนมัติ
4. ตั้ง `baseHref` ใน `frontend/angular.json` ให้ตรงชื่อ repo (default: `/Fisch/`)

### Railway (Backend)

1. สร้าง project ใหม่บน [Railway](https://railway.app) → Deploy from GitHub
2. ตั้ง **Root Directory** = `backend`
3. Add **PostgreSQL** plugin
4. ตั้ง environment variables:
   - `DATABASE_URL` — inject อัตโนมัติจาก Postgres plugin
   - `CORS_ORIGINS` — เช่น `https://youruser.github.io`
5. Deploy — health check ที่ `/api/health`

## Share Link

เปิดเว็บครั้งแรกจะสร้าง UUID ใน URL (`?p=...`) progress ถูกบันทึกบน Railway PostgreSQL เปิดลิงก์เดิมบนเครื่องอื่นได้โดยไม่ต้อง login

## Masterline Requirements

**Rod Journal** — ต้องมีทุกเบ็ด ยกเว้น:
- Brick Rod, Crew Rod, Dave Rod
- limited-time Fishing Rods (Event Fishing Rods)

**Bestiary** — ต้องมีทุกปลา ยกเว้น:
- Secret, Apex, Divine Secret, Limited Fish
