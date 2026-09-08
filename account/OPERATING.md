# Recurring editorial session

Target: 20 minutes of useful editorial work, twice daily at 9 a.m. and 6 p.m. Pacific. Normal range is 15–25 minutes. Use a clock; 25 minutes is the hard stop. Do not fill time with repeated polling if access is blocked or the work is already complete.

## Authority and account check

Shaan authorized rebranding and operating @Stochastic_rat, including posts and interaction, on September 7, 2026. That authorization persists. Before an external write, verify the currently selected handle from visible UI or a supported connection. Do not act from @TheShaan or another signed-in account. Never assume the profile being viewed is the account being used.

The user also explicitly asked to avoid an X ban. The method requested for unattended roaming conflicts with X's published automation rules, read September 7, 2026:

- X prohibits non-API website automation.
- X prohibits automated likes.
- AI reply bots require prior written, explicit approval from X; automated replies also have opt-in restrictions.
- Bulk/aggressive follow activity and unsolicited automated messaging are restricted.

Source: https://help.x.com/en/rules-and-policies/x-automation

Therefore `state.json` starts in `research_and_drafts` mode. Recurring sessions may research public pages using computer use, write drafts, record observations, and commit local work. They must not auto-like, auto-follow, post, reply, repost, or DM through the website. The one-time profile rebrand was performed in the user-directed setup session and does not enable unattended engagement.

Do not disguise automation, rotate accounts/proxies, randomize activity to evade enforcement, solve a challenge unattended, bypass a rate limit, or probe private endpoints. Stop external activity if X presents a warning, login challenge, CAPTCHA, lock, or restriction. Record the visible message and continue local work when possible.

Original entertainment posts can use an X-supported API or publisher once the user chooses and connects it. Do not buy subscriptions, create credentials, accept binding developer terms, or change security settings as a routine growth step. A publisher connection does not authorize automated likes or remove reply-bot approval requirements.

## Session sequence

1. **Minutes 0–2:** Read state, voice, queue, and latest log. Check the clock, Git status, browser availability, and confirmed account. Check whether the daily slot was already completed; do not duplicate a completed slot after a retry.
2. **Minutes 2–8:** Read a bounded sample of public posts from the reference and relevant comedy/science/culture accounts. Follow a few promising conversations for context. Capture source URLs and the broad joke mechanism, not a collection of copied jokes. Do not use trending topics as an automatic posting trigger.
3. **Minutes 8–16:** Write 6–10 fresh candidates. Revise aggressively. Keep at most two new lead candidates and a small number of alternate or reply ideas. Zero keepers is an acceptable outcome. Check distinctive fragments of the strongest candidate for obvious existing matches.
4. **Minutes 16–20:** Review existing public results only if there are published posts. Record raw visible counts, timestamp, post age, and uncertainty. Compare similar ages; never attribute follower change to a specific post without evidence. Update the queue and note the best next experiment.
5. **Before finishing:** Update state and the dated session log. Stage explicit account files only, inspect the staged diff, and commit with a descriptive `account:` prefix. Report what changed and whether anything was actually published.

Use shorter intervals between steps if a page is unavailable; produce drafts from existing observations instead. Record access blocks rather than retrying indefinitely. Report meaningful new results, completion, failures, or newly required user action. Stay quiet on unchanged or non-actionable state; do not repeatedly announce the already-known publishing-connection blocker. Do not send DMs or message the user through another application.

## Publishing plan once a supported route is connected

Start with at most one original per session and no obligation to fill both slots. Quality is a selection rule, not a daily quota. Save exact text and an attempt ID before submission. Verify the resulting post URL or external status before retrying; ambiguous writes must not be duplicated. Update `QUEUE.md` from draft to published only after a confirmed receipt.

For the first two weeks, compare short standalone jokes against occasional contextual Quote Posts. Use the user's verified instruction and supported publishing capability for any mode change. Do not start automated replies without the additional approval required by X.

## Memory and Git

- Work only in `account/` for routine sessions.
- Use `apply_patch` to edit notes.
- Preserve the user's existing app files and changes.
- Never stage `.env*`, authentication data, cookies, browser storage, or credentials.
- Routine sessions commit locally and do not push. Shaan separately approved and completed the initial full-history push to `git@github.com:Shaan106/twitter.git` on September 7, 2026; that one-time approval does not automatically change this session rule. Follow any later explicit push instruction.
- Keep at most 12 live drafts. Archive rejects with a brief reason when useful; do not accumulate hundreds of indistinguishable jokes.
- If a commit fails, retain the notes and report the exact blocker. Do not reset or clean the repository.
