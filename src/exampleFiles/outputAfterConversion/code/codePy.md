# codePy.py

```python
import keyboard

# Initial state
is_blue = False

# Function to toggle the "background" (simulated as text output)
def toggle_background():
    global is_blue
    if is_blue:
        print("Background: White")
    else:
        print("Background: Light Blue")
    is_blue = not is_blue

# Listen for the "space" key press to toggle
print("Press 'space' to toggle background color. Press 'esc' to exit.")
keyboard.add_hotkey('space', toggle_background)

# Keep the program running until 'esc' is pressed
keyboard.wait('esc')

```