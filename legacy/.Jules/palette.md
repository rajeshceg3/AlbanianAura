## 2025-12-30 - [Accessible Custom Interactive Widgets]
**Learning:** Custom interactive widgets like the star rating system (built with spans) were completely inaccessible to keyboard users and screen readers.
**Action:** Always ensure interactive elements have `tabindex="0"`, `role="button"` (or appropriate role), and event listeners for both click and keydown (Enter/Space). Add visible focus styles using CSS `:focus`.
