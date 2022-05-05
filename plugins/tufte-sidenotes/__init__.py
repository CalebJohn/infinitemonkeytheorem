from pelican import signals
import re

sidenote_regex = re.compile(r"\[:([^\]]+)\]")

sidenote_html = r"""<label for="{}" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="{}" class="margin-toggle"/>
<span class="sidenote">\1</span>
"""

sidenote_css = """
/* SIDENOTES */
/*From: https://github.com/edwardtufte/tufte-css/blob/gh-pages/tufte.css*/
body {
  width: 87.5%;
  counter-reset: sidenote-counter;
}
input.margin-toggle {
  display: none;
}

label.sidenote-number {
  display: inline-block;
  max-height: 2rem; /* should be less than or equal to paragraph line-height */
}
label.margin-toggle:not(.sidenote-number) {
  display: none;
}
.sidenote,
.marginnote {
  float: right;
  clear: right;
  margin-right: -45%;
  width: 35%;
  margin-top: 0.3rem;
  margin-bottom: 0;
  font-size: 1.1rem;
  line-height: 1.3;
  vertical-align: baseline;
  position: relative;
}

.sidenote-number {
  counter-increment: sidenote-counter;
}

.sidenote-number:after,
.sidenote:before {
  position: relative;
  vertical-align: baseline;
}

.sidenote-number:after {
  content: counter(sidenote-counter, lower-alpha);
  font-size: 1rem;
  top: -0.5rem;
  left: 0.1rem;
}

.sidenote:before {
  content: counter(sidenote-counter, lower-alpha) " ";
  font-size: 1rem;
  top: -0.5rem;
}

@media (max-width: 900px) {
  label.margin-toggle:not(.sidenote-number) {
    display: inline;
  }
  .sidenote,
  .marginnote {
    display: none;
  }
  .margin-toggle:checked + .sidenote,
  .margin-toggle:checked + .marginnote {
    display: block;
    float: left;
    left: 1rem;
    clear: both;
    width: 95%;
    margin: 1rem 2.5%;
    vertical-align: baseline;
    position: relative;
  }
}
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
            content = re.sub(sidenote_regex, html, content, count=1)
            match = re.search(sidenote_regex, content)
            i += 1
            article.metadata['custom_css'] = sidenote_css

        article._content = content


def register():
    signals.article_generator_finalized.connect(inject_notes)
