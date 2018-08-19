# This is my simple alternative to fabric as my needs were simpler

import os
import sys

DEPLOY_PATH = 'output'

def serve():
  os.chdir(DEPLOY_PATH)
  os.system('python -m http.server')

def build():
  os.system('pelican -s pelicanconf.py')

def regenerate():
  os.system('pelican -r -s pelicanconf.py')

def reserve():
  build()
  serve()

def help():
  print('''Must supply an action e.g.(serve, build, etc.)
view automate.py to see available commands''')


if len(sys.argv) > 1:
  for cmd in sys.argv[1:]:
    exec(cmd + '()') # IS THIS SAFE!
    # no
else:
  help()
