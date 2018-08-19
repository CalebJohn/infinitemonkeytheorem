pelican content -s publishconf.py
cd deploy
git add .
git commit -a -m "content update"
git push origin gh-pages
