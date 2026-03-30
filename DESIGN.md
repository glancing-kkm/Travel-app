# Design System Strategy: The Digital Concierge

## 1. Overview & Creative North Star
This design system is built on the philosophy of **"The Digital Concierge."** In high-end travel, luxury is not about excess; it is about the removal of friction and the presence of breathing room. We move beyond the "template" look by rejecting the rigid, boxed-in grids of legacy travel apps. 

Instead, we employ **Editorial Asymmetry**. This means using high-contrast typography scales and overlapping imagery to create a sense of motion and discovery. We treat the screen not as a set of containers, but as a continuous, fluid journey where depth is felt through tonal shifts rather than seen through hard lines.

---

## 2. Color & Tonal Architecture
The palette is rooted in `primary` (#0f57d0), but its sophistication comes from how it interacts with the `surface` ecosystem.

*   **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a clear but soft distinction that feels modern and expensive.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. Use `surface-container-lowest` (#ffffff) for primary interactive cards, placed upon a `surface-container` (#ededf6) background. This "nesting" creates natural depth without visual clutter.
*   **The "Glass & Gradient" Rule:** To elevate the mobile experience, use Glassmorphism for floating navigation bars or quick-action headers. Apply `surface` at 70% opacity with a `backdrop-filter: blur(20px)`. 
*   **Signature Textures:** For high-conversion CTAs, do not use flat hex codes. Apply a subtle linear gradient from `primary` (#0f57d0) to `primary-container` (#4e83fe) at a 135-degree angle. This adds a "soul" to the button that feels tactile and premium.

---

## 3. Typography: The Editorial Voice
We use **Inter** as our functional backbone, but we utilize it with an editorial mindset.

*   **The Scale of Authority:** Use `display-lg` (3.5rem) for hero destination names, intentionally tracking it tighter (-0.02em) to give it a "magazine" feel.
*   **The Information Layer:** Use `title-md` for location names and `body-md` for descriptions. 
*   **Hierarchy through Contrast:** Pair `headline-sm` in `on-surface` (#30323b) with `label-md` in `outline` (#797a84) to create a clear separation between primary data (Price/Location) and secondary metadata (Tax/Date).
*   **The "Whisper" State:** Use `label-sm` for legal or micro-copy, ensuring it stays in `on-surface-variant` to maintain a clean aesthetic while remaining accessible.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a sign of "lazy" design. In this system, we prioritize **Tonal Layering**.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on a `surface-container-low` section. This creates a "soft lift" that mimics fine paper.
*   **Ambient Shadows:** When a floating element (like a "Book Now" bar) requires a shadow, it must be an **Ambient Shadow**: `0px 12px 32px rgba(15, 87, 208, 0.06)`. Note the use of the `primary` color in the shadow tint rather than pure black; this makes the shadow feel like a natural reflection of the light.
*   **The Ghost Border:** If a border is required for accessibility in input fields, use a "Ghost Border": the `outline-variant` token at 20% opacity. 100% opaque borders are strictly forbidden.
*   **Frosted Immersion:** Use semi-transparent `surface-variant` layers over high-quality imagery to ensure text legibility while maintaining the "vibe" of the destination behind the content.

---

## 5. Components & Primitives

### Buttons
*   **Primary:** Rounded `xl` (1.5rem / 24px) to feel friendly. Gradient fill (Primary to Primary-Container). Text in `on-primary`.
*   **Secondary:** No fill. `Ghost Border` (Outline-variant @ 20%). Text in `primary`.
*   **Tertiary:** Text-only, using `title-sm` weight to indicate interactivity.

### Cards & Lists (The "Anti-Divider" Rule)
*   **Cards:** Use `lg` (1rem / 16px) or `xl` (1.5rem / 24px) corners. Never use dividers between list items. Instead, use `spacing-4` (1.4rem) to separate content or transition the background from `surface-container-lowest` to `surface-container-low`.
*   **Imagery:** Aspect ratios should be intentional (e.g., 4:5 for portraits, 16:9 for landscapes). Apply a subtle `inner-glow` of white 10% on image edges to make them pop against deep backgrounds.

### Modern Inputs
*   **Fields:** Use `surface-container-highest` for the input background. On focus, transition the background to `surface-container-lowest` and apply a `primary` ghost border.

### Search & Discovery (The "Floating" Search)
*   A persistent search bar should use Glassmorphism. Position it at the bottom of the screen (thumb-zone) rather than the top, using `surface` at 80% opacity and a subtle `Ambient Shadow`.

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use whitespace as a functional tool. Use `spacing-10` (3.5rem) to separate major content blocks to give the user "mental breathing room."
*   **DO** bleed images to the edge of the screen to create an immersive, window-like effect.
*   **DO** use `surface-tint` sparingly to highlight active states in navigation.

### Don’t:
*   **DON’T** use 1px dividers or "keylines." If you think you need a line, use a background color shift instead.
*   **DON’T** use pure black (#000000) for text. Always use `on-surface` (#30323b) to keep the look sophisticated and soft.
*   **DON’T** use standard "Drop Shadows." If the element doesn't feel like it's floating in a real, lit 3D space, the shadow is too heavy.
*   **DON’T** crowd the "Book" button. High-end travel is about the feeling of luxury; give the main action its own dedicated `surface-container` at the bottom of the viewport.