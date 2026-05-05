import os
import sys
import threading
import ctypes
import webview
import pystray
import keyboard
import win32gui
from PIL import Image, ImageDraw, ImageFont


# ── Tray icon ─────────────────────────────────────────────────────────────────

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


def get_base_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def get_spotlight_geometry():
    import tkinter as tk
    root = tk.Tk()
    root.withdraw()
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    root.destroy()

    win_w = int(screen_w * 0.40)
    x = (screen_w - win_w) // 2
    y = int(screen_h * 0.35)

    return win_w, x, y


def force_focus_spotlight():
    hwnd = win32gui.FindWindow(None, "GiferJif Spotlight")
    if not hwnd:
        return
    ALT = 0x12
    KEYEVENTF_EXTENDEDKEY = 0x0001
    KEYEVENTF_KEYUP = 0x0002
    ctypes.windll.user32.keybd_event(ALT, 0, KEYEVENTF_EXTENDEDKEY, 0)
    win32gui.SetForegroundWindow(hwnd)
    ctypes.windll.user32.keybd_event(ALT, 0, KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, 0)


class SpotlightApi:
    def close_spotlight(self):
        close_spotlight()

    def resize(self, width, height):
        print(f"resize called: {width} x {height}")
        if spotlight_window is not None:
            spotlight_window.resize(int(width), int(height))

    def copy_gif(self, url):
        import pyperclip
        pyperclip.copy(url)

    def copy_and_paste_gif(self, url):
        import pyperclip, pyautogui, time
        pyperclip.copy(url)
        close_spotlight()
        time.sleep(0.2)
        pyautogui.hotkey('ctrl', 'v')


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

        html_path = os.path.join(get_base_dir(), "spotlight.html")
        win_w, x, y = get_spotlight_geometry()

        spotlight_window = webview.create_window(
            title="GiferJif Spotlight",
            url=f"file:///{html_path}",
            width=win_w,
            height=200,
            x=x,
            y=y,
            resizable=False,
            frameless=True,
            focus=True,
            min_size=(400, 56),
            background_color='#161b27',
            js_api=SpotlightApi(),
        )

        def on_spotlight_closed():
            global spotlight_window
            with spotlight_lock:
                spotlight_window = None

        spotlight_window.events.closed += on_spotlight_closed
        spotlight_window.events.loaded += lambda: force_focus_spotlight()


def hotkey_handler():
    threading.Thread(target=open_spotlight, daemon=True).start()


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    dist_dir = get_base_dir()
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

    keyboard.add_hotkey("ctrl+alt+shift+g", hotkey_handler)

    threading.Thread(target=run_tray, daemon=True).start()

    webview.start()