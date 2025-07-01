import marimo

__generated_with = "0.14.9"
app = marimo.App()


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Enter `molabel`

    `molabel` is an [anywidget](https://anywidget.dev/) library that contains widgets to help you do evals by letting you annotate data from a Python notebook. It even comes with ergonomic benefits like gamepad-support.

    The primary target for this library is [marimo](https://marimo.io/), but it should also work in Jupyter, colab and VSCode.

    ### Install

    You can install it via:

    ```
    uv pip install molabel
    ```

    ### Usage

    The most basic annotation task out there is binary "yes"/"no" annotation. It might be basic, but it also covers *a lot* of ground.

    - there's binary classification
    - there's the "is this a match?" kinds of queries for retreival
    - there's comparisons between two choices, one of which is better
    - if you add a textbox you can add as much context as you see fit for later use

    That's why, as a simple place to get started, this library provides the `SimpleLabel` widget. You can assign a "yes", "no" or "skip" label to an example and you can also attach a note to serve as context. There's also a "previous" button for when you want to undo something you did before.

    ```python
    from molabel import SimpleLabel

    widget = SimpleLabel(examples=list_of_examples, render=render_function)
    widget
    ```

    In this snippet, the list of examples is a Python list of "stuff you want to annotate". This "stuff" needs to render in the front-end and you can customise how by passing a render function. Inside of this function you can use [jinja2](https://jinja.palletsprojects.com/en/stable/), [mohtml](https://github.com/koaning/mohtml) or [FastHTML](https://www.fastht.ml/) as you see fit. The only assumption is that you return something that can render statically in the frontend.

    ### Demo

    If you're curious what it might look like, try the one below!
    """
    )
    return


@app.cell(hide_code=True)
def _(div, mo, p, texts):
    from molabel import SimpleLabel


    def render(ex):
        return str(
            div(
                p("Is about a late delivery?", klass="text-2xl"),
                p(ex["text"], klass="text-gray-500"),
            )
        )


    widget = mo.ui.anywidget(SimpleLabel(examples=[{"text": _} for _ in texts], render=render))

    widget
    return (widget,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""You can explore the generated annotations below as you annotate.""")
    return


@app.cell(hide_code=True)
def _(widget):
    widget.get_annotations()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## More details

    One of the key features of this library is ergonomics. You can use keyboard shortcuts to help you annotate *or* pick up a bluetooth gamepad. You can even use your voice to add notes to your annotations. To configure these shortcuts you can pass keyword arguments. These are the defaults:

    ```python
    default_shortcuts = {
        "Alt+1": "prev",
        "Alt+2": "yes",
        "Alt+3": "no",
        "Alt+4": "skip",
        "Alt+5": "focus_notes",
        "Alt+6": "speech_notes"
    }

    default_gamepad_shortcuts = {
        "button_0": "yes",     # Often A button
        "button_1": "no",      # Often B button
        "button_2": "skip",    # Often X button
        "button_3": "prev",    # Often Y button
        "button_4": "speech_notes",  # Often left bumper
        "button_6": "focus_notes",   # Often left trigger
    }
    ```

    If you are keen to understand how the buttons are mapped on your gamepad, you may enjoy exploring the demo that we have [here](https://koaning.github.io/mopad/).
    """
    )
    return


@app.cell(hide_code=True)
def _():
    import marimo as mo
    return (mo,)


@app.cell(hide_code=True)
def _():
    import pandas as pd
    from mohtml import div, p, tailwind_css

    tailwind_css()
    return div, p, pd


@app.cell(hide_code=True)
def _(pd):
    texts = list(
        pd.read_csv(
            "https://raw.githubusercontent.com/koaning/molabel/refs/heads/main/data/subset.csv"
        )["text"]
    )
    return (texts,)


if __name__ == "__main__":
    app.run()
