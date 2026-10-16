# OctoHome — continuation checkpoint

Updated 16 October 2026.

- Source of truth: this GitHub repository, `octohome/`.
- Live app: https://octolabs.app/octohome/
- Full product and architecture plan: [PLAN.md](PLAN.md).
- Android cloud build succeeded: https://github.com/Octolabs-app/octolabs/actions/runs/38900664864
- Download the `octohome-android-0.1.0` artifact from that run, unzip it, and install the APK on Android 8+. It is a development-signed testing build, not a Play Store release.
- Seven automated model tests passed locally and in GitHub Actions. Existing game validation also passed.
- Live browser verification: create a chore, claim it, complete it, reload and verify persistence. Further UI and physical Android testing remain needed.
- GitHub cloud workflow retains read-only repository permissions and uploads APK artifacts. It does not commit binary downloads to main.
- No paid plans enabled. The laptop does not need to remain on for hosted use or GitHub Actions builds.

The current app stores household data per device. It does not sync between members' phones. Notifications require an open app. Device integration cards do not control real appliances. Android backup file handling remains pending. Currency selection changes denomination only.

Next work: secure cloud accounts and household sharing, then reliable background notifications, then one real supported smart-device integration. Read PLAN.md before extending the product. Do not claim the complete connected-home vision is delivered by this prototype.
