# Listening library

Paul Lowe's audience comes here to listen, explore a subject, and return to a
saved talk. The interface should feel spacious enough for that attention.

## Tokens

- Paper `#ffffff`: listening panel and talk list.
- Mist `#f8fafc` (slate-50): library surface.
- Ink `#0f172a` (slate-900): titles and identity.
- Secondary `#475569` (slate-600): dates, topics and explanations.
- Line `#e2e8f0` (slate-200): boundaries between talks.
- Action `#7e22ce` (purple-700): play, selected controls and keyboard focus family.

Use the existing system sans: large, tightly spaced medium-weight display type;
semibold talk titles; normal-weight readable descriptions; tabular playback time.
Keep the approved 44px hit targets and exact seek geometry.

## Layout decision

An artwork-card grid would repeat the same small set of images and make long
titles harder to scan. Choose one coastal listening invitation and a continuous
list instead. Align text left; center only the focused player and empty states.

```text
Desktop                         Mobile
Identity             Source     Identity       Source
                                Invitation
Invitation     Coastal artwork  Coastal artwork + featured talk
Browse         Featured talk    Explore talks / All / Favorites
                                Search / Category
Explore talks  All / Favorites   Play / Title + topics / Save
Search                  Topic   More talks
Play / Title + topics / Date / Save
More talks
```

The memorable element is the spacious invitation beside the existing shoreline
photograph. There are no invented listening statistics, ornamental waves, repeated
cards, uppercase labels, or decorative gradients. Filters stay visible while
browsing; saved state survives reloads. Motion responds to filtering and opening
the player and respects reduced motion.

## Review

The initial idea of several featured cards duplicated the archive and made this
look like a podcast marketplace. One real talk beside the coastal photograph
better fits this small, contemplative listening archive. Keep everything below
it practical: clear topics, dates, progress, empty-state recovery and load more.
