from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                               QLabel, QLineEdit, QPushButton, QMessageBox)
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from qasync import asyncSlot

from app.controllers.login_controller import LoginController
from app.gui.main_window import MainWindow

class LoginWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.controller = LoginController(self.on_login_failed, self.on_login_successful)
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Đăng nhập hệ thống")
        self.setFixedSize(450, 600)
        
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - self.width()) // 2
        y = (screen.height() - self.height()) // 2
        self.move(x, y)
        
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(20)
        
        # Title
        title = QLabel("ĐĂNG NHẬP HỆ THỐNG")
        title.setFont(QFont("Arial", 18, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #333; padding: 20px;")
        layout.addWidget(title)
        
        # Username
        email_label = QLabel("Email:")
        email_label.setFont(QFont("Arial", 11, QFont.Bold))
        layout.addWidget(email_label)
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Nhập email")
        self.email_input.setFixedHeight(40)
        self.email_input.setFont(QFont("Arial", 11))
        self.email_input.setStyleSheet("""
            QLineEdit {
                border: 2px solid #ccc;
                border-radius: 5px;
                padding: 5px 10px;
            }
            QLineEdit:focus {
                border: 2px solid #4CAF50;
            }
        """)
        layout.addWidget(self.email_input)
        
        # Password
        password_label = QLabel("Mật khẩu:")
        password_label.setFont(QFont("Arial", 11, QFont.Bold))
        layout.addWidget(password_label)
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Nhập mật khẩu")
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setFixedHeight(40)
        self.password_input.setFont(QFont("Arial", 11))
        self.password_input.setStyleSheet("""
            QLineEdit {
                border: 2px solid #ccc;
                border-radius: 5px;
                padding: 5px 10px;
            }
            QLineEdit:focus {
                border: 2px solid #4CAF50;
            }
        """)
        self.password_input.returnPressed.connect(self.login)
        layout.addWidget(self.password_input)
        
        layout.addSpacing(10)
        
        # Login button
        login_button = QPushButton("Đăng nhập")
        login_button.setFont(QFont("Arial", 12, QFont.Bold))
        login_button.setFixedHeight(45)
        login_button.setCursor(Qt.PointingHandCursor)
        login_button.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
            QPushButton:pressed {
                background-color: #3d8b40;
            }
        """)
        login_button.clicked.connect(self.login)
        self.login_button = login_button
        layout.addWidget(login_button)
        
        layout.addStretch()

    def show_info(self, message, title="Thông báo"):
        msg = QMessageBox(self)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()

    
    def show_error(self, message, title="Lỗi"):
        msg = QMessageBox(self)
        msg.setIcon(QMessageBox.Icon.Critical)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()
    
    def on_login_successful(self):
        self.show_info("Đăng nhập thành công")
        self.main_window = MainWindow()
        self.main_window.show()
        self.close()
    
    def on_login_failed(self, message):
        self.show_error(message)
        self.login_button.setText("Đăng nhập")
    
    @asyncSlot()
    async def login(self):
        self.login_button.setText("Đang đăng nhập ...")

        email = self.email_input.text().strip()
        if not email:
            self.login_button.setText("Đăng nhập")
            self.show_error("Vui lòng điền email")
            return
        
        password = self.password_input.text().strip()
        if not password:
            self.login_button.setText("Đăng nhập")
            self.show_error("Vui lòng điền mật khẩu")
            return
        
        await self.controller.login(email, password)