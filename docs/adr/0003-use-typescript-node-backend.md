# 3. Use TypeScript and Node.js for Backend Operations

Date: 2026-04-14

## Status

Accepted

## Context

The assignment specifies Go as the preferred backend language but allows the use of any well-known language provided the rationale is documented. We are building a full-stack monorepo with a React frontend.

## Decision

We will use **Node.js with Express and TypeScript** for the backend architecture instead of Go.

## Consequences

- **Positive:** Utilizing TypeScript across the entire monorepo enables end-to-end type safety. We can share Data Transfer Objects (DTOs), types, and validation schemas (e.g., Zod) directly between the frontend and backend without duplicating models.
- **Positive:** Node.js accelerates iteration speed for this 72-hour constraint while still maintaining high performance and strict RESTful standards required by the rubric.
- **Negative:** Node.js is less computationally efficient than compiled Go, but this is negligible for an I/O-bound CRUD task management application.
