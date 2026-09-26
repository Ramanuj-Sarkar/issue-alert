---
doc: scope
status: approved
---

# Noon Six (working title)

A tiny, hackable daily priority list: it stores your issues in plain text, and every day at noon it confronts you with the 6 it thinks matter most — and tells you why.

## The Unique Kernel
Most to-do apps store tasks and wait for you to decide. This one makes the decision for you — and then shows its work. At noon it ranks your issues by how long they have been waiting (oldest first), then by urgency, then difficulty, then deadline, and it shows each issue's age so the decision is legible. The point isn't an organized list; it's trusting a decision so you stop second-guessing yourself. The accountability layer — an issue you keep not doing keeps climbing the list, visibly a day older each time — is what makes it more than a generic list.

## Who It's For
You, personally. Someone who finds it hard to decide what to work on and tends to second-guess priorities, and who wants a daily nudge that feels like confidence rather than another pile of tasks. Other people *could* use it, but they aren't the target.

Secondary audience, for the hackathon: a reviewer who should understand, within about a minute, that the whole thing is meant to be opened up and edited.

## The Core Loop
You add issues — title, description, difficulty (L/M/H), urgency (L/M/H), an optional deadline (YYYY-MM-DD), and an optional free-text "Ranking Explanation" for your own reasoning about why it matters, how hard it is, or why it's necessary. Then at (or after) noon you open the app and today's 6 highest-ranked issues are waiting: the ones that have been sitting longest come first, then by urgency, then difficulty, then closest deadline. Each one shows *why* it ranked there, with its age right there on the row. You can reorder by hand to break ties. Your manual order and your Ranking Explanation both survive the next noon re-rank — the app recomputes the automatic ranking but keeps what you deliberately set. You finish an issue, you delete it — and a count of what you deleted in the last two days sits above the list. You come back because the list is the one thing that tells you what to do, and it remembers what you've been dodging.

## Inspiration & Identity
Minimal, not polished or colorful. A deliberately plain list you want to keep opening every day — easier to use daily than pretty for a submission. Data and settings live in a text file a human can open and edit directly, which is the whole personality of the project: you should be able to change it without asking a chatbot.

No external references or aesthetic touchstones were volunteered. Visual layout sketched in the learner's head: title (big and bold) and description (first sentence) on the left, deadline in the middle, urgency on the right.

## Why This Matters to the Learner
In their words, prioritizing has always been hard and they second-guess themselves. They picture this app and "feel more confident and ready to get stuff done." They also want to *understand* what they make — to be able to edit and grow it themselves — and to get real daily use out of something they actually built.

## What "Working" Looks Like
Open the app at/after noon: 6 issues are ranked and waiting, each with a short explanation of its position and its age. Add an issue, complete it, delete it; see the number of recently deleted items. Then the proving moment: add a Ranking Explanation and drag an issue into a new spot, let the next noon re-rank run, and confirm your manual order and explanation are still there while the automatic ranking updated around them. Edit an issue's fields in the text file and change a code-level value (the number of results, the noon time), reload, and see the list reflect the change with all saved issues intact.

The "oh, that's cool" beat: editing a plain text file changes how the app behaves, and nothing you'd already saved is lost.

## The POC Boundary
- Local app; issues stored in a human-editable text file (no cloud, no database, no accounts).
- Issues with title, description, difficulty (L/M/H), urgency (L/M/H), optional deadline, and an optional free-text Ranking Explanation.
- Top-6 daily list, ranked: days since creation (oldest first) → urgency (High first) → difficulty (High first) → deadline (closest first).
- A visible reason for each issue's rank, and its age shown on the row.
- Manual reorder as a tie-breaker; the manual order and the Ranking Explanation both persist across re-ranks.
- Complete and delete; a count of items deleted in the last two days.
- Code-level settings (easy to change in the source): number of results, alert time, difficulty/urgency levels. Issue data (including per-issue values) lives in the text file. Re-ranking reflects edits; stored data survives.
- When the app is open at noon it refreshes quietly; the update shows as the red badge (no pop-up, no background notification).

## Later
- A true scheduled notification that fires while the app is closed.
- Making it visibly nicer / more polished.
- Syncing across devices or backing up beyond the local text file.

## Explicitly Cut
- Accounts, login, and multi-user support — a personal tool; adds cost and complexity with no payoff for a proof of concept.
- Cloud storage or a database — would make the data harder to hand-edit, which is the opposite of the point.
- Mobile app — a desktop/local app demonstrates the loop fine for a hackathon.
- Notifications while closed — deliberately deferred (see Later); opening at noon keeps the build small.
- Advanced analytics, dashboards, collaboration — in the learner's words, they keep wanting to "add more and more," and the whole point of the hackathon size is to resist that.
