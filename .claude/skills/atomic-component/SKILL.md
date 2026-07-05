---
name: atomic-component
description: Use this skill when creating, organizing, or refactoring reusable UI components in maps. Trigger whenever the user asks to build a Button, Input, Card, Header, Form, Modal, list item, or any other UI piece in apps/web or apps/mobile. Triggers on keywords — atomic, atom, molecule, organism, template, 공통 컴포넌트, 재사용 컴포넌트, 컴포넌트 만들기, UI 컴포넌트, reusable component, shared component, design system — and on any request that would create a .tsx component in apps/web/src/components or apps/mobile/src/components.
---

# atomic-component

Scaffold and organize maps UI components using atomic design. The goal is **many small, reusable components** — if a new screen is repeating JSX it's already wrong.

## Where components live

```
apps/web/src/components/       # Next.js / React DOM
  atoms/         Button, Input, Text, Icon, Avatar, Badge, Divider, Spinner
  molecules/     FormField, SearchBar, Card, ListItem, TabItem
  organisms/     Header, PostList, CrewCard, NavBar, CommentThread
  templates/     AuthLayout, DashboardLayout, ProfileLayout
  index.ts       barrel

apps/mobile/src/components/    # Expo / React Native
  atoms/
  molecules/
  organisms/
  templates/
  index.ts
```

Web and mobile keep **separate implementations** (different primitives: `<button>` vs `Pressable`, `<input>` vs `TextInput`). They share **tokens** (`@maps/tokens`) and **schemas** (`@maps/shared`). Do not try to share `.tsx` files across platforms unless the user explicitly asks — react-native-web / tamagui-style abstractions are out of scope until requested.

## Atomic level — how to choose

- **atom** — no dependencies on other app components. Pure primitive wrapping a native element + tokens. `Button`, `Text`, `Input`, `Icon`.
- **molecule** — composes 2–5 atoms into one labeled unit. `FormField` = `Label` + `Input` + `ErrorText`.
- **organism** — a meaningful standalone section on a page. `Header`, `PostList`, `CrewCard`.
- **template** — page-level layout shell with slots. No data fetching inside.

If unsure: start as an atom, promote later. Prefer many atoms over one big molecule.

## File layout per component

Use single-file components at first — promote to a folder only when you add tests, stories, or multiple related files.

```
atoms/Button.tsx          ← component
atoms/index.ts            ← re-exports every atom

atoms/Button/             ← promote when needed
  Button.tsx
  Button.types.ts
  Button.test.tsx
  index.ts
```

The level's `index.ts` is a barrel. Every new component must be added to it so imports stay clean:

```ts
// apps/web/src/components/atoms/index.ts
export * from "./Button";
export * from "./Input";
```

## Import rules

- **Tokens:** `import { colors, spacing, typography } from "@maps/tokens"`. No hard-coded hex, no magic pixel numbers.
- **Schemas:** `import { ... } from "@maps/shared"`. Validators live in `packages/shared`, never redefined in components.
- **Cross-level imports:** atoms → nothing. molecules → atoms only. organisms → atoms + molecules. templates → organisms + molecules + atoms. Never import upward.

## Web component template (atoms/Button.tsx)

```tsx
import { colors, spacing, typography } from "@maps/tokens";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = "primary", children, style, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        padding: `${spacing.sm}px ${spacing.md}px`,
        background: variant === "primary" ? colors.primary : "transparent",
        color: variant === "primary" ? colors.onPrimary : colors.primary,
        border: variant === "ghost" ? "none" : `1px solid ${colors.primary}`,
        borderRadius: 8,
        fontSize: typography.body.size,
        fontWeight: typography.body.weight,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
```

Prefer CSS-in-JS only until a styling system is chosen. For Next.js we may switch to Tailwind utility classes — if `tailwind.config.ts` is wired and `globals.css` has the directives, use `className` with tokens exposed as CSS variables instead.

## Mobile component template (atoms/Button.tsx)

```tsx
import { colors, spacing, typography } from "@maps/tokens";
import { Pressable, PressableProps, Text, StyleSheet } from "react-native";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = "primary", children, style, ...rest }: ButtonProps) {
  return (
    <Pressable
      {...rest}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        typeof style === "function" ? undefined : style,
      ]}
    >
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8 },
  primary: { backgroundColor: colors.primary },
  secondary: { borderWidth: 1, borderColor: colors.primary },
  ghost: { backgroundColor: "transparent" },
  label: { fontSize: typography.body.size, fontWeight: typography.body.weight as "600", color: colors.onPrimary },
});
```

## Steps when the user asks for a new component

1. Confirm the target: `web`, `mobile`, or both (default: ask if ambiguous).
2. Classify the level. If unsure, default to `atom`.
3. Create `apps/<target>/src/components/<level>/<Name>.tsx` using the matching template above.
4. Add `export * from "./<Name>";` to `apps/<target>/src/components/<level>/index.ts` (create the file if missing).
5. Import only from `@maps/tokens`, `@maps/shared`, and lower atomic levels.
6. If the component needs variants/sizes — expose them as props with string unions, not boolean flags.
7. After creating, briefly tell the user the import path (`import { Button } from "@/components/atoms"` for web, relative or alias path for mobile depending on tsconfig).

## When NOT to create a component

- If the JSX appears exactly once in the entire app: inline it until it repeats.
- If it's a one-off page layout with no reusable structure: put it in the route file.

Atomic design is about **reuse**, not decoration. A component earns its file by being used more than once.
