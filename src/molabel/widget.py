import anywidget
import traitlets
from pathlib import Path



class SimpleLabel(anywidget.AnyWidget):
    _esm = Path(__file__).parent / "static" / "widget.js"
    _css = Path(__file__).parent / "static" / "widget.css"
    
    # Widget state
    examples = traitlets.List([]).tag(sync=True)
    notes = traitlets.Bool(True).tag(sync=True)
    shortcuts = traitlets.Dict({}).tag(sync=True)
    
    # Current state
    current_index = traitlets.Int(0).tag(sync=True)
    annotations = traitlets.List([]).tag(sync=True)
    
    def __init__(self, examples, render, notes=True, shortcuts=None):
        super().__init__()
        self.render = render
        self.examples = [{**ex, "_html": self.render(ex)} for ex in examples]
        self.notes = notes
        
        # Default shortcuts with Alt modifier (using event.code format)
        default_shortcuts = {
            "Alt+1": "prev",
            "Alt+2": "yes", 
            "Alt+3": "no",
            "Alt+4": "skip",
            "Alt+5": "focus_notes"
        }
        
        # Use provided shortcuts or defaults
        self.shortcuts = shortcuts if shortcuts is not None else default_shortcuts

    def get_annotations(self):
        """Return the collected annotations"""
        return self.annotations