from pelican import signals
import re

sidenote_regex = re.compile(r"\[:([^\]]+)\]")

sidenote_html = r"""
<label for="{}" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="{}" class="margin-toggle"/>
<span class="sidenote">\1</span>
"""

def inject_notes(article_generator):
    for article in article_generator.articles + article_generator.drafts:
        content = article._content

        i = 0
        # Side-notes
        match = re.search(sidenote_regex, content)
        while match:
            hsh = f"sn-{i}"
            html = sidenote_html.format(hsh, hsh)
            content = re.sub(sidenote_regex, html, content)
            match = re.search(sidenote_regex, content)
            i += 1

        article._content = content


def register():
    signals.article_generator_finalized.connect(inject_notes)
