# F26 Course Command Center

A static dashboard of every graded obligation for Fall 2026 (CIS*3150, CIS*3210, CIS*3090, CIS*3760, ECON*3500): deadlines with weights, a crunch-week heatmap, a calendar, course cards (policies, Rate My Professors snapshot, difficulty indicator), a rules-aware grade calculator and a weekly schedule.

**Live:** https://ashtonlong.github.io/courses-f26/

## Updating
Everything lives in [`data.js`](data.js):
- **A date moved?** Edit that item's `due` (`"YYYY-MM-DDTHH:MM"`, or `"YYYY-MM-DD"` if no time).
- **Final exam scheduled?** Replace `tbd: true` / `window` on the `*-fx` items with a real `due` and `end`.
- **Class times / rooms:** edit `SCHEDULE` (lectures, labs, office hours).
- After editing, bump the `?v=` numbers in `index.html` so browsers fetch the new version.

## Notes
- Check-offs and grades are stored in your browser's localStorage. Use **Grades → Export / Import** to move them between devices.
- Preview any date with `?today=2026-10-19`.
- The **.ics** button downloads every dated obligation for Google, Apple or Outlook Calendar.
- The course outlines themselves are kept out of this repo on purpose.
