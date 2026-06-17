# WELLZY — מדריך הגדרה למחשב חדש (MacBook)

## מה כבר שמור ב-OneDrive ✅

כל הקבצים הבאים כבר מסונכרנים אוטומטית דרך OneDrive:

- כל קוד המקור (`app/`, `components/`, `data/`, `lib/`, `prisma/`)
- קובץ `.env` עם `DATABASE_URL` ו-`JWT_SECRET`
- מסד הנתונים (`prisma/dev.db`)
- `package.json` עם כל ה-dependencies
- `prisma/schema.prisma`

---

## שלבי הגדרה ב-MacBook

### 1. התקן Node.js

```bash
# דרך Homebrew (מומלץ)
brew install node

# או דרך nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### 2. פתח את הפרויקט

```bash
cd ~/OneDrive/Desktop/FINDUS
```

### 3. מחק node_modules והתקן מחדש

`node_modules` מ-Windows לא עובד על Mac — חייבים להתקין מחדש:

```bash
rm -rf node_modules
npm install
```

### 4. צור מחדש את Prisma Client (לMac)

```bash
npx prisma generate
```

### 5. הרץ את האתר

```bash
npm run dev
```

האתר יעלה על: **http://localhost:3001**

---

## פרטי הפרויקט

| פרמטר | ערך |
|--------|------|
| Port | 3001 |
| DB | SQLite (`prisma/dev.db`) |
| Auth | JWT ב-httpOnly cookie `wellzy_token` |
| Framework | Next.js 16 + TypeScript |

---

## אם יש בעיה עם ה-DB

אם מסד הנתונים לא מזוהה:

```bash
npx prisma db push
```

---

*עודכן: יוני 2026*
