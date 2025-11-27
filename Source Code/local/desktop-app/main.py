from PySide6.QtWidgets import QApplication
import sys
import asyncio
from qasync import QEventLoop

from app.gui.login_window import LoginWindow


def main():
    try:
        app = QApplication(sys.argv)
        loop = QEventLoop(app)
        asyncio.set_event_loop(loop)

        window = LoginWindow()
        window.show()

        with loop:
            loop.run_forever()
    except Exception as e:
        print(str(e))

if __name__ == "__main__":
    main()