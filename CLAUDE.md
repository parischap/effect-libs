<!-- LTeX: language=en-US -->

# General

Repo of libraries complementing the `effect` ecosystem. Packages `conversions`, `effect-report`, `node-effect-lib are outdated and must never be handled even when the request is for the whole repo.

Some packages define a module prefix to avoid collisions:

| Package        | Module Prefix | External module name example |
| -------------- | ------------- | ---------------------------- |
| `effect-lib`   | M             | `MOption`                    |
| `ansi-styles`  | AS            | `ASPalette`                  |
| `pretty-print` | PP            | `PPParameters`               |

Package `playground` is a playground to try out `effect@` code. Do not handle if request is for the whole repo. Handle only if specifically requested.
