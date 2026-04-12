# 2. Enforce Conventional Commits

Date: 2026-04-12
Status: Accepted

## Context

Unstructured commit messages make changelogs impossible to automate and slow down PR reviews trying to understand context.

## Decision

We enforce the `commitlint` standard across the repository via Husky git commit hooks.
