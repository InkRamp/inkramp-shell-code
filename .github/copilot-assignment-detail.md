The InkRamp Build — Assignment
Role: Head of Engineering at PACTAP
A finalist-stage exercise. We respect your time. Read this in full before you write a line of code.
InkRamp is a fictional company we made up for this exercise. It is not affiliated with Pactap. Any
resemblance to actual print marketplaces is incidental and intentional — we want a domain that
rhymes with ours without being ours.
Why this exists
We could ask you to invert a binary tree on a whiteboard. Instead, we are asking you to ship a small but
real AI-native B2B web application in roughly the time it would take a strong engineer to read a thick
book.
Done by hand, with no AI, this assignment is comfortably 45–60 days of work for a senior full-stack
engineer.
We expect you to deliver it in 60–72 hours of focused effort, end to end.
That asymmetry is the test. We want to see whether you can architect, scope, orchestrate, and ship by
treating AI as a force multiplier across the entire SDLC — not just a faster way to type. Anyone can
autocomplete code. Few can hold a real product, a real architecture, real evals, and real cost in their
head while AI writes the boring 80%.
If you finish at 65 hours and your judgement is visible everywhere in the result, you win. If you spend
200 hours pretending the deadline is flexible, you lose — even if the artifact is beautiful.
You keep what you build. See "Logistics" below.
Product Context
You are the founding engineer at InkRamp, a fictional B2B marketplace for commercial print
procurement — brochures, catalogues, marketing collateral, product manuals, retail signage, custom
inserts. SMB consumer brands and D2C companies need printed materials constantly; commercial
printers in their region have wildly varying capabilities, lead times, and pricing; the matching process
today happens over WhatsApp, phone calls, and emailed PDF quotes.
Pactap — Head of Engineering Take-Home Page 1
InkRamp wants to make that flow look like one conversation: a buyer says "I need a premium trifold
brochure for my brand launch next week — about 5,000 units, soft-touch finish, delivered to Bangalore"
and within minutes they have three priced, comparable quotes from suppliers actually capable of
fulfilling the job.
InkRamp is packaging-adjacent on purpose. It rhymes with our problem space without being our
problem space.
You are building v0.
What You Are Building
A web application with three roles, real auth, and substantive AI behind every important surface.
Functional Requirements
1. Multi-role authentication
• Buyer (the brand wanting things printed)
• Supplier (the print shop)
• Admin (you / the InkRamp team)
• Real session management, role-based access, password reset flow. No "demo login" button
shortcuts in production.
2. Conversational intake agent (Buyer side) A chat surface where a buyer describes their print job in
free-form natural language and the agent extracts a structured RFQ (quantity, format, paper, finish,
dimensions, delivery city, deadline, special asks). The agent must ask clarifying questions when fields are
ambiguous or missing, and must not invent fields.
3. Vision / multimodal agent (Buyer side) The buyer can upload an image — a photo of an existing
brochure, a screenshot of a Pinterest reference, a hand-drawn spec — and the agent extracts the
structured spec from it (dimensions, fold type, estimated paper weight, colour profile, finish). Output
should reconcile with whatever the buyer typed; conflicts should be surfaced, not silently overridden.
4. Semantic search over a seeded supplier catalogue Seed the system with at least 50 synthetic
supplier listings (capabilities, machinery, lead times, paper inventory, regions served, certifications,
sample portfolio). Implement vector embeddings + a query path so that "supplier in NCR who can do
soft-touch lamination on 300gsm at 5,000 quantity in under a week" returns ranked, relevant matches.
Hybrid retrieval (keyword + vector) earns points; pure-cosine-on-blobs does not.
Pactap — Head of Engineering Take-Home Page 2
5. Multi-step orchestration agent (RFQ pipeline) Given a structured RFQ, an agent must:
1. Match the RFQ to top-K supplier candidates using the search layer above
2. Generate a normalised RFQ payload to send to each supplier
3. Accept (mocked or real) supplier quote responses in different formats — free-text email-like reply,
structured JSON, scanned-PDF-like text
4. Normalise those quotes into a directly comparable buyer-facing view (unit price, total, lead time,
included finishes, exclusions)
5. Surface anomalies (one supplier missing a finish, another quoting in a different unit)
This is the agent we will look at hardest. It is the one closest to real Pactap work.
6. Document AI Auto-generate PDFs at the right moments:
• A Purchase Order PDF when a buyer accepts a quote
• An Invoice PDF stub on supplier side
• A Quote Comparison PDF the buyer can download and forward to a colleague
Generated programmatically, not screenshot-rendered. They should look like they belong to a real
product.
7. Admin analytics dashboard
• Standard metrics: RFQs created, quote turnaround time, conversion, supplier response rate, agent
cost per RFQ
• At least one AI-generated-insight widget — e.g. "this week's RFQs are skewing toward soft-touch
finishes; only 4 of 50 suppliers can do that at scale; consider supplier outreach in this category."
This must be powered by a real LLM call over real (synthetic) data, not a hardcoded string.
Non-Functional Requirements
What we expect
Area Stack Node.js + TypeScript backend, Angular frontend, AWS deploy, PostgreSQL primary store. Pick
a vector store (pgvector is fine).
Architecture Modular monolith with named domain boundaries (identity, catalog, rfq, quoting,
documents, ai-platform, analytics). No microservices. Cross-module calls through
explicit interfaces, not by reaching into another module's database tables.
Deployment Live on AWS — your call: ECS / Fargate / App Runner / EC2 / Lambda. We must be able to
click a URL and use the product.
Pactap — Head of Engineering Take-Home Page 3
Area What we expect
Observability Structured logs for every agent run: input, model, prompt version, tools called, tokens, cost,
latency, output, eval verdict if any. A dashboard or even a simple logs page is fine.
AI guardrails At minimum: prompt-injection defence on user-supplied text fed into agents, output
validation against schemas, eval logging, rate limiting on AI endpoints, redaction of obvious
PII before LLM calls.
Security
Secrets in a secret manager, not .env in repo. RBAC enforced on every endpoint. Input
hygiene
validation. CSRF / CORS sane. No raw SQL with string concatenation.
Testing Real test coverage on the critical paths — RFQ creation, quote normalisation, role-gated
endpoints. AI-generated tests are welcome if you've actually read them.
Deliverables
1. Live deployed application
• Public URL on AWS
• Three test accounts shared in the README: buyer@inkramp.test,
supplier@inkramp.test, admin@inkramp.test with credentials
• Seed data loaded: ≥50 supplier listings, ≥10 sample RFQs in various states, ≥3 example image
uploads
2. Public GitHub repository
• One-command local setup (make dev / docker compose up / equivalent)
• Clean commit history; we will read it
• A README.md that an engineer can follow without asking you anything
3. Technical documentation pack (in /docs)
What it contains
Document Product Brief One page. The problem, the user, the bet, what you cut and why.
HLD System architecture, module boundaries, data flow, third-party services,
deploy topology. Diagrams welcome (ASCII fine).
LLD Database schema, key API contracts, agent state machines, error and retry
semantics on the orchestrator.
Pactap — Head of Engineering Take-Home Page 4
Document What it contains
AI System Card per agent
Model & version, prompt strategy, tools available, retrieval strategy if any,
(one per: intake, vision,
eval method, known failure modes, p50/p95 latency, estimated cost per
search, orchestrator, insight
interaction.
widget)
Modular Monolith Rationale Why monolith, why modular, where the seams are, what would push you to
extract a service, what would not.
Security & Guardrails Threat model (briefly), prompt-injection defences, what happens when
guardrails trip, what you explicitly chose not to defend against and why.
What Breaks at 100× If traffic 100× from today, what falls over first, second, third. Be specific.
Cost Estimate at 1,000 active
Compute, storage, LLM, vector store, egress. Show your assumptions.
buyers/month
Engineering Playbook One page. What you would hand to your first three hires on Day 1: how this
team uses AI, what's expected on every PR, how decisions get made, what
week-one onboarding looks like. This is the most leadership-revealing artifact
in the whole submission — write it like you're already running the team.
4. AI Usage Log (mandatory, weighted heavily)
A markdown file (/docs/AI_USAGE.md) covering:
• Every AI tool you used and what for (Cursor, Claude Code, Copilot, ChatGPT, v0, Lovable, Bolt,
custom scripts — list everything)
• 5–10 of your best prompts, with the resulting output snippet and what you did with it
• 2–3 cases where AI misled you — bad code, hallucinated APIs, wrong architectural advice — and
how you caught it. We will trust you more, not less, for being honest here.
• An honest reflection: where AI accelerated you 10×, where it cost you time, what you would
change next time
A submission with no AI usage log, or a generic one, fails this section automatically.
5. Walkthrough video (10–15 minutes; hard cap 17 minutes)
Hosted somewhere we can watch (Loom, YouTube unlisted, S3). Cover, in order:
1. Product demo — buyer journey end-to-end (3–4 min)
2. Architecture walkthrough — modular monolith, where boundaries live (2–3 min)
3. Deep dive on one agent of your choice — prompt, tools, evals, known failure modes (3–4 min)
Pactap — Head of Engineering Take-Home Page 5
4. Live AI workflow demo — actually open Cursor / Claude Code on screen, give it a real task from
your backlog, and show a real prompt-and-response loop. Edit nothing. (2 min)
5. What you cut and why (1 min)
The live AI workflow segment is non-negotiable. We have seen too many candidates who claim AI
fluency and freeze when asked to demonstrate it. Videos exceeding 17 minutes get reviewed up to that
mark only.
Evaluation Rubric (out of 100)
Dimension Weight What earns full marks What "evidence" looks like
Technical depth &
architecture
20 Modular monolith with seams that actually
hold. Clean interfaces. Defensible data
model. Smart trade-offs in HLD/LLD with
explicit rationale.
The code matches the docs;
module imports respect
boundaries; the orchestrator
can be reasoned about.
AI engineering
25 Good model choice per task. Real evals, not
AI System Cards are real
quality
vibes. Working guardrails. Structured
artifacts; eval results visible in
outputs. Failure modes documented and
logs; the orchestrator handles
mitigated. Cost-aware design.
malformed supplier
responses.
Product
judgement
15 Scope choices visibly intentional. Product
feels like one product, not five demos. The
cuts are smart.
Empathy for the
buyer/supplier shows in the
UX; obvious sharp edges are
documented, not hidden.
Documentation
15 Docs written for a reader, not as
We can hand the docs to an
quality
compliance. AI System Cards are real.
engineer who has never seen
"What Breaks at 100×" reveals
the project and they can
architectural priors. The Engineering
navigate.
Playbook reads like it was written by
someone who has run a team.
AI-leveraged
velocity (with
evidence)
15 AI Usage Log shows specific, sophisticated
use across coding, testing, docs, and
design. Walkthrough video confirms the
workflow is real.
Specific prompts that did real
work; the live AI workflow
segment shows fluency, not
theatre.
Honesty & self-
10 You flag what is broken. You name
"This part is hacky and here is
assessment
overruns. You credit AI accurately. You
why" beats "everything
document what you cut.
works" every time.
Pactap — Head of Engineering Take-Home Page 6
Bar: ≥80 is hire territory. ≥90 means we are designing the offer the same week. <70 with strong honesty
signal still gets a real conversation.
Ground Rules
• Use any AI tool you want — Cursor, Claude Code, Copilot, GPT, Claude, Gemini, v0, Lovable, Bolt,
custom agents you wire up yourself. We expect heavy use. Hiding it is a fail; documenting it is a
win.
• Synthetic data is fine — and expected. Do not scrape real suppliers.
• Be honest about overruns. If you spent 110 hours, say so in the AI Usage Log. We will read it more
carefully and respect you more for it.
• Flagging known-broken parts is a positive signal, not a negative one. "This works for the happy
path; here is where it breaks and what I would do next" is exactly the maturity we want.
• AI-generated code is welcome with documentation of what you reviewed, edited, or accepted as-
is.
• Wholesale uncredited copying of public repos is an automatic fail. Borrowing a chunk and saying
"I borrowed this chunk from X and changed Y" is fine. The line is intent and credit.
• No clarifying-question email is required. If something is genuinely ambiguous, make the call,
document it in the Product Brief, and move on. Decisions under ambiguity are part of what we are
testing.
What We Are Really Testing
Five things, in order of weight:
1. 2. 3. Ruthless scoping. A senior engineer with AI cannot ship 45 days of work in 70 hours unless they
cut the right 80%. We want to see your cuts and the reasoning behind them.
Knowing when AI helps and when it hurts. Pasting a 5,000-line prompt into Cursor and accepting
whatever comes out is junior behaviour. Senior behaviour is knowing where AI is faster than you,
where it is slower, and where it is dangerous.
Strong architectural priors. The whole reason a senior engineer can use AI safely is that they can
spot bad output instantly. The modular-monolith write-up and the "What Breaks at 100×" doc are
where this shows.
Pactap — Head of Engineering Take-Home Page 7
4. 5. Writing clarity. AI tools amplify whoever drives them. The clearer your specs, prompts, and docs,
the better your AI output gets. We will read everything you wrote — README, prompts, AI System
Cards, commit messages.
The ability to evaluate agents, not just call APIs. Anyone can wire
openai.chat.completions.create. Few can tell you whether the output is good, why, and
how it changes when the prompt changes. We will look at your evals first.
What We Are Not Testing
• Pixel-perfect UI. A clean, plain UI with the right information beats a beautiful UI hiding a broken
pipeline.
• Exhaustive feature coverage. We would rather see 7 things done well than 20 half-built.
• Production-grade SRE. We do not need PagerDuty hooked up.
• Cost optimisation at the cent level. Sane cost awareness is enough — we want to see you know
roughly what this would cost at scale, not that you saved $4.
Submission
Time window: 07 calendar days from the day you have been emailed this assignment. Spend the 60–72
hours when you choose.
Questions: if you have any questions mail us at tech.hiring@pactap.com
Submission: Submit via Google Form link provided in the email (the one with the assignment) with the
live URL + test credentials, GitHub Repo link, walkthrough video link, and honest hours-spent. (all are
non-negotiable)
What happens next. Strong submissions go to a 90-minute proposed interview (if deemed necessary) on
the choices in your build — architecture, AI trade-offs, the cuts you made.
Feedback & ownership. Everyone who submits gets written feedback within 10 days of the decision.
You keep what you build: Pactap takes a non-exclusive license to evaluate; you may open-source it on
day 11 either way.
Pactap — Head of Engineering Take-Home Page 8
If you have read this far and feel either deeply excited or deeply unqualified — that is the response we
designed for. Anything in the middle, take a second pass. Build something we'd be proud to have
shipped
Pactap — Head of Engineering Take-Home Page 9