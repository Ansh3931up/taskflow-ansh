# 1. Use Monorepo Structure with NPM Workspaces

Date: 2026-04-12
Status: Accepted

## Context

Deploying full-stack applications often introduces duplicate dependencies, mismatched types, and high context switching traversing isolated front/back end repos.

## Decision

We will use NPM Workspaces to host `frontend` and `backend` packages in a single monolithic repository. This allows for hoisted dependency trees and unified terminal scripts.
