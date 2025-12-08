from datetime import datetime, timedelta
from functools import partial
from PySide6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QSizePolicy,
                               QHBoxLayout, QLabel, QTabWidget, QFrame, QGridLayout, QMessageBox,
                               QLineEdit, QPushButton, QSpinBox, QProgressBar, QStatusBar)
from PySide6.QtCore import QObject, Signal, Qt
from PySide6.QtGui import QFont
from PySide6.QtGui import QImage, QPixmap

from app.controllers.main_controller import MainController
from app.models.background_worker import InitMainControllerWorkers, run_in_bg_async
from app.models.enums import EventType
from app.utils.convert_util import bytes_to_ndarray

class MainWindow(QMainWindow):
    ui_event_signal = Signal(EventType, object)
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Quản lý Xe Ra Vào")
        self.setGeometry(50, 50, 1200, 700)

        self._loading_overlay = None
        self.controller: MainController = None
        
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Main layout
        main_layout = QHBoxLayout(central_widget)
        
        # Create tab widget first
        self.tab_widget = QTabWidget()
        self.tab_widget.addTab(self.create_status_tab(), "Trạng thái")
        self.tab_widget.addTab(self.create_register_tab(), "Đăng kí vé tháng")
        self.tab_widget.addTab(self.create_unregister_tab(), "Hủy đăng kí vé tháng")
        self.tab_widget.addTab(self.create_new_ticket_tab(), "Tạo vé xe mới")
        self.tab_widget.currentChanged.connect(self.on_tab_changed)

        # Left panel
        left_panel = QWidget()
        left_layout = QVBoxLayout(left_panel)
        left_layout.setContentsMargins(0, 0, 0, 0)
        left_layout.addWidget(self.tab_widget)
        main_layout.addWidget(left_panel, stretch=1)
        
        # Right panel (cameras) - will be shown/hidden based on tab
        self.right_panel = self.create_right_panel()
        main_layout.addWidget(self.right_panel, stretch=1)

        # Tạo status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.esp32c3_status_label = QLabel("ESP32C3: Đang kiểm tra kết nối ...")
        self.esp32cam_status_label = QLabel("ESP32CAM: Đang kiểm tra kết nối ...")
        self.status_bar.addWidget(self.esp32c3_status_label)
        self.status_bar.addWidget(self.esp32cam_status_label)

        self._workers = []
        self.ui_event_signal.connect(self._on_ui_event)
        self.show_loading_overlay("Đang khởi tạo...")
        self._workers.append(
            run_in_bg_async(InitMainControllerWorkers, self._on_controller_ready, self.ui_event_signal.emit)
        )

        self.showMaximized()
        
    def create_new_ticket_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setAlignment(Qt.AlignTop)
        layout.setSpacing(20)
        
        title = QLabel("TẠO VÉ XE MỚI")
        title.setFont(QFont("Arial", 16, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("padding: 20px;")
        layout.addWidget(title)

        warning = QLabel("Vui lòng đặt thẻ trống vào đầu đọc để tạo vé mới!")
        warning.setFont(QFont("Arial", 11, QFont.Bold))
        warning.setAlignment(Qt.AlignCenter)
        warning.setStyleSheet("color: #333; padding: 20px;")
        layout.addWidget(warning)

        return tab


    def _on_controller_ready(self, controller):
        self.controller = controller
        self.hide_loading_overlay()

    def show_info(self, message, title="Thông báo"):
        msg = QMessageBox(self)
        msg.setIcon(QMessageBox.Icon.Information)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg.exec()

    def clear_status_display(self):
        """Xóa toàn bộ thông tin hiển thị trong tab Trạng thái."""
        self.plate_image.clear()
        self.plate_image.setText("")
        self.plate_number.setText("--")
        self.card_id.setText("--")
        self.card_type.setText("--")
        self.entry_time.setText("--")
        self.exit_time.setText("--")
        self.duration.setText("--")
        self.owner_name.setText("--")
        self.phone.setText("--")
        self.location.setText("--")
        self.fee_label.setText("THU TIỀN: -- VNĐ")
        self.system_status.setText("ĐANG XỬ LÝ...")

    def _on_ui_event(self, etype: EventType, data):
        match etype:
            case EventType.SHOW_MESS:
                self.show_info(data)

            case EventType.STATUS_CHANGED:
                self.system_status.setText(data)
                self.hide_loading_overlay()

            case EventType.CHECKED_STATUS:
                self.hide_loading_overlay()
                info, plate_pixmap  = data
                scaled_pixmap = plate_pixmap.scaled(
                    300, 150,
                    Qt.AspectRatioMode.KeepAspectRatio,           
                    Qt.TransformationMode.SmoothTransformation  
                )
                self.plate_image.setPixmap(scaled_pixmap)

                # Hiển thị thông tin biển số / thẻ
                self.plate_number.setText(info.get('plate', '--'))
                self.card_id.setText(str(info.get('card_id', '--')))

                monthly_info = info.get('info')
                self.card_type.setText("Vé tháng" if monthly_info else "Vé lượt")

                # Giờ vào
                check_in_plus7 = None
                if info.get('check_in'):
                    try:
                        check_in = datetime.strptime(info['check_in'], "%Y-%m-%d %H:%M:%S")
                        check_in_plus7 = check_in
                        self.entry_time.setText(str(check_in_plus7))
                    except Exception as e:
                        print(f"parse check_in error: {e}")
                        self.entry_time.setText("--")
                else:
                    self.entry_time.setText("--")

                # Giờ ra + thời gian đỗ
                if info.get('check_out'):
                    try:
                        check_out = datetime.strptime(info['check_out'], "%Y-%m-%d %H:%M:%S")
                        check_out_plus7 = check_out
                        self.exit_time.setText(str(check_out_plus7))
                        if check_in_plus7:
                            duration_minutes = (check_out_plus7 - check_in_plus7).total_seconds() / 60
                            self.duration.setText(f"{int(duration_minutes)} phút")
                        else:
                            self.duration.setText("--")
                    except Exception as e:
                        print(f"parse check_out error: {e}")
                        self.exit_time.setText("--")
                        self.duration.setText("--")
                else:
                    self.exit_time.setText("--")
                    self.duration.setText("--")

                # Thông tin vé tháng (nếu có)
                if monthly_info:
                    self.owner_name.setText(monthly_info.get("monthly_user_name", "--"))
                    self.phone.setText(monthly_info.get("monthly_user_phone", "--"))
                    self.location.setText(monthly_info.get("monthly_user_address", "--"))
                else:
                    self.owner_name.setText("--")
                    self.phone.setText("--")
                    self.location.setText("--")

                # Phí
                amount = info.get('amount')
                if amount:
                    self.fee_label.setText(f"THU TIỀN: {str(amount)} VNĐ")
                else:
                    self.fee_label.setText(f"THU TIỀN: -- VNĐ")

            case EventType.ESP32C3_CONNECTED:
                self.esp32c3_status_label.setStyleSheet("color: green;")
                self.esp32c3_status_label.setText("ESP32C3: Đã kết nối")
            case EventType.ESP32C3_UID:
                # Reset toàn bộ thông tin khi nhận UID mới
                if self.tab_widget.currentIndex() == 0:
                    self.clear_status_display()
                self.show_loading_overlay()
            case EventType.ESP32C3_DISCONNECTED:
                self.esp32c3_status_label.setStyleSheet("color: red;")
                self.esp32c3_status_label.setText("ESP32C3: Mất kết nối")
            
            case EventType.ESP32CAM_CONNECTED:
                self.esp32cam_status_label.setStyleSheet("color: green;")
                self.esp32cam_status_label.setText("ESP32CAM: Đã kết nối")
            case EventType.ESP32CAM_DISCONNECTED:
                self.esp32cam_status_label.setStyleSheet("color: red;")
                self.esp32cam_status_label.setText("ESP32CAM: Mất kết nối")
            case EventType.ESP32CAM_RECEIVED_FRAME:
                self.live_camera.setPixmap(data)
            case EventType.ESP32CAM_RECEIVED_CAPTURE:
                self.capture_image.setPixmap(data)

            case EventType.RECEIVED_MONTHLY_INFO:
                self.name_value.setText(data["monthly_user_name"])
                self.phone_value.setText(data["monthly_user_phone"])
                self.address_value.setText(data["monthly_user_address"])
                self.expiry_value.setText(data["monthly_user_expiry"])
                self.cancel_button.clicked.connect(
                    lambda: self.controller.handle_unregister_monthly(data["id"])
                )

        
    def on_tab_changed(self, index):
        if index == 0:
            self.right_panel.show()
        else:
            self.right_panel.hide()
        if index == 0:
            self.controller.tab = 'status'
        if index == 1:
            self.controller.tab = 'register'
        if index == 2:
            self.controller.tab = 'unregister'
        if index == 3:
            self.controller.tab = 'create'
    
    def create_left_panel(self):
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Tab widget
        tab_widget = QTabWidget()
        tab_widget.addTab(self.create_status_tab(), "Trạng thái")
        tab_widget.addTab(self.create_register_tab(), "Đăng kí vé tháng")
        tab_widget.addTab(self.create_unregister_tab(), "Hủy đăng kí vé tháng")
        
        layout.addWidget(tab_widget)
        
        return panel
    
    def create_status_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setAlignment(Qt.AlignTop)
        
        # Status label
        status_label = QLabel("Trạng thái:")
        status_label.setFont(QFont("Arial", 10, QFont.Bold))
        layout.addWidget(status_label)
        
        
        # Vehicle type
        system_status = QLabel("XE RA")
        system_status.setFont(QFont("Arial", 16, QFont.Bold))
        system_status.setAlignment(Qt.AlignCenter)
        system_status.setStyleSheet("background-color: #e8e8e8; padding: 10px; margin: 10px 0;")
        layout.addWidget(system_status)
        self.system_status = system_status
        
        # License plate image placeholder
        image_label = QLabel("Ảnh biển số:")
        image_label.setFont(QFont("Arial", 10, QFont.Bold))
        layout.addWidget(image_label)
        
        plate_image = QLabel()
        plate_image.setFixedSize(300, 150)
        plate_image.setStyleSheet("border: 1px solid black; background-color: white;")
        plate_image.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self.plate_image = plate_image
        layout.addWidget(plate_image, alignment=Qt.AlignmentFlag.AlignHCenter)
        
        # Information grid
        info_layout = QGridLayout()
        info_layout.setVerticalSpacing(15)
        info_layout.setHorizontalSpacing(20)
        
        # License plate number
        info_layout.addWidget(QLabel("Số biển:"), 0, 0)
        plate_number = QLabel("--")
        plate_number.setFont(QFont("Arial", 12, QFont.Bold))
        info_layout.addWidget(plate_number, 0, 1)
        self.plate_number = plate_number
        
        # Divider
        info_layout.addWidget(self.create_divider(), 1, 0, 1, 2)
        
        # Vehicle information section
        vehicle_info_label = QLabel("Thông tin gửi xe:")
        vehicle_info_label.setFont(QFont("Arial", 10, QFont.Bold))
        info_layout.addWidget(vehicle_info_label, 2, 0, 1, 2)
        
        # Entry time
        info_layout.addWidget(QLabel("Giờ vào:"), 3, 0)
        # entry_time = QLabel("19:23 24/12/2025")
        entry_time = QLabel("--")
        entry_time.setFont(QFont("Arial", 10))
        info_layout.addWidget(entry_time, 3, 1)
        self.entry_time = entry_time
        
        # Exit time
        info_layout.addWidget(QLabel("Giờ ra:"), 4, 0)
        exit_time = QLabel("--")
        exit_time.setFont(QFont("Arial", 10))
        info_layout.addWidget(exit_time, 4, 1)
        self.exit_time = exit_time
        
        # Card ID
        info_layout.addWidget(QLabel("ID Thẻ:"), 5, 0)
        card_id = QLabel("--")
        card_id.setFont(QFont("Arial", 10))
        info_layout.addWidget(card_id, 5, 1)
        self.card_id = card_id
        
        # Card type
        info_layout.addWidget(QLabel("Loại thẻ:"), 6, 0)
        card_type = QLabel("Vé lượt")
        card_type.setFont(QFont("Arial", 10, QFont.Bold))
        info_layout.addWidget(card_type, 6, 1)
        self.card_type = card_type
        
        # Duration
        info_layout.addWidget(QLabel("Tổng thời gian đỗ:"), 7, 0)
        duration = QLabel("--")
        duration.setFont(QFont("Arial", 10))
        info_layout.addWidget(duration, 7, 1)
        self.duration = duration
        
        # Divider
        info_layout.addWidget(self.create_divider(), 8, 0, 1, 2)
        
        # Monthly card information section
        monthly_info_label = QLabel("Thông tin vé tháng:")
        monthly_info_label.setFont(QFont("Arial", 10, QFont.Bold))
        info_layout.addWidget(monthly_info_label, 9, 0, 1, 2)
        
        # Owner name
        info_layout.addWidget(QLabel("Tên:"), 10, 0)
        owner_name = QLabel("--")
        owner_name.setFont(QFont("Arial", 10))
        info_layout.addWidget(owner_name, 10, 1)
        self.owner_name = owner_name
        
        # Phone number
        info_layout.addWidget(QLabel("SĐT:"), 11, 0)
        phone = QLabel("--")
        phone.setFont(QFont("Arial", 10))
        info_layout.addWidget(phone, 11, 1)
        self.phone = phone
        
        # Location
        info_layout.addWidget(QLabel("Địa chỉ:"), 12, 0)
        location = QLabel("--")
        location.setFont(QFont("Arial", 10))
        info_layout.addWidget(location, 12, 1)
        self.location = location
        
        layout.addLayout(info_layout)
        layout.addStretch()
        
        # Fee section
        fee_label = QLabel("THU TIỀN: -- VNĐ")
        fee_label.setFont(QFont("Arial", 14, QFont.Bold))
        fee_label.setStyleSheet("color: green; padding: 15px; background-color: #f0f0f0;")
        layout.addWidget(fee_label)
        self.fee_label = fee_label
        
        return tab
    
    def create_register_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setAlignment(Qt.AlignTop)
        layout.setSpacing(20)
        
        # Title
        title = QLabel("ĐĂNG KÍ VÉ THÁNG")
        title.setFont(QFont("Arial", 16, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("padding: 20px;")
        layout.addWidget(title)
        
        # Form layout
        form_layout = QGridLayout()
        form_layout.setVerticalSpacing(15)
        form_layout.setHorizontalSpacing(20)
        form_layout.setContentsMargins(150, 20, 150, 20)
        
        # Registration name
        name_label = QLabel("Tên đăng kí:")
        name_label.setFont(QFont("Arial", 11, QFont.Bold))
        form_layout.addWidget(name_label, 0, 0, Qt.AlignRight)
        
        self.register_name = QLineEdit(text="")
        self.register_name.setFixedHeight(35)
        self.register_name.setStyleSheet("border: 1px solid black; padding: 5px;")
        self.register_name.textChanged.connect(self._update_register_processing_data)
        form_layout.addWidget(self.register_name, 0, 1)
        
        # Phone number
        phone_label = QLabel("Số điện thoại:")
        phone_label.setFont(QFont("Arial", 11, QFont.Bold))
        form_layout.addWidget(phone_label, 1, 0, Qt.AlignRight)
        
        self.register_phone = QLineEdit(text="")
        self.register_phone.setFixedHeight(35)
        self.register_phone.setStyleSheet("border: 1px solid black; padding: 5px;")
        self.register_phone.textChanged.connect(self._update_register_processing_data)
        form_layout.addWidget(self.register_phone, 1, 1)
        
        # Address
        address_label = QLabel("Địa chỉ:")
        address_label.setFont(QFont("Arial", 11, QFont.Bold))
        form_layout.addWidget(address_label, 2, 0, Qt.AlignRight)
        
        self.register_address = QLineEdit(text="")
        self.register_address.setFixedHeight(35)
        self.register_address.setStyleSheet("border: 1px solid black; padding: 5px;")
        self.register_address.textChanged.connect(self._update_register_processing_data)
        form_layout.addWidget(self.register_address, 2, 1)
        
        # Number of months
        months_label = QLabel("Số tháng:")
        months_label.setFont(QFont("Arial", 11, QFont.Bold))
        form_layout.addWidget(months_label, 3, 0, Qt.AlignRight)
        
        self.register_months = QSpinBox()
        self.register_months.setMinimum(1)
        self.register_months.setValue(2)
        self.register_months.setFixedHeight(35)
        self.register_months.setStyleSheet("border: 1px solid black; padding: 5px; font-size: 12pt;")
        self.register_months.valueChanged.connect(self.update_register_total)
        self.register_months.valueChanged.connect(self.update_register_expiry)
        self.register_months.valueChanged.connect(self._update_register_processing_data)
        form_layout.addWidget(self.register_months, 3, 1)
        
        
        # Expiry date
        expiry_label = QLabel("Hết hạn:")
        expiry_label.setFont(QFont("Arial", 11, QFont.Bold))
        form_layout.addWidget(expiry_label, 4, 0, Qt.AlignRight)
        
        self.register_expiry = QLabel("")
        self.register_expiry.setFont(QFont("Arial", 11))
        form_layout.addWidget(self.register_expiry, 4, 1)
        self.update_register_expiry()
        
        # Total amount
        total_label = QLabel("Tổng tiền:")
        total_label.setFont(QFont("Arial", 11, QFont.Bold))
        form_layout.addWidget(total_label, 5, 0, Qt.AlignRight)
        
        self.register_total = QLabel("2 tháng x 100.000 = 200.000 VNĐ")
        self.register_total.setFont(QFont("Arial", 11))
        form_layout.addWidget(self.register_total, 5, 1)
        
        layout.addLayout(form_layout)
        layout.addSpacing(20)
        
        # Warning message
        warning = QLabel("Vui lòng đặt thẻ trống vào đầu đọc để hoàn tất đăng kí vé tháng!")
        warning.setFont(QFont("Arial", 11, QFont.Bold))
        warning.setAlignment(Qt.AlignCenter)
        warning.setStyleSheet("color: #333; padding: 20px;")
        layout.addWidget(warning)
        
        layout.addStretch()
        
        return tab
    
    def _update_register_processing_data(self):
        if self.tab_widget.currentIndex() != 1 or not self.controller:
            return
        register_data = {
            "name": self.register_name.text(),
            "phone": self.register_phone.text(),
            "address": self.register_address.text(),
            "months": self.register_months.value(),
        }
        self.controller.register_data = register_data

    def create_unregister_tab(self):
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setAlignment(Qt.AlignTop)
        layout.setSpacing(20)
        
        # Title
        title = QLabel("HỦY ĐĂNG KÍ VÉ THÁNG")
        title.setFont(QFont("Arial", 16, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("padding: 20px;")
        layout.addWidget(title)
        
        # Warning message
        warning = QLabel("Vui lòng đặt thẻ trống vào đầu đọc để lấy thông tin vé tháng!")
        warning.setFont(QFont("Arial", 11, QFont.Bold))
        warning.setAlignment(Qt.AlignCenter)
        warning.setStyleSheet("color: #333; padding: 20px;")
        layout.addWidget(warning)
        
        # Information display
        info_layout = QGridLayout()
        info_layout.setVerticalSpacing(20)
        info_layout.setHorizontalSpacing(20)
        info_layout.setContentsMargins(80, 20, 80, 20)
        
        # Registration name
        name_label = QLabel("Tên đăng kí:")
        name_label.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(name_label, 0, 0, Qt.AlignRight)
        
        name_value = QLabel("")
        name_value.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(name_value, 0, 1, Qt.AlignLeft)
        self.name_value = name_value
        
        # Phone number
        phone_label = QLabel("Số điện thoại:")
        phone_label.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(phone_label, 1, 0, Qt.AlignRight)
        
        phone_value = QLabel("")
        phone_value.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(phone_value, 1, 1, Qt.AlignLeft)
        self.phone_value = phone_value
        
        # Address
        address_label = QLabel("Địa chỉ:")
        address_label.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(address_label, 2, 0, Qt.AlignRight)
        
        address_value = QLabel("")
        address_value.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(address_value, 2, 1, Qt.AlignLeft)
        self.address_value = address_value
        
        # Expiry date
        expiry_label = QLabel("Hết hạn:")
        expiry_label.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(expiry_label, 4, 0, Qt.AlignRight)
        
        expiry_value = QLabel("")
        expiry_value.setFont(QFont("Arial", 11, QFont.Bold))
        info_layout.addWidget(expiry_value, 4, 1, Qt.AlignLeft)
        self.expiry_value = expiry_value
        
        layout.addLayout(info_layout)
        layout.addSpacing(30)
        
        # Cancel button
        cancel_button = QPushButton("Xác nhận hủy vé tháng")
        cancel_button.setFont(QFont("Arial", 12, QFont.Bold))
        cancel_button.setFixedSize(400, 50)
        cancel_button.setStyleSheet("""
            QPushButton {
                border: 2px solid black;
                background-color: white;
                padding: 10px;
            }
            QPushButton:hover {
                background-color: #f0f0f0;
            }
        """)
        button_layout = QHBoxLayout()
        button_layout.addWidget(cancel_button, alignment=Qt.AlignCenter)
        layout.addLayout(button_layout)
        self.cancel_button = cancel_button

        
        layout.addStretch()
        
        return tab
    
    def update_register_total(self):
        months = self.register_months.value()
        total = months * 100000
        self.register_total.setText(f"{months} tháng x 100.000 = {total:,} VNĐ".replace(",", "."))

    def update_register_expiry(self):
        months = self.register_months.value()
        now = datetime.now()
        # Cộng số tháng vào ngày hiện tại
        expiry = now + timedelta(days=months*30)
        self.register_expiry.setText(expiry.strftime("%d/%m/%Y"))
    
    def create_divider(self):
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setFrameShadow(QFrame.Sunken)
        line.setStyleSheet("background-color: #cccccc;")
        return line
    
    def create_right_panel(self):
        panel = QWidget()
        layout = QVBoxLayout(panel)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)
        
        # Live camera
        live_label = QLabel("Live camera")
        live_label.setFont(QFont("Arial", 10, QFont.Bold))
        layout.addWidget(live_label)
        
        live_camera = QLabel()
        live_camera.setStyleSheet("border: 1px solid black; background-color: white;")
        live_camera.setAlignment(Qt.AlignCenter)
        layout.addWidget(live_camera)
        live_camera.setSizePolicy(QSizePolicy.Ignored, QSizePolicy.Ignored)
        self.live_camera = live_camera
        
        # Captured image
        capture_label = QLabel("Ảnh chụp")
        capture_label.setFont(QFont("Arial", 10, QFont.Bold))
        layout.addWidget(capture_label)
        
        capture_image = QLabel()
        capture_image.setStyleSheet("border: 1px solid black; background-color: white;")
        capture_image.setAlignment(Qt.AlignCenter)
        layout.addWidget(capture_image)
        capture_image.setSizePolicy(QSizePolicy.Ignored, QSizePolicy.Ignored)
        self.capture_image = capture_image
        
        layout.setStretch(1, 1)
        layout.setStretch(3, 1)
        
        layout.addStretch()
        
        return panel

    def _create_loading_overlay(self):
        central = self.centralWidget()
        if central is None:
            return None

        overlay = QWidget(central)
        overlay.setObjectName("loadingOverlay")
        overlay.setStyleSheet("background-color: rgba(0,0,0,120);")
        overlay.setGeometry(central.rect())

        # Center box
        box = QFrame(overlay)
        box.setStyleSheet("background-color: rgba(255,255,255,0.95); border-radius:8px;")
        box_layout = QVBoxLayout(box)
        box_layout.setContentsMargins(16, 12, 16, 12)
        box_layout.setSpacing(8)

        self._loading_label = QLabel("Đang xử lý...")
        self._loading_label.setFont(QFont("Arial", 11, QFont.Bold))
        self._loading_label.setAlignment(Qt.AlignCenter)

        self._loading_bar = QProgressBar()
        self._loading_bar.setRange(0, 0)  # busy indicator
        self._loading_bar.setFixedHeight(10)

        box_layout.addWidget(self._loading_label)
        box_layout.addWidget(self._loading_bar)

        # Layout to center the box
        outer_layout = QVBoxLayout(overlay)
        outer_layout.setContentsMargins(0, 0, 0, 0)
        outer_layout.addStretch()
        h = QHBoxLayout()
        h.addStretch()
        h.addWidget(box)
        h.addStretch()
        outer_layout.addLayout(h)
        outer_layout.addStretch()

        overlay.hide()
        return overlay

    def show_loading_overlay(self, message: str = "Đang xử lý..."):
        if self._loading_overlay is None:
            self._loading_overlay = self._create_loading_overlay()

        if not self._loading_overlay:
            return

        # Update message
        try:
            self._loading_label.setText(message)
        except Exception:
            pass

        self._loading_overlay.setGeometry(self.centralWidget().rect())
        self._loading_overlay.show()
        self._loading_overlay.raise_()

    def hide_loading_overlay(self):
        if self._loading_overlay:
            self._loading_overlay.hide()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        if getattr(self, "_loading_overlay", None) is not None and self.centralWidget() is not None:
            try:
                self._loading_overlay.setGeometry(self.centralWidget().rect())
            except Exception:
                pass
