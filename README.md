# ⌨️ type-fx

> Lightweight text animation library — typewriter, scramble, word rotation, number counters, gradient text, and reveal effects. Zero dependencies. 5 KB gzipped.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/hojullc/type-fx)](https://github.com/hojullc/type-fx/releases)

## Features

- **6 animation types** in one tiny file
- **Auto-init via data attributes** — no JS config needed
- **Accessible** — ARIA labels preserved, respects `prefers-reduced-motion`
- Works via **CDN, ESM, AMD, or CommonJS**

## Install

**CDN**
```html
<script src="https://cdn.jsdelivr.net/gh/hojullc/type-fx@1/src/type-fx.js"></script>
```

**npm**
```bash
npm install type-fx
```

## Quick start

```html
<script src="type-fx.js"></script>

<!-- Auto-init via data attribute -->
<span data-type-fx="typewriter">Hello, world!</span>
<span data-type-fx="gradient">Design through code.</span>
<span data-type-fx="counter" data-to="12345"></span>
```

Or call directly in JavaScript:

```js
TypeFx.typewriter('#el', 'Hello, world!', { speed: 60, loop: true });
TypeFx.scramble('#el', 'Decoded.', { duration: 800 });
TypeFx.counter('#el', 12345, { prefix: '$', separator: ',', duration: 2000 });
TypeFx.rotate('#el', ['fast', 'accessible', 'beautiful'], { interval: 2500 });
TypeFx.reveal('#el', { by: 'word', animation: 'fadeUp', stagger: 80 });
TypeFx.gradient('#el', ['#7064ff', '#ff6b9d', '#06b6d4']);
```

## API

### `TypeFx.typewriter(target, text, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `speed` | ms | `60` | Milliseconds per character |
| `cursor` | boolean | `true` | Show blinking cursor |
| `cursorChar` | string | `'|'` | Cursor character |
| `loop` | boolean | `false` | Loop (type → delete → repeat) |
| `loopDelay` | ms | `1500` | Pause before deleting |
| `onDone` | function | noop | Callback when done |

Returns `{ stop(), replay() }`.

### `TypeFx.scramble(target, text, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | ms | `1000` | Total animation time |
| `chars` | string | alphanumeric+symbols | Character pool for noise |
| `onDone` | function | noop | Callback when done |

### `TypeFx.rotate(target, words, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | ms | `2500` | Time per word |
| `fadeDur` | ms | `400` | Crossfade duration |

### `TypeFx.counter(target, to, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `from` | number | `0` | Start value |
| `duration` | ms | `1500` | Animation duration |
| `decimals` | number | `0` | Decimal places |
| `prefix` | string | `''` | Prepend to value |
| `suffix` | string | `''` | Append to value |
| `separator` | string | `','` | Thousands separator |

### `TypeFx.reveal(target, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `by` | `'word'`\|`'char'` | `'word'` | Split unit |
| `animation` | `'fadeUp'`\|`'fadeIn'`\|`'zoom'` | `'fadeUp'` | Animation style |
| `stagger` | ms | `60` | Delay between units |
| `duration` | ms | `500` | Each unit's animation |

### `TypeFx.gradient(target, colors, options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `colors` | string[] | `['#7064ff','#ff6b9d','#06b6d4']` | Gradient stops |
| `angle` | deg | `90` | Gradient angle |
| `animate` | boolean | `true` | Animate gradient position |
| `duration` | seconds | `4` | Animation cycle time |

## Auto-init attributes

```html
<!-- Typewriter (text content used as target) -->
<span data-type-fx="typewriter"
      data-type-fx-opts='{"speed":80,"loop":true}'>Your text here</span>

<!-- Counter -->
<span data-type-fx="counter" data-to="9999"
      data-type-fx-opts='{"prefix":"$","separator":","}'></span>

<!-- Gradient -->
<h1 data-type-fx="gradient">Stand out.</h1>

<!-- Reveal -->
<p data-type-fx="reveal" data-type-fx-opts='{"by":"word"}'>Animate each word.</p>
```

Auto-init runs on `DOMContentLoaded`.

## Demo

Open `demo/index.html` or see the [live demo](https://github.com/hojullc/type-fx).

## License

MIT © [Hoju LLC](https://hoju.us)
