# Contributing
Contributions on patches, bug-fixes and new features are welcome.

### Where to Find Known Issues
1. Check our open [issues][issues-url] or log a [new][new-issue-url] one.
2. Fork Heatwave
3. Fix bug or add new feature
4. Create tests for the changes you made
5. Make sure you pass both existing and newly inserted tests
6. Push to your fork
7. Create a new Pull Request against `master` branch. 
 
After your pull request has been created, it will be code reviewed and merged if it passes. 

Remember, incremental code changes are much easier to review, so please _avoid huge code dumps_! Also remember to make useful commit messages and to squash your commits when necessary (junk commits, typo fixes). You can edit your previous commit messages during the Stash pull request process if necessary.

## Issue Types
* **feature**: a new feature
* **fix**: a bug fix
* **docs**: changes to Documentation
* **style**: changes that do not affect the meaning of the code
* **refactor**: changes that neither fix a bug nor add a feature
* **perf**: changes that improve performance
* **test**: changes that add missing tests

## Breaking Changes
If your branch contains any breaking changes to the codebase, it will be included as part of a major version bump. Additionally, it is your responsibility to document the breaking change and try to identify cases where it will break in the existing implementation.

## Style Guide
[ESLint][eslint-url] is our pluggable linter of choice. You can view our current [.eslintrc](.eslintrc) which clarifies the JavaScript styles enforced in the Heatwave module.

## Versioning
- `master` is the stable active development branch.
- Releases are tagged as `vX.X.X`.

Occasionally we will tick the version in the repository based on the pull requests that have been merged into master, and tag a new release.

[eslint-url]: http://eslint.org/docs/rules/
[semver-url]: http://semver.org
[issues-url]: https://github.com/juno-framework/heatwave/issues
[new-issue-url]: https://github.com/juno-framework/heatwave/issues/new
