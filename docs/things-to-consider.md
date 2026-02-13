# Things to Consider

## Bugs

- [ ] `.env` and `.env.example` are corrupted with markdown artifacts after line 10 — `dotenv` will try to parse invalid lines like `` ``` `` and `Create .gitignore:` as variables
- [ ] `tsconfig.json` uses `moduleResolution: "bundler"` with `module: "commonjs"` — should be `"node"` or `"node10"` for Node.js CommonJS
- [ ] No `limit` validation in `src/routes/questions.ts:42` — `parseInt` on arbitrary input can return `NaN`, negative, or huge numbers
- [ ] All profile fetch errors silently default to free tier in `src/middleware/auth.ts:47` — network failures or Supabase outages downgrade premium users instead of returning an error

## Bad Practices

- [ ] `correct_answer` is sent to the client in `src/routes/questions.ts:62` — users can read answers from the network tab before answering
- [ ] `export = router` in `src/routes/index.ts:10` — inconsistent with `export default` used in every other file
- [ ] `"main": "index.js"` in `package.json:4` — should be `"dist/main.js"` to match the actual compiled entry point
- [x] `dotenv.config()` called in both `src/main.ts:8` and `src/config/supabase.ts:4` — fragile load order, better to use a single entry point or `--require dotenv/config`
- [ ] No input validation on query params in `src/routes/questions.ts` — `level`, `theme`, `language` are passed to Supabase without validation
- [ ] No rate limiting middleware — API endpoints are open to abuse
- [ ] Unused `questionsRouter` import in `src/routes/index.ts:3` — module loads at startup even though the route is commented out
