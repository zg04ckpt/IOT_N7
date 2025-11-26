from PySide6.QtWidgets import QApplication
import sys
import asyncio
from qasync import QEventLoop

from app.gui.login_window import LoginWindow


def main():
    app = QApplication(sys.argv)
    loop = QEventLoop(app)
    asyncio.set_event_loop(loop)

    window = LoginWindow()
    window.show()

    with loop:
        try:
            loop.run_forever()
        except KeyboardInterrupt:
            pass

if __name__ == "__main__":
    main()