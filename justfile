# Build the site
build:
    uv run pelican content

# Build and serve with auto-reload
dev:
    uv run pelican -rl content
