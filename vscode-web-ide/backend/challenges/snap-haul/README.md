# Challenge: Snap Haul - CLI Warning Bug

## Background
Our internal tool, Snap Haul, is used to download large snapshot files from our storage buckets. It runs in the terminal as a Node.js CLI app.

## Problem
Users are reporting an annoying bug where a warning message `"Warning: Connection may be unstable"` is printed to `stdout` instead of `stderr`. Furthermore, this warning message is printed multiple times if the download resumes, cluttering the standard output which is often piped to other files.

## Your Task
Modify `cli.js`:
1. Ensure the warning message `"Warning: Connection may be unstable"` is printed exactly once, no matter how many times a chunk download fails or retries.
2. Ensure the warning message is printed to standard error (`stderr`), not standard output (`stdout`).

## Test your fix
`node cli.js`
