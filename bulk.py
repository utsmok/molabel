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
app = marimo.App(width="columns")


@app.cell(column=0)
def _():
    import marimo as mo
    from sklearn.metrics import pairwise_distances
    from molabel import SimpleLabel
    import altair as alt
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer, SimpleLabel, alt, mo, pairwise_distances


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


@app.cell(hide_code=True)
def _(mo):
    text_ui = mo.ui.text_area(label="Query for coloring")
    text_ui
    return (text_ui,)


@app.cell(hide_code=True)
def _(alt, mo, pltr):
    chart = (
        alt.Chart(pltr)
        .mark_point()
        .encode(x=alt.X("x", scale=alt.Scale(domain=[pltr["x"].min() - 1, pltr["x"].max() + 1])),
                y=alt.Y("y", scale=alt.Scale(domain=[pltr["y"].min() - 1, pltr["y"].max() + 1])), 
                color="sim")
    )
    widget = mo.ui.altair_chart(chart)
    widget
    return (widget,)


@app.cell
def _(widget):
    widget.value["text"].reset_index()
    return


@app.cell(column=1)
def _(widget):
    widget.value["text"]
    return


@app.cell
def _(SimpleLabel, div, mo, p, render_fasthtml, span, widget):
    examples = [{"text": t} for t in widget.value["text"]]

    def render(label):
        def inner_render(ex): 
            return str(div(
                p("Is the ", span(label, klass="underline"), " label appropriate?", klass="text-gray-800 font-bold"),
                p(ex["text"], klass="text-gray-500")
            ))
        return inner_render

    render_func = render_fasthtml("late-delivery")
    label_widget = mo.ui.anywidget(SimpleLabel(examples=examples, render=render_func))
    label_widget
    return (label_widget,)


@app.cell
def _():
    from fasthtml.common import Div, P, Span

    def render_fasthtml(label):
        def inner(ex):
            return Div(
                P("Is the ", Span(label, klass="underline"), " label appropriate?", klass="text-gray-800 font-bold"), 
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


if __name__ == "__main__":
    app.run()
