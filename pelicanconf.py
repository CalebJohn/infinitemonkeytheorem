#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'monkeys'
SITENAME = u'infinitemonkeytheorem'
SITEURL = ''
THEME = 'theme/twins'

PATH = 'content'

TIMEZONE = 'Canada/Mountain'

DEFAULT_LANG = u'en'

#Ignore vim files
IGNORE_FILES = ['*.un~', '*~', '*.swp', '*.ipynb' '*.ipynb_checkpoints']

PROJECT_CATEGORY_TITLES = ["Studies"]
STATIC_PATHS = [
        "scripts",
        "images",
        "apps"]
EXTRA_PATH_METADATA = {
        'apps/audiodraw/audio.html': {'path': 'apps/audiodraw/audio.html'},
        }
ARTICLE_EXCLUDES = [
        "apps"
        ]

PLUGIN_PATHS = ["./plugins"]
#PLUGINS = ["thumbnailer", "ipynb"]
# PLUGINS = ["ipynb.markup"]
# IPYNB_USE_METACELL = True

IMAGE_PATH = "images"
#DEFAULT_THUMBNAIL_DIR = "images"
#THUMBNAIL_SIZES = {
#  'thumb': '100'
#}

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Add items to top menu before pages
MENUITEMS = [('About Us', '/pages/about-us.html'), ('Authors','/authors.html'), ('Tags','/tags.html')]
# NEST_HEADER_IMAGES = 'banana.jpg'
# Footer
NEST_SITEMAP_COLUMN_TITLE = u'Sitemap'
NEST_SITEMAP_ATOM_LINK = u'Get the feed'
NEST_COPYRIGHT = u'&copy; infinitemonkeytheorem 2020'
# index.html
NEST_INDEX_HEAD_TITLE = u'Homepage'
NEST_INDEX_HEADER_TITLE = u'Posts'
NEST_INDEX_CONTENT_TITLE = u'All Articles'
# article.html
NEST_ARTICLE_HEADER_BY = u'By'
NEST_ARTICLE_HEADER_MODIFIED = u'modified'
NEST_ARTICLE_HEADER_IN = u'in category'
# author.html
NEST_AUTHOR_HEAD_TITLE = u'Posts by'
NEST_AUTHOR_HEAD_DESCRIPTION = u'Posts by'
NEST_AUTHOR_CONTENT_TITLE = u'Posts'
# authors.html
NEST_AUTHORS_HEAD_TITLE = u'Author list'
NEST_AUTHORS_HEAD_DESCRIPTION = u'Author list'
NEST_AUTHORS_HEADER_TITLE = u'Author list'
# tag.html
NEST_TAG_HEAD_TITLE = u'Tag archives'
NEST_TAG_HEAD_DESCRIPTION = u'Tag archives'
NEST_TAG_HEADER_TITLE = u'Tag'
# tags.html
NEST_TAGS_HEAD_TITLE = u'Tags'
NEST_TAGS_HEAD_DESCRIPTION = u'Tags List'
NEST_TAGS_HEADER_TITLE = u'Tags'
NEST_TAGS_CONTENT_TITLE = u'Tags List'
NEST_TAGS_CONTENT_LIST = u'tagged'


# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True
