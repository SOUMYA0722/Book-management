# 📚 Book Management Dashboard

A full-stack React-based application built using **Next.js (App Router)** and styled with **Tailwind CSS**, this dashboard empowers users to manage their personal book collections. Images are uploaded to **Vercel Blob Storage**, data is stored and synced with **Supabase**, and **real-time updates** are handled through **Supabase Realtime** subscriptions.

---

## 🔧 Tech Stack and Why It Was Used

| Technology               | Purpose                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| **Next.js (App Router)** | Full-stack React framework with routing, API routes, and SSR capabilities. |
| **Tailwind CSS**         | Utility-first CSS framework for rapid, responsive UI development.          |          |
| **Supabase**             | Used as the backend for database, auth, and real-time features.            |
| **Vercel Blob**          | Secure and easy image uploads directly from the browser.                   |
| **React Hot Toast**      | For notifications like upload success/failure.                             |

---

## 🌐 Features Implemented

* ✅ Add new books with title, author, genre, and image
* ✅ View total books, genres, authors in dashboard cards
* ✅ Upload book cover images using **Vercel Blob API**
* ✅ Store book data in **Supabase Database**
* ✅ Real-time updates to book list using **Supabase Realtime**

---

## 📂 Folder Structure Overview

```
book-management-dashboard/
├── app/                  # Next.js App Router pages & API
│   └── api/upload.ts     # Backend route for image uploads
├── components/
│   ├── ui/               # v0.dev generated components
│   ├── ImageUploader.tsx # Upload image to Blob and preview it
│   └── book-dashboard.tsx# Dashboard view with stats
├── hooks/
│   └── useRealtimeBooks.ts # Custom hook to sync with Supabase changes
├── lib/
│   └── supabaseClient.ts   # Supabase client initialized with env vars
├── public/              # Static assets
├── styles/              # Global styles, Tailwind config
├── .env.local           # Environment variables for Supabase and Blob
├── tailwind.config.ts
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/SOUMYA0722/Book-management
cd book-management-dashboard
pnpm install
```

### 2. Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=book-covers
```

### 3. Run Locally

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🚧 Image Upload Logic

* Uses Vercel Blob to upload images directly via formData
* `/api/upload.ts` handles POST request
* Token from `.env.local` used for authentication
* `ImageUploader.tsx` manages file selection and preview

```ts
const blob = await put(filename, file, {
  access: "public"
});
```

---

## 🔌 Supabase Integration

* Books table is synced with Supabase using `supabaseClient.ts`
* Table schema includes: `title`, `author`, `genre`, `cover_url`
* Reads and writes are handled via client SDK

---

## 📢 Real-Time Book List Updates

Implemented using Supabase Channels:

```ts
useEffect(() => {
  const channel = supabase
    .channel('books')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' },
      payload => onUpdate(payload))
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [onUpdate]);
```

### Realtime Flow:

* On insert/update/delete, Supabase triggers a WebSocket event
* Hook receives payload and updates UI state

---

## 💼 Deployment Checklist

* [x] Image upload working (via Blob)
* [x] Supabase table connected
* [x] Realtime sync active
* [x] UI functional and responsive
* [x] All `.env` values configured

To deploy:

* Push to GitHub
* Deploy on **Vercel**
* Add `.env` in Vercel dashboard under project settings

---

## 📈 Future Enhancements

* [ ] Add Authentication (via Supabase Auth)
* [ ] Pagination or infinite scroll for books
* [ ] Edit/delete book entries
* [ ] Dark mode toggle
* [ ] Export as CSV

---

### 👤 Who is this project for?

React developers, frontend interns, or students building full-stack apps with Supabase and modern tools.

### 🚨 Why Supabase over Firebase?

* SQL-native
* Open source
* Built-in Postgres, auth, storage, realtime

### 📄 Can this be extended for school/teacher use?

Yes. Book entities can be extended into student records, teacher logs, library inventory, etc.

---

## 💼 License
© 2025 Soumya
