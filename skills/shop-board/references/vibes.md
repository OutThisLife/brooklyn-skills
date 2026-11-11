# Reading a request, and vibe presets

## From words to `window.__board`

`/shop-board <store> [sizes] [vibe words] [only]`. Nothing here is fixed
syntax. Read the sentence:

| They say | Set |
|---|---|
| a name or URL: `dollskill`, `selkie`, `o-mighty.com` | open that store. Find the real domain first (`curl -sI`), since a guessed `.co` may be dead |
| sizes: `xs`, `xs, s`, `xxs`, `small`, `28`, `one size` | `sizes`, smallest first. Leave out for every size |
| a vibe: `cutie stuff`, `goth`, `cottagecore`, `workwear`, `y2k`, `going out` | `facets`: write groups for that vibe (presets below) and put the vibe's groups first |
| `… only`, `just …`, `nothing but …` | `only`: one RegExp joining that vibe's strong terms, and `onlyLabel` |
| a promo code they mention, or one shown in the store's banner | `promo` |
| house brands (a store's own lines show up as collections) | `brands: [['Label','collection-handle']]` |

Unknown vibe words: write the facets yourself. Strong terms are words that
appear in product titles (garment names, motifs, materials). Weak terms are
colors and details that lean that way. Open the board and look at the top of
each group. If the first row is wrong, tighten the strong terms and reopen.

## Presets

Copy, then trim or extend for the request. Each entry is
`[label, strong, weak, threshold]`.

```js
const cute = [
  ['Sweet', /\bbaby\b|babydoll|\bbows?\b|bunny|teddy|\bbear\b|kitty|kitten|strawberr|cupcake|candy|pastel|frill|ruffle|bloomer|pinafore|mary jane|kawaii|lolita|\bdoll\b|cherub|princess|fairy|tutu|sweetheart|cutie|cute|puppy|lamb|daisy|angel|sanrio|hello kitty|care ?bears?/i, /pink|lilac|lavender|baby blue|heart|cherry|cloud|\bstar|lace trim|scallop|peter pan|pleated|gingham|polka|pointelle/i, 2],
  ['Soft lounge', /lounge|hoodie|fuzzy|fleece|plush|cozy|comfy|pajama|slipper|knit|cardigan|leg warmer/i, /soft|sweat|waffle/i, 2],
  ['Cute intimates', /lingerie|teddy|bralette|panty|panties|bloomer|chemise|babydoll set/i, /lace|sheer|mesh|satin|bow/i, 2],
];
const goth = [
  ['Goth', /goth|\bbats?\b|skull|spike|studded|coffin|spider|widow|witch|occult|crucifix|vamp|cross\b/i, /black|lace|velvet|chain|web|dark|blood|red/i, 2],
  ['Punk & grunge', /punk|grunge|tartan|plaid|safety pin|distress|ripped|band tee|harness|o-ring/i, /black|red|chain|buckle|leather/i, 2],
  ['Fetish-adjacent', /pvc|vinyl|latex|patent|corset|garter|collar|fishnet/i, /strap|buckle|lace up|sheer/i, 2],
];
const cottagecore = [
  ['Cottage', /prairie|cottage|milkmaid|smock|floral|gingham|eyelet|broderie|puff sleeve|peasant|apron|pinafore|tiered/i, /linen|cotton|lace|ruffle|daisy|strawberr|cream|sage/i, 2],
  ['Romantic', /lace|corset|ribbon|bow|tea dress|slip dress|bloomer/i, /ivory|blush|rose|pearl/i, 2],
];
const workwear = [
  ['Office', /blazer|trouser|tailored|suit|pencil|button[- ]down|blouse|loafer|oxford|cardigan|sheath/i, /wool|crepe|pleat|neutral|navy|grey|camel/i, 2],
  ['Smart casual', /chino|knit|polo|shirt dress|midi|turtleneck/i, /cotton|merino|minimal/i, 2],
];
const y2k = [
  ['Y2K', /y2k|low rise|baby tee|butterfly|rhinestone|velour|track ?suit|cargo|mini skirt|halter|tube top|bandana/i, /glitter|metallic|pink|baby blue|chrome/i, 2],
];
const goingOut = [
  ['Going out', /bodycon|cut ?out|backless|club|party|sequin|rhinestone|corset|mini dress|slip dress|halter|going out/i, /mini\b|crop|mesh|sheer|lace up|glitter|metallic|satin|velvet/i, 2],
];
```

`only` from a preset: join the first group's strong terms, e.g.
`only: new RegExp(cute[0][1].source, 'i'), onlyLabel: 'cute'`.
