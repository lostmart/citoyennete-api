# Architecture

REST API + Node.js + Supabase

✅ Enables freemium (granular access control)
✅ Cost-effective (starts at $0, scales gracefully)
✅ Familiar stack (Node.js + Express is standard)
✅ GDPR-compliant (European data residency via Supabase)
✅ Fast to build (use existing JSON, migrate incrementally)

Deployment Timeline:

- Week 1: Set up Supabase schema + migrate questions
- Week 2: Build Node.js API (auth + questions endpoint)
- Week 3: Deploy to Render + integrate frontend
- Week 4: Add Stripe + premium content gates
- Week 5: Add study progress tracking
- Week 6: Add theme metadata
- Week 7: Add user preferences

## Media Architecture:

Self-hosted (in-app):

- Core exam content (must work offline)
- Audio drills, quiz questions, flashcards
- Educational diagrams and infographics
- Hosted on Supabase Storage

- External (marketing/supplementary):

- YouTube channel with testimonials, process explainers
- Blog articles with embedded YouTube videos
- Long-form "culture" content that's nice-to-have but not exam-critical

## Why this works:

The app delivers reliable offline exam prep (competitive advantage)
The marketing content benefits from YouTube SEO and discovery (acquisition channel)
It's not dependent on external services for core functionality

## Audio Optimization:

Format: MP3
Bitrate: 96 kbps (speech-optimized)
File size: ~700KB per minute
Quality: Perfectly clear for learning
Savings: 93% smaller files

### Specific Implementation:

Now (MVP):

Self-host ALL audio/images on Supabase Storage (free tier)
Implement Service Worker for offline caching
No video yet (add later if user research shows need)

### Month 3-6 (Post-launch):

Upgrade to Supabase Pro ($25/month) if you hit limits
Start YouTube channel for marketing (separate from app)
Add short self-hosted video clips IF user feedback requests them

### Year 2+ (Scale):

Migrate to Cloudflare R2 if bandwidth costs become significant
Keep core exam content self-hosted
Use YouTube for supplementary/community content
