# Project Structure

```
citoyennete-api/
├── src/
│   ├── config/
│   │   └── supabase.ts       # Supabase client
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware
│   │   └── errorHandler.ts   # Error handling
│   ├── routes/
│   │   ├── index.ts           # Route aggregator
│   │   ├── questions.ts       # Questions endpoints
│   │   └── health.ts          # Health check
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── main.ts                # Entry point
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```
