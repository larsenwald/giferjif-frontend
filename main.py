import os
import sys
import threading
import webview
import pystray
import keyboard
import tkinter as tk
from PIL import Image, ImageDraw, ImageFont


def create_tray_icon():
    size = 64
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=12, fill=(0, 0, 0, 255))
    try:
        font = ImageFont.truetype("arialbd.ttf", 22)
    except Exception:
        font = ImageFont.load_default()
    text = "GIF"
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (size - (bbox[2] - bbox[0])) // 2
    y = (size - (bbox[3] - bbox[1])) // 2 - 2
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    return img


tray_icon = None
window_visible = True


def update_tray_menu():
    global tray_icon
    if tray_icon is None:
        return
    label = "Hide" if window_visible else "Show"
    tray_icon.menu = pystray.Menu(
        pystray.MenuItem(label, toggle_window, default=True),
        pystray.MenuItem("Quit", quit_app),
    )


def toggle_window(icon, item):
    global window_visible
    if window_visible:
        window.hide()
        window_visible = False
    else:
        window.show()
        window.restore()
        window_visible = True
    update_tray_menu()

def get_center_coords(win_width, win_height):
    root = tk.Tk()
    root.withdraw()
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    root.destroy()
    x = (screen_w - win_width) // 2
    y = (screen_h - win_height) // 2
    return x, y

def quit_app(icon, item):
    icon.stop()
    window.destroy()
    os._exit(0)


def on_closing():
    global window_visible
    window.hide()
    window_visible = False
    update_tray_menu()
    return False


def run_tray():
    global tray_icon
    menu = pystray.Menu(
        pystray.MenuItem("Hide", toggle_window, default=True),
        pystray.MenuItem("Quit", quit_app),
    )
    tray_icon = pystray.Icon("GiferJif", create_tray_icon(), "GiferJif", menu)
    tray_icon.run()


# ── Spotlight ─────────────────────────────────────────────────────────────────

spotlight_window = None
spotlight_lock = threading.Lock()


class SpotlightApi:
    def close_spotlight(self):
        close_spotlight()


def close_spotlight():
    global spotlight_window
    with spotlight_lock:
        if spotlight_window is not None:
            spotlight_window.destroy()
            spotlight_window = None


def open_spotlight():
    global spotlight_window
    with spotlight_lock:
        if spotlight_window is not None:
            return

        html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spotlight.html")

        x, y = get_center_coords(660, 600)

        spotlight_window = webview.create_window(
            title="GiferJif Spotlight",
            url=f"file:///{html_path}",
            width=660,
            height=600,
            x=x,
            y=y,
            resizable=False,
            frameless=True,
            on_top=True,
            js_api=SpotlightApi(),
        )

        def on_spotlight_closed():
            global spotlight_window
            with spotlight_lock:
                spotlight_window = None

        spotlight_window.events.closed += on_spotlight_closed


def hotkey_handler():
    threading.Thread(target=open_spotlight, daemon=True).start()


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    dist_dir = os.path.dirname(os.path.abspath(__file__))
    index = os.path.join(dist_dir, "dist", "index.html")

    if not os.path.exists(index):
        print("ERROR: dist/index.html not found. Run  npm run build  first.")
        sys.exit(1)

    window = webview.create_window(
        title="GiferJif",
        url=f"file:///{index}",
        width=1280,
        height=800,
        min_size=(800, 600),
        resizable=True,
    )

    window.events.closing += on_closing

    keyboard.add_hotkey("ctrl+shift+g", hotkey_handler)

    threading.Thread(target=run_tray, daemon=True).start()

    webview.start()