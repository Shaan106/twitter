# Recurring account session

Target: 20 minutes of useful editorial work, twice daily at 9 a.m. and 6 p.m. Pacific. Normal range is 15–25 minutes. Use a clock; 25 minutes is the hard stop. Do not fill time with repeated polling if access is blocked or the work is already complete.

## Authority and account check

Shaan authorized rebranding and operating @Stochastic_rat, including posts and interaction, on September 7, 2026. The subsequent standing directive explicitly permits editorial decisions, publishing and scheduling posts, selecting accounts to follow, commenting/replying, and broader account growth without item-by-item approval. Sessions are not limited to writing posts. Scheduling publication outside the two working sessions is authorized. The account remains Shaan's; operate the fictional rat character on his behalf.

Before an external write, verify the currently selected handle from visible UI or a supported connection. Do not act from @TheShaan or another signed-in account. Never assume the profile being viewed is the account being used. User authorization and technical/platform eligibility are separate: permission is granted, but an unavailable or restricted action stays disabled.

The user also explicitly asked to avoid an X ban. The method requested for unattended roaming conflicts with X's published automation rules, read September 7, 2026:

- X prohibits non-API website automation.
- X prohibits automated likes.
- AI reply bots require prior written, explicit approval from X; automated replies also have opt-in restrictions.
- Bulk/aggressive follow activity and unsolicited automated messaging are restricted.

Source: https://help.x.com/en/rules-and-policies/x-automation

Therefore `state.json` remains in `research_and_drafts` mode until a supported connection is configured and verified. This is an execution constraint, not a requirement for Shaan to approve individual content. Sessions may research public pages using computer use, identify relevant accounts and conversations, develop original content, review results, and commit and push scoped project work. They must not auto-like, auto-follow, post, reply, repost, or DM through the X website. The one-time profile rebrand was performed in the user-directed setup session and does not enable unattended engagement.

Do not disguise automation, rotate accounts/proxies, randomize activity to evade enforcement, solve a challenge unattended, bypass a rate limit, or probe private endpoints. Stop external activity if X presents a warning, login challenge, CAPTCHA, lock, or restriction. Record the visible message and continue local work when possible.

Original entertainment posts, scheduled posts, and contextual Quote Posts or reposts may use a verified X-supported API or publisher without further editorial approval. Selective follows require a supported capability and compliance with X's follow rules; never use follow/unfollow churn or purchased/fake engagement. AI replies additionally require X's prior written approval and recipient opt-in, with opt-out handling. Enable only the capabilities actually verified and record their prerequisites in state. Do not buy subscriptions, create credentials, accept binding developer terms, change security settings, or start unsolicited DM outreach as a routine growth step. A publisher connection does not authorize automated likes or remove reply-bot approval requirements.

## Session sequence

1. **Minutes 0–2:** Read state, identity, voice, queue, and latest log. Check the clock, Git status, available capabilities, and confirmed account. Check whether the daily slot was already completed; do not duplicate a completed slot after a retry.
2. **Minutes 2–8:** Read a bounded sample of public posts from the reference and relevant comedy/science/culture accounts. Follow a few promising conversations for context. Capture source URLs and the broad joke mechanism, not a collection of copied jokes. Do not use trending topics as an automatic posting trigger.
3. **Minutes 8–16:** Choose the most useful eligible work: original posts, scheduling, contextual quotations, selective follows, permitted replies, audience research, or improving weak content. No action or writing quota. When drafting, explore up to 6–10 candidates and keep at most two strong new leads. Check distinctive fragments for obvious existing matches. While a capability is unavailable, save relevant candidates and parent URLs rather than pretending to execute it.
4. **Minutes 16–20:** Review existing public results only if there are published posts. Record raw visible counts, timestamp, post age, and uncertainty. Compare similar ages; never attribute follower change to a specific post without evidence. Update the queue and note the best next experiment.
5. **Before finishing:** Update state and the dated session log. Stage explicit account files only, inspect the staged diff, commit with a descriptive `account:` prefix, and push to the verified project remote under the standing authorization below. Report meaningful results and distinguish drafts, scheduled posts, and confirmed public actions.

Use shorter intervals between steps if a page is unavailable; produce drafts from existing observations instead. Record access blocks rather than retrying indefinitely. Report meaningful new results, completion, failures, or newly required user action. Stay quiet on unchanged or non-actionable state; do not repeatedly announce the already-known publishing-connection blocker. Do not send DMs or message the user through another application.

## Publishing plan once a supported route is connected

Start with at most one original per session and no obligation to fill both slots. Quality is a selection rule, not a daily quota. Publication time may be outside the working sessions. Save exact text, intended time/timezone, and an attempt ID before submission. Verify the resulting post URL or external scheduling status before retrying; ambiguous writes must not be duplicated. A scheduler receipt means scheduled, not published. Update `QUEUE.md` to published only after confirmed publication. Verify other external actions before counting them as completed.

For the first two weeks, compare short standalone jokes against occasional contextual Quote Posts. The standing user instruction already authorizes these editorial choices; activate a capability only after its supported connection and action-specific prerequisites are verified. Do not start automated replies without the additional approval required by X.

## Memory and Git

- Work only in `account/` for routine sessions.
- Use `apply_patch` to edit notes.
- Preserve the user's existing app files and changes.
- Never stage `.env*`, authentication data, cookies, browser storage, or credentials.
- Shaan's latest September 7, 2026 directive grants standing permission to commit and push scoped project work to `git@github.com:Shaan106/twitter.git`. This supersedes the former local-commit-only rule; do not ask for approval for each ordinary push.
- Verify the remote and branch, inspect the staged diff for unrelated changes and secrets, and use a normal non-force push. If the remote changed, histories diverged, authentication fails, or sensitive material appears, stop the affected Git operation and report the blocker. Do not force-push, reset, rewrite history, or overwrite user work.
- Keep at most 12 live drafts. Archive rejects with a brief reason when useful; do not accumulate hundreds of indistinguishable jokes.
- If a commit fails, retain the notes and report the exact blocker. Do not reset or clean the repository.
