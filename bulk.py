# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "altair==5.5.0",
#     "einops==0.8.1",
#     "marimo",
#     "mohtml==0.1.10",
#     "molabel==0.1.0",
#     "pandas==2.3.0",
#     "polars==1.31.0",
#     "scikit-learn==1.7.0",
#     "sentence-transformers==4.1.0",
#     "umap-learn==0.5.7",
# ]
# ///

import marimo

__generated_with = "0.14.6"
app = marimo.App(width="columns", layout_file="layouts/bulk.grid.json")


@app.cell(column=0, hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Part One 

    Don't stare at your data, look at it!
    """
    )
    return


@app.cell
def _(pl):
    chick_df = pl.read_csv("https://calmcode.io/static/data/chickweight.csv")
    return (chick_df,)


@app.cell
def _(chick_df):
    chick_df
    return


@app.cell
def _(alt, chick_df, pl):
    agg = chick_df.group_by("Time", "Diet").agg(pl.col("weight").mean())

    p1 = alt.Chart(chick_df).mark_point(color="gray", fill="gray").encode(x="Time", y="weight")
    p2 = alt.Chart(agg).mark_line().encode(x="Time", y="weight", color="Diet:N")

    chicken_chart = (p1 + p2).properties(title="weight distribution over time")
    chicken_chart
    return


@app.cell
def _():
    import polars as pl
    return (pl,)


@app.cell(column=1, hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Part Two

    From interactivity to reactivity! ... and why it matters.
    """
    )
    return


@app.cell
def _():
    a = 1
    return


@app.cell
def _():
    b = 2
    return


@app.cell
def _():
    c = 3
    return


@app.cell
def _():
    return


@app.cell(column=2, hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Part Three

    When interactivity becomes normal, you think differently about code.
    """
    )
    return


@app.cell
def _():
    import marimo as mo
    from sklearn.metrics import pairwise_distances
    from molabel import SimpleLabel
    import altair as alt
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer, SimpleLabel, alt, mo, pairwise_distances


@app.cell(hide_code=True)
def _(mo):
    text_ui = mo.ui.text_area(label="Query for coloring")
    text_ui
    return (text_ui,)


@app.cell
def _(mo):
    label_ui = mo.ui.text(label="Name of the label", value="late-delivery")
    label_ui
    return (label_ui,)


@app.cell(hide_code=True)
def _(alt, mo, pltr):
    chart = (
        alt.Chart(pltr)
        .mark_point()
        .encode(
            x=alt.X("x", scale=alt.Scale(domain=[pltr["x"].min() - 1, pltr["x"].max() + 1])),
            y=alt.Y("y", scale=alt.Scale(domain=[pltr["y"].min() - 1, pltr["y"].max() + 1])),
            color="sim",
        )
    )
    widget = mo.ui.altair_chart(chart)
    widget
    return (widget,)


@app.cell
def _(SentenceTransformer):
    model_nomic = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)
    return (model_nomic,)


@app.cell
def _(model_nomic):
    import pandas as pd

    df = pd.read_csv("data/tweets.csv").head(4000)
    texts = df.to_dict()["text"]
    X = model_nomic.encode(texts)
    return X, pd, texts


@app.cell
def _(X):
    from umap import UMAP

    tfm = UMAP(n_components=2, n_neighbors=16).fit(X)
    X_tfm = tfm.transform(X)
    return (X_tfm,)


@app.cell
def _(X, X_tfm, model_nomic, pairwise_distances, pd, text_ui, texts):
    pltr = pd.DataFrame(X_tfm, columns=["x", "y"]).assign(text=texts, sim=0)
    if text_ui.value:
        vec = model_nomic.encode([text_ui.value])
        pltr = pltr.assign(sim=-pairwise_distances(vec, X, metric="cosine")[0])
    return (pltr,)


@app.cell
def _(widget):
    widget.value["text"].reset_index()
    return


@app.cell(column=3, hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Part Four

    Widgets are a missing piece!
    """
    )
    return


@app.cell
def _(SimpleLabel, examples, label_ui, mo, render_fasthtml):
    render_func = render_fasthtml(label_ui.value)
    label_widget = mo.ui.anywidget(SimpleLabel(examples=examples, render=render_func))
    label_widget
    return (label_widget,)


@app.cell
def _(div, p, span, widget):
    examples = [{"text": t} for t in widget.value["text"]]


    def render(label):
        def inner_render(ex):
            return str(
                div(
                    p(
                        "Is the ",
                        span(label, klass="underline"),
                        " label appropriate?",
                        klass="text-gray-800 font-bold",
                    ),
                    p(ex["text"], klass="text-gray-500"),
                )
            )

        return inner_render
    return (examples,)


@app.cell
def _():
    from fasthtml.common import Div, P, Span


    def render_fasthtml(label):
        def inner(ex):
            return Div(
                P(
                    "Is the ",
                    Span(label, klass="underline"),
                    " label appropriate?",
                    klass="text-gray-800 font-bold",
                ),
                P(ex["text"], klass="text-gray-500"),
            )

        return inner
    return (render_fasthtml,)


@app.cell
def _(label_widget):
    label_widget.get_annotations()
    return


@app.cell
def _():
    from mohtml import div, p, span, tailwind_css

    tailwind_css()
    return div, p, span


@app.cell(column=4, hide_code=True)
def _(mo):
    mo.md(
        r"""
    ## Part Five out of Four

    One moar thing ... 
    """
    )
    return


@app.cell
def _():
    from mopad import GamepadWidget

    GamepadWidget()
    return


@app.cell
def _():
    from mopaint import Paint

    Paint()
    return


@app.cell
def _():
    import numpy as np
    import matplotlib.pylab as plt
    from mofresh import refresh_matplotlib


    @refresh_matplotlib
    def cumsum_linechart(data):
        y = np.cumsum(data)
        plt.plot(np.arange(len(y)), y)
    return (cumsum_linechart,)


@app.cell
def _(cumsum_linechart):
    from mofresh import ImageRefreshWidget

    fresh_widget = ImageRefreshWidget(src=cumsum_linechart([1, 2, 3, 4]))
    fresh_widget
    return (fresh_widget,)


@app.cell
def _(cumsum_linechart, fresh_widget):
    import random
    import time

    data = [random.random() - 0.5]

    for i in range(100):
        data += [random.random() - 0.5]
        # This one line over here causes the update!
        fresh_widget.src = cumsum_linechart(data)
        time.sleep(0.1)
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
