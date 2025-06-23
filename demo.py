import marimo

__generated_with = "0.14.6"
app = marimo.App(width="columns")


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(div, mo, p):
    from molabel import SimpleLabel

    def render(ex):
        return str(
            div(
                p("Is this about Python, the progamming language?", klass="text-2xl"),
                p(ex["text"], klass="text-gray-500"), 
            )
        )

    widget = mo.ui.anywidget(
        SimpleLabel(examples=[{"text": _} for _ in "qwertasdfg+xvcb"], render=render)
    )

    widget
    return (widget,)


@app.cell
def _(widget):
    widget.annotations
    return


@app.cell
def _():
    from mohtml import p, tailwind_css, div, br
    from mohtml.components import terminal

    tailwind_css()
    return div, p


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
