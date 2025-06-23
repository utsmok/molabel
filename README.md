# molabel

A simple annotation widget for labeling examples with speech recognition support.

## Features

- **Interactive annotation**: Yes/No/Skip buttons with Previous navigation
- **Speech recognition**: Record voice notes using microphone, keyboard, or gamepad
- **Keyboard shortcuts**: Alt+1-6 for quick navigation and actions
- **Gamepad support**: Controller input with push-to-talk speech
- **Progress tracking**: Visual progress bar showing current position
- **Notes field**: Text annotations with live speech transcription

## Installation

```bash
pip install -e .
```

## Usage

```python
from molabel import SimpleLabel

def render_example(example):
    return f"<p>{example['text']}</p>"

# Create annotation widget
widget = SimpleLabel(
    examples=[{"text": "example 1"}, {"text": "example 2"}],
    render=render_example,
    notes=True
)

# Get annotations
annotations = widget.get_annotations()
```

## Controls

- **Mouse**: Click buttons or microphone icon
- **Keyboard**: Alt+1 (prev), Alt+2 (yes), Alt+3 (no), Alt+4 (skip), Alt+5 (focus notes), Alt+6 (speech toggle)
- **Gamepad**: Button mappings with push-to-talk speech on right bumper

## Requirements

- Modern web browser with Speech Recognition API support
- Microphone access for speech features