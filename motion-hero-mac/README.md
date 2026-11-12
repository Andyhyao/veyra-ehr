# motion-hero-mac

The 10-second screen loop that plays over the MacBook in the Veyra hero.

`compositions/analytics.html` reproduces the Practice analytics screen baked into
`../Vegre/assets/img/hero-macbook-analytics.webp`, so frame 0 and the still agree
and the loop closes cleanly at 10s. The landing page layers the rendered video on
top of that still at `left 10.28% / top 2.449% / 79.441% x 85.714%`.

## Rendering

```
npm run check     # lint + runtime + layout + motion + contrast
npm run render    # master mp4 into renders/
```

This machine has no system ffmpeg and no Homebrew, so the encoders come from npm
and are linked onto the npm-script PATH:

- `node_modules/.bin/ffmpeg`  -> `ffmpeg-static` (arm64)
- `node_modules/.bin/ffprobe` -> `@ffprobe-installer/darwin-arm64`

`ffprobe-static` is deliberately **not** used: it ships an x86_64 binary under its
`bin/darwin/arm64/` path, which fails with "bad CPU type" without Rosetta.

`render -o out.webm` does not switch container — it writes H.264 whatever the
extension — so the two web assets are transcoded from the master:

```
node_modules/.bin/ffmpeg -i renders/veyra-hero-mac.mp4 -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -an -pix_fmt yuv420p renders/veyra-hero-mac.webm
node_modules/.bin/ffmpeg -i renders/veyra-hero-mac.mp4 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart -an renders/veyra-hero-mac.web.mp4
```

Then copy `veyra-hero-mac.webm` -> `../Vegre/assets/video/hero-mac.webm` and
`veyra-hero-mac.web.mp4` -> `../Vegre/assets/video/hero-mac.mp4`, and bump the
`?v=` on both `<source>` tags in `../Vegre/index.html` so caches let go.

## Notes

- Only Inter is bundled, so the composition is set in Inter while the page's
  headings are Manrope. At hero scale the difference is not visible.
- The department bar fills are `#2563EB -> #1D4ED8` rather than the still's paler
  gradient: the white value sits at the light end and failed WCAG AA there.
- `tiny-text` is suppressed for this file in `.impeccable/config.json` — it is a
  966x630 device screen shown ~450px wide, so its type is at app scale by design.
