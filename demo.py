import marimo

__generated_with = "0.14.6"
app = marimo.App(width="columns")


@app.cell(column=0)
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _():
    from mohtml import p, tailwind_css, div, br, pre, code
    from mohtml.components import terminal

    tailwind_css()
    return code, div, p, pre


@app.cell
def _():
    return


@app.cell(column=1)
def _():
    return


@app.cell
def _(code, div, mo, p, pre):
    from molabel import SimpleLabel

    def render(ex):
        return str(
            div(
                p("Is this about Python, the progamming language?", klass="text-2xl"),
                p(ex["text"], klass="text-gray-500"), 
                pre(code(ex['text']))
            )
        )

    widget = mo.ui.anywidget(
        SimpleLabel(examples=[{"text": _} for _ in "qwertasdfg+xvcb"], render=render)
    )

    widget
    return


if __name__ == "__main__":
    app.run()
