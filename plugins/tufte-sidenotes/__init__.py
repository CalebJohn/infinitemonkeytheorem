from logging import getLogger
from pelican import signals
import re

from pelican.readers import BaseReader
from pelican.utils import pelican_open
from markdown import Markdown

log = getLogger(__name__)

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

# https://docs.getpelican.com/en/4.7.2/internals.html?highlight=markdown#how-to-implement-a-new-reader
class MarkdownReader(BaseReader):
    enabled = True
    file_extensions = ['md']

    def read(self, source_path):
        """Parse content and metadata of markdown files"""

        with pelican_open(source_path) as text:
            md_extensions = {'markdown.extensions.meta': {},
                             'markdown.extensions.codehilite': {},
                             'markdown.extensions.footnotes': {}}
            md = Markdown(extensions=md_extensions.keys(),
                          extension_configs=md_extensions)
            content = md.convert(text)

        metadata = {}
        for name, value in md.Meta.items():
            name = name.lower()
            meta = self.process_metadata(name, value[0])
            metadata[name] = meta
        return content, metadata

def add_reader(readers):
    readers.reader_classes['md'] = MarkdownReader


def register():
    # signals.readers_init.connect(add_reader)
    signals.article_generator_finalized.connect(inject_notes)
