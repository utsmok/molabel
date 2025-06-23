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
    gamepad_shortcuts = traitlets.Dict({}).tag(sync=True)
    
    # Current state
    current_index = traitlets.Int(0).tag(sync=True)
    annotations = traitlets.List([]).tag(sync=True)
    
    def __init__(self, examples, render, notes=True, shortcuts=None, gamepad_shortcuts=None):
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
            "Alt+5": "focus_notes",
            "Alt+6": "speech_notes"
        }
        
        # Default gamepad shortcuts
        default_gamepad_shortcuts = {
            "button_0": "yes",     # Often A button
            "button_1": "no",      # Often B button  
            "button_2": "skip",    # Often X button
            "button_3": "prev",    # Often Y button
            "button_4": "focus_notes",  # Often left bumper
            "button_5": "speech_notes",  # Often right bumper
        }
        
        # Use provided shortcuts or defaults
        self.shortcuts = shortcuts if shortcuts is not None else default_shortcuts
        self.gamepad_shortcuts = gamepad_shortcuts if gamepad_shortcuts is not None else default_gamepad_shortcuts

    def get_annotations(self):
        """Return the collected annotations"""
        return self.annotations