## 2025-05-14 - Accessible Color Selection
**Learning:** When using color-swatch style buttons for theme selection, icon-only representations provide no information to screen reader users about which color is being selected.
**Action:** Always provide descriptive ARIA labels for color scheme buttons (e.g., `aria-label="Select Ocean Blue color scheme"`) rather than just "Color scheme" or using hex codes, ensuring users with visual impairments can understand the aesthetic choice they are making.
