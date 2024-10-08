"""A Pelican plugin which will inline a given css file at the head of all pages."""

from pelican import signals


def inline_css(pelican):
    location = pelican.settings.get("SITE_CSS_LOCATION", None)
    if location:
        with open(location, "r") as css_file:
            pelican.settings["SITE_CSS"] = css_file.read()


def register():
    signals.initialized.connect(inline_css)
