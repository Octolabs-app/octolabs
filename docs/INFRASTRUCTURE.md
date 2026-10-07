# Infrastructure snapshot — 7 October 2026

## GitHub organization
Octolabs-app: octolabs, octoquiz, artisanmu, anical, reservly, invocto, .github, demo-repository.

## Cloudflare
- octolabs.app: active zone, Cloudflare Pages project octolabs, GitHub main auto deployment.
- OctoQuiz: octoquiz.octolabs.app/* routes to Worker octoquiz. The quiz source uses static Next.js export and Durable Objects for room relay.
- Other Pages projects observed: anical, moris-guide, reservly, randevou, extrusion-academy, and the older octoquiz Pages project.
- Retained other deployments and DNS. Homepage decluttering is not infrastructure deletion.

## Supabase
ArtisanMU: ACTIVE_HEALTHY. Kickoff, AniCal Community, Sivik, Invoice Generator: INACTIVE. No database changes made. These states can change; refresh before operational work.

## Scope
Rebrand the parent homepage and keep only the quiz promotion. There were no separate public HTML subpages in the parent repository. The quiz's own routes and branding remain for a later audit.
