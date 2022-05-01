#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'monkeys'
SITENAME = u'infinitemonkeytheorem'
# title is used as the header on every page, the wbr tags allow breaking only between words
SITETITLE = u'infinite<wbr>monkey<wbr>theorem'
SITEURL = ''
THEME = 'theme/twins'

PATH = 'content'

TIMEZONE = 'Canada/Mountain'

DEFAULT_LANG = u'en'

#Ignore vim files
IGNORE_FILES = ['*.un~', '*~', '*.swp', '*.ipynb' '*.ipynb_checkpoints']

STATIC_PATHS = [
        "scripts",
        "images",
        "apps",
        "extra"]
EXTRA_PATH_METADATA = {'extra/CNAME': {'path': 'CNAME'}}
ARTICLE_EXCLUDES = STATIC_PATHS + [
]

PLUGIN_PATHS = ["./plugins"]
#PLUGINS = ["thumbnailer", "ipynb"]
# Enable this in publishconf so that we can still get auto reload on css changes
PLUGINS = ["tufte-sidenotes"]
# IPYNB_USE_METACELL = True

IMAGE_PATH = "images"
#DEFAULT_THUMBNAIL_DIR = "images"
#THUMBNAIL_SIZES = {
#  'thumb': '100'
#}

# We don't bother generating categories
CATEGORY_SAVE_AS = ''
CATEGORIES_SAVE_AS = ''

DEFAULT_DATE_FORMAT = '%B %d, %Y'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Add items to top menu before pages
MENUITEMS = [('About', '/pages/about-us.html'), ('Authors','/authors.html'), ('Tags','/tags.html')]

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True

# This is for the inline css plugin, having this saves the site from having to do an extra
# server request to get the css, it's all loaded at once
SITE_CSS_LOCATION = 'theme/twins/static/css/twins.css'

MARKDOWN = {
    'extension_configs': {
        'markdown.extensions.codehilite': {},
        'markdown.extensions.extra': {},
        'markdown.extensions.meta': {},
        'markdown.extensions.toc': {'anchorlink': True},
    },
}
