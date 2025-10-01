---
applyTo: '**'
---
# Instructions for AI

This repository contains a collection of instructions designed to guide AI models in generating specific types of content. Each instruction is stored in a separate markdown file within this directory.

## Tailwind styling

Here's the sample glob

```css
// app/global.css
@theme {

extend: {

screens: {

widescreen: { raw: "(min-aspect-ratio: 3/2)" },

tallscreen: { raw: "(min-aspect-ratio: 13/20)" },

},

keyframes: {

open-menu: {

"0%": { transform: "scaleY(0)" },

"80%": { transform: "scaleY(1.2)" },

"100%": { transform: "scaleY(1)" },

},

},

animation: {

"open-menu": "open-menu 0.5s ease-in-out forwards",

},

}

}
```