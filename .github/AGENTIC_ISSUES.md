# Making an agent pick up an issue and deploy

Two ways to get from "I created an issue" to "an agent did the work and it deployed."

## 1. Cursor agent (you trigger once)

**Flow:** Create issue → In Cursor, say "Implement issue #N" or "Pick up my latest issue" → Agent implements, runs checks, opens a PR → You merge the PR → Vercel deploys from `main`.

**Setup:**

- Install and log in to [GitHub CLI](https://cli.github.com/): `gh auth login`.
- In this repo, the Cursor rule **github-issue-agent** tells the agent to:
  - Resolve the issue (#N or "latest issue") via `gh issue view` / `gh issue list`.
  - Implement the work, run `pnpm run agentic`, then create a branch, commit, push, and open a PR that closes the issue.

**What you do:**

1. Create your issue on GitHub.
2. In Cursor, say for example: _"Implement issue #3"_ or _"I just created a new issue — pick it up and open a PR so I can merge and deploy."_
3. When the agent opens the PR, merge it (or merge when CI is green). Deployment runs automatically on push to `main` (e.g. Vercel).

So the agent doesn’t "deploy" by itself; it opens the PR. You merge → that’s the deploy step.

---

## 2. GitHub Action: auto-create branch + draft PR (optional)

If you want a **branch and draft PR created as soon as an issue is "assigned" to the agent**, add the label **`agent`** to the issue. The workflow in `.github/workflows/agentic-issue.yml` will:

- Create a branch `issue-<number>-<slug>` from `main`.
- Open a **draft PR** that links the issue (body: "Closes #N").
- Comment on the issue with the PR link.

Then either:

- **Cursor:** Say "Implement issue #N" and the agent will implement on that branch and push (the draft PR updates), or
- **Sweep / other bot:** Use a tool that implements from the issue and pushes to the same branch.

**Enable the workflow:**

1. Ensure the workflow file exists: `.github/workflows/agentic-issue.yml`.
2. Add the label **`agent`** to any issue you want the agent to pick up. The Action will create the branch and draft PR.

**Fully automated "agent implements in the cloud":**  
To have an AI implement the issue entirely in GitHub (no Cursor), you’d add a step in that workflow (or a separate one) that calls an LLM API (e.g. OpenAI/Anthropic) with the issue body, gets code edits, applies them, and pushes. That requires storing an API key in GitHub Secrets and scripting the apply step. Services like [Sweep](https://sweep.dev) can do this: you install their app, label the issue, and they create a PR; merging that PR is your deploy.

---

## Summary

| Who does the work                         | Trigger                               | Deploy                                       |
| ----------------------------------------- | ------------------------------------- | -------------------------------------------- |
| **Cursor (you say "implement issue #N")** | You ask in Cursor                     | You merge the PR → Vercel deploys            |
| **GitHub Action**                         | Add label `agent` → branch + draft PR | You (or a bot) implement; you merge → deploy |
| **Sweep / cloud agent**                   | Label issue; their bot opens PR       | You merge their PR → deploy                  |

To "make sure an agent picks it up and deploys on its own": use Cursor and say _"Implement issue #N and open a PR"_; after that, merging the PR is the only manual step, and that’s what triggers deploy.
