{% extends 'markdown.tpl'%}


{% block stream %}
  {{ "> {}".format(super().lstrip()) }}
{% endblock stream %}

{% block stream %}
> ERROR
{% endblock stream %}
