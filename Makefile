.PHONY: release
release: prereq
	# Check if we are on master branch
	if [ "$(shell git rev-parse --abbrev-ref HEAD)" != "master" ]; then \
		echo "Not on master branch."; \
		exit 1; \
	fi

	# Check if the master branch is up-to-date
	git fetch
	if [ "$(shell git rev-parse HEAD)" != "$(shell git rev-parse @{u})" ]; then \
		echo "Master branch is not up to date."; \
		exit 1; \
	fi

	# Extract the version from package.json
	VERSION=$(shell jq -r '.version' package.json)

	# Check if the tag exists
	if git rev-parse "v$$VERSION" >/dev/null 2>&1; then \
		echo "Error: Tag v$$VERSION already exists."; \
		exit 1; \
	fi

	# Check if a changelog entry exists
	CHANGELOG=$(shell sed -n -e "/## $$VERSION/,/## /p" CHANGELOG.md | sed '/## /d')
	if [ -z "$$CHANGELOG" ]; then \
		echo "Error: No release notes found for this version in CHANGELOG.md"; \
		exit 1; \
	fi

	# If all checks pass, create a tag and push it
	git tag -a v$$VERSION -m "Release $$VERSION"
	git push origin v$$VERSION

prereq:
	@which jq > /dev/null || (echo "jq command not found. Please install jq" && exit 1)
