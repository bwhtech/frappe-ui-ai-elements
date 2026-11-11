# Contributing

## Set up

You need Node.js 24 and npm 11.

```bash
git clone https://github.com/bwhtech/frappe-ui-ai-elements.git
cd frappe-ui-ai-elements
npm install
npm run dev
```

`npm run dev` starts the demo:

- `/` is the gallery. It shows every element with fixture data.
- `/playground.html` is the playground. Pick an element, change its props, try worst-case data, dark mode and narrow widths, or replay a scripted agent turn. The URL keeps the state, so a link reproduces it.

## Commands

| Command                   | What it does                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Starts the demo.                                                                                                                         |
| `npm run check`           | Checks the format (oxfmt), lints (oxlint) and type-checks (vue-tsc). CI runs it on every pull request, and npm runs it before a publish. |
| `npm run fmt`             | Formats every file with oxfmt.                                                                                                           |
| `npm run lint`            | Lints with oxlint.                                                                                                                       |
| `npm run typecheck`       | Type-checks the library and the demo.                                                                                                    |
| `npm run build`           | Builds the library into `dist/`: one ES module for each source file, and type declarations in `dist/types/`.                             |
| `npm run build:demo`      | Builds the demo into `demo-dist/`.                                                                                                       |
| `npm run build:demo:dist` | Builds the demo against `dist/`, to check that the built package works in an app.                                                        |
| `npm run release`         | Releases a version. See [Release a version](#release-a-version).                                                                         |

frappe-ui ships `.vue` files that need the TypeScript 5 API, and TypeScript 7 does not have it. `scripts/vue-tsc.cjs` and `vite.shared.ts` point vue-tsc and the Vue compiler at the TypeScript 5 copy that frappe-ui installs.

## Make a change

1. Make a branch from `main`.
2. Make the change. If it changes how an element looks, check it in the gallery in light mode, dark mode and at phone width.
3. Run `npm run fmt`, then `npm run check`.
4. Open a pull request. The pull request title becomes a line in the release notes, so write it for the people who use the package. For example, "Keep a wide formula inside the reply".

For a change that people must act on, such as a removed prop, also add a line to `CHANGELOG.md`.

## Release a version

A release has two parts. You choose the version on your computer. GitHub Actions checks the code and publishes it.

1. Check out `main` and pull the latest commits.
2. Run `npm run release`.
3. Pick the version:
   - **patch** (1.0.0 → 1.0.1) for fixes.
   - **minor** (1.0.0 → 1.1.0) for new features that do not break existing code.
   - **major** (1.0.0 → 2.0.0) for changes that break existing code.
   - A prerelease, such as 1.1.0-beta.0, publishes to the `next` tag on npm. `latest` stays on the last stable version.

The command runs `npm run check`, sets the version in `package.json` and `package-lock.json`, commits "Release v1.0.1", tags `v1.0.1` and pushes both.

The tag starts [the release workflow](.github/workflows/release.yml). It checks the code again, builds the package, publishes it to npm and creates a GitHub release. GitHub writes the release notes from the pull requests merged since the last release.

### How the workflow publishes

The workflow uses [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). npm gives the workflow a short-lived token for each run, so no npm token is stored in GitHub. npm also adds a provenance statement to each version, which links it to the commit and the workflow run. Provenance needs a public repository.

The package settings on npmjs.com hold the trusted publisher:

| Field             | Value                   |
| ----------------- | ----------------------- |
| Publisher         | GitHub Actions          |
| Organization      | `bwhtech`               |
| Repository        | `frappe-ui-ai-elements` |
| Workflow filename | `release.yml`           |
| Environment       | (empty)                 |

If you rename `release.yml`, change the trusted publisher on npmjs.com too. Otherwise the publish fails.

### The first release

npm sets up a trusted publisher only for a package that exists. So version 1.0.0 is published by hand:

1. Merge the release setup into `main`, and check out `main`.
2. Run `npm login`, then `npm publish`. npm runs `npm run check` and `npm run build` first.
3. Push the tag: `git tag v1.0.0 && git push origin v1.0.0`. The release workflow sees that 1.0.0 is on npm already. It skips the publish and creates the GitHub release.

Then set up the trusted publisher for later releases:

1. On npmjs.com, open the package settings and add the trusted publisher from the table above.
2. Release the next version within 2 days. npm deletes a trusted publisher that has not published within 2 days of its creation. If that happens, add it again just before the next release.
3. After the first publish from the workflow, set "Publishing access" to "Require two-factor authentication and disallow tokens". Only the workflow and people with 2FA can then publish.

## The demo on GitHub Pages

[The Pages workflow](.github/workflows/pages.yml) builds the gallery and the playground on each push to `main` and deploys them to https://bwhtech.github.io/frappe-ui-ai-elements/. In the repository settings, under **Pages**, the source must be **GitHub Actions**.
