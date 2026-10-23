---
name: react-code-reviewer
description: Triggers when executing code reviews on React files, components, typescript changes, or frontend styles.
---

# React & TypeScript Code Review Guidelines
When analyzing frontend pull requests or code diffs, the agent must enforce the following safety, performance, and style rules:

### 1. React State & Hooks Safety
- **Stale Closures:** Verify that any `useEffect`, `useCallback`, or `useMemo` block includes all referenced variables in its dependency array.
- **Unnecessary State:** Flag variables stored in `useState` that could be calculated dynamically during render instead.
- **Cleanup Functions:** Ensure active listeners, subscriptions, or `setInterval` timers return a cleanup function inside `useEffect`.

### 2. TypeScript & Type Safety
- **No Implicit Any:** Flag any usage of `any`. Insist on strict explicit types, custom interfaces, or generics.
- **Optional Chaining:** Ensure safe property access (`?.`) is utilized when handling nested data fetched from the Elixir API.

### 3. Performance & Rendering
- **Re-render Optimization:** Look for functions or large objects declared directly inside component bodies that aren't wrapped in `useCallback` or `useMemo` when passed as props to memoized child components.
- **List Keys:** Confirm that all `.map()` rendering loops use a unique database ID or stable identifier for the `key` prop—**never use the array index.**

### 4. Security & API Best Practices
- **XSS Vulnerabilities:** Flag any usage of `dangerouslySetInnerHTML`.
- **Environment Variables:** Catch and flag any hardcoded API keys, URLs, or secrets. Ensure they are pulled from `process.env` or `import.meta.env`.
- **Console Logs:** Ensure debugging expressions like `console.log` are stripped out before shipping.
