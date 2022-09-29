#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = 'https://blog.inmoth.ca'
RELATIVE_URLS = False

FEED_ALL_ATOM = 'feeds/all.atom.xml'
FEED_ALL_RSS = 'feeds/all.rss'

OUTPUT_PATH = 'deploy/'
PLUGINS = ["inline-css", "tufte-sidenotes"]

DELETE_OUTPUT_DIRECTORY = True
# OUTPUT_RETENTION = ['CNAME', '.git']

