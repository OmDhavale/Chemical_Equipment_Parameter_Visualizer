import sys
import requests
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QFileDialog, QMessageBox, QComboBox, QFrame, QGridLayout,
    QSizePolicy
)
from PyQt6.QtCore import Qt
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

from PyQt6.QtWidgets import QLineEdit
from PyQt6.QtWidgets import QDialog

API_BASE = "http://127.0.0.1:8000/api"

# --- Styling Config ---
STYLESHEET = """
QWidget {
    background-color: #f8faff;
    font-family: 'Segoe UI', sans-serif;
}

QLabel {
    background-color: transparent;
    color: #1e293b; /* Default text color to dark */
}

/* --- FIX FOR DIALOGUE BOX VISIBILITY --- */
QMessageBox {
    background-color: #ffffff;
    border: 1px solid #f1f5f9;
}

QMessageBox QLabel {
    color: #1e293b; /* Force text to be dark */
    font-size: 13px;
    font-weight: 500;
    background-color: transparent;
}

QMessageBox QPushButton {
    background-color: #ffffff;
    border: 1px solid #6366f1;
    color: #6366f1;
    border-radius: 6px;
    padding: 6px 20px;
    font-weight: 600;
    min-width: 60px;
}

QMessageBox QPushButton:hover {
    background-color: #6366f1;
    color: #ffffff;
}
/* -------------------------------------- */

QComboBox {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px;
    color: #1e293b;
    font-weight: 600;
}

QComboBox QAbstractItemView {
    background-color: white;
    color: #1e293b;
    selection-background-color: #6366f1;
    selection-color: white;
    outline: none;
    border: 1px solid #e2e8f0;
}

QFrame#GlassCard {
    background-color: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 24px;
}

QFrame#StatBox {
    background-color: white;
    border-radius: 16px;
    border: 1px solid #eef2ff;
}

QLabel#StatLabel {
    font-size: 11px;
    font-weight: 800;
    color: #94a3b8;
    letter-spacing: 0.5px;
}

QLabel#StatValue {
    font-size: 26px;
    font-weight: 900;
    color: #6366f1;
}

QPushButton#IconButton {
    background-color: white;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    font-size: 24px;
    padding: 5px;
}

QPushButton#IconButton:hover {
    background-color: #eef2ff;
    border-color: #6366f1;
}

/* Primary Action Button (Analyze) */
QPushButton#PrimaryBtn {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #6366f1, stop:1 #a855f7);
    color: white;
    border-radius: 12px;
    padding: 10px 24px;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
}
QPushButton#PrimaryBtn:disabled {
    background: #cbd5e1;
}

/* Secondary Action Button (Download) */
QPushButton#SecondaryBtn {
    background-color: transparent;
    border: 2px solid #6366f1;
    color: #6366f1;
    border-radius: 12px;
    padding: 8px 20px;
    font-weight: 700;
    font-size: 13px;
}
QPushButton#SecondaryBtn:hover {
    background-color: #eef2ff;
    border-color: #4f46e5;
}
"""

class ModernStatBox(QFrame):
    def __init__(self, label, value="--"):
        super().__init__()
        self.setObjectName("StatBox")
        self.setFixedHeight(90)
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        self.lbl = QLabel(label.upper())
        self.lbl.setObjectName("StatLabel")
        self.lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        self.val = QLabel(str(value))
        self.val.setObjectName("StatValue")
        self.val.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        layout.addWidget(self.lbl)
        layout.addWidget(self.val)


class LoginDialog(QDialog):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Login – ChemViz Pro")
        self.setFixedSize(350, 230)
        self.setStyleSheet(STYLESHEET)

        layout = QVBoxLayout(self)
        layout.setSpacing(15)

        title = QLabel("ChemViz <span style='color:#6366f1;'>Login</span>")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("font-size: 20px; font-weight: 900;")
        layout.addWidget(title)

        self.username = QLineEdit()
        self.username.setPlaceholderText("Username")
        self.username.setStyleSheet("color: black;")
        layout.addWidget(self.username)

        self.password = QLineEdit()
        self.password.setPlaceholderText("Password")
        self.password.setStyleSheet("color: black;")
        self.password.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addWidget(self.password)

        self.login_btn = QPushButton("Login")
        self.login_btn.setObjectName("PrimaryBtn")
        self.login_btn.clicked.connect(self.login)
        layout.addWidget(self.login_btn)

        self.status = QLabel("")
        self.status.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status.setStyleSheet("color: red;")
        layout.addWidget(self.status)

        self.token = None
        self.loading = False


    # def login(self):
    #     try:
    #         res = requests.post(
    #             "http://127.0.0.1:8000/api/token/",
    #             json={
    #                 "username": self.username.text(),
    #                 "password": self.password.text()
    #             },
    #             timeout=5
    #         )

    #         if res.status_code == 200:
    #             self.token = res.json()["access"]
    #             self.accept()
    #         else:
    #             self.status.setText("Invalid credentials")

    #     except Exception:
    #         self.status.setText("Server unavailable")

    def set_loading(self, is_loading: bool):
        self.loading = is_loading
        self.login_btn.setDisabled(is_loading)

        if is_loading:
            self.login_btn.setText("Logging in...")
            self.status.setText("")
        else:
            self.login_btn.setText("Login")

        
    def login(self):
        if self.loading:
            return

        if not self.username.text().strip() or not self.password.text().strip():
            self.status.setText("Please enter username and password")
            return

        self.set_loading(True)
        QApplication.processEvents()  # force UI repaint

        try:
            res = requests.post(
                "http://127.0.0.1:8000/api/token/",
                json={
                    "username": self.username.text(),
                    "password": self.password.text()
                },
                timeout=5
            )

            if res.status_code == 200:
                self.token = res.json()["access"]
                self.accept()   # ✅ CORRECT WAY
                return
            else:
                self.status.setText("Invalid credentials")

        except Exception:
            self.status.setText("Server unavailable")

        self.set_loading(False)


class ChemVizDesktop(QWidget):
    def __init__(self, token):
        super().__init__()
        self.token = token
        self.setWindowTitle("ChemViz Pro")
        self.setMinimumSize(1100, 800)
        self.setStyleSheet(STYLESHEET)
        
        self.data = None
        self.history = []
        self.current_file_path = None
        self.current_dataset_id = None
        
        self.init_ui()
        self.fetch_history()

    def auth_headers(self):
        return {
            "Authorization": f"Bearer {self.token}"
        }
    
    def logout(self):
        self.close()


    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(40, 30, 40, 30)
        main_layout.setSpacing(20)

        # 1. Header
        header = QHBoxLayout()
        title = QLabel("ChemViz <span style='color:#6366f1;'>Pro</span>")
        title.setStyleSheet("font-size: 24px; font-weight: 900; color: #1e293b;")
        header.addWidget(title)
        header.addStretch()
        logout_btn = QPushButton("Logout")
        logout_btn.setObjectName("SecondaryBtn")
        logout_btn.clicked.connect(self.logout)
        header.addWidget(logout_btn)


        self.history_dropdown = QComboBox()
        self.history_dropdown.setFixedWidth(250)
        self.history_dropdown.currentIndexChanged.connect(self.load_history_item)
        header.addWidget(self.history_dropdown)
        main_layout.addLayout(header)

        # 2. Control Toolbar
        self.control_card = QFrame()
        self.control_card.setObjectName("GlassCard")
        self.control_card.setFixedHeight(100)
        
        control_layout = QHBoxLayout(self.control_card)
        control_layout.setContentsMargins(30, 0, 30, 0)
        control_layout.setSpacing(20)

        ctrl_title = QLabel("Data Intake")
        ctrl_title.setStyleSheet("font-size: 18px; font-weight: 800; color: #1e293b;")
        control_layout.addWidget(ctrl_title)

        line = QFrame()
        line.setFrameShape(QFrame.Shape.VLine)
        line.setFrameShadow(QFrame.Shadow.Sunken)
        line.setStyleSheet("color: #e2e8f0;")
        control_layout.addWidget(line)

        self.icon_btn = QPushButton("📁")
        self.icon_btn.setObjectName("IconButton")
        self.icon_btn.setFixedSize(50, 50)
        self.icon_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.icon_btn.clicked.connect(self.select_file)
        control_layout.addWidget(self.icon_btn)

        self.file_lbl = QLabel("Select CSV Dataset")
        self.file_lbl.setStyleSheet("color: #64748b; font-size: 14px; font-weight: 600;")
        control_layout.addWidget(self.file_lbl)

        control_layout.addStretch()

        self.upload_btn = QPushButton("Analyze Dataset")
        self.upload_btn.setObjectName("PrimaryBtn")
        self.upload_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.upload_btn.clicked.connect(self.run_analysis_flow)
        control_layout.addWidget(self.upload_btn)

        main_layout.addWidget(self.control_card)

        # 3. Results Dashboard
        self.res_card = QFrame()
        self.res_card.setObjectName("GlassCard")
        self.res_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        
        self.res_layout = QVBoxLayout(self.res_card)
        self.res_layout.setContentsMargins(30, 30, 30, 30)
        self.res_layout.setSpacing(20)

        self.placeholder_lbl = QLabel("Awaiting Analysis")
        self.placeholder_lbl.setStyleSheet("font-size: 20px; font-weight: 800; color: #cbd5e1;")
        self.placeholder_lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.res_layout.addWidget(self.placeholder_lbl)
        
        main_layout.addWidget(self.res_card)

    def fetch_history(self):
        try:
            res = requests.get(
                f"{API_BASE}/history/",
                headers=self.auth_headers(),
                timeout=5
            )

            if res.status_code == 200:
                self.history = res.json()
                self.history_dropdown.clear()
                self.history_dropdown.addItem("Select Past Dataset")
                for item in self.history:
                    self.history_dropdown.addItem(item["name"])
        except Exception: pass

    def select_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if file_path:
            self.current_file_path = file_path
            self.file_lbl.setText(file_path.split("/")[-1])
            self.file_lbl.setStyleSheet("color: #1e293b; font-weight: 700; font-size: 14px;")

    def run_analysis_flow(self):
        if not self.current_file_path:
            QMessageBox.warning(self, "No File", "Please select a CSV file first.")
            return

        self.upload_btn.setText("Analyzing...")
        self.upload_btn.setEnabled(False)
        QApplication.processEvents()

        try:
            with open(self.current_file_path, "rb") as f:
                response = requests.post(
                    f"{API_BASE}/upload/",
                    files={"file": f},
                    headers=self.auth_headers(),
                    timeout=15
                )
            
            if response.status_code in [200, 201]:
                res_json = response.json()
                self.current_dataset_id = res_json.get("id")
                self.data = res_json.get("summary", res_json)
                
                self.update_dashboard()
                self.fetch_history()
                self.upload_btn.setText("Analyze")
            else:
                self.upload_btn.setText("Analyze Dataset")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed: {str(e)}")
            self.upload_btn.setText("Analyze Dataset")
        finally:
            self.upload_btn.setEnabled(True)

    def load_history_item(self, index):
        if index <= 0: return
        dataset = self.history[index - 1]
        self.current_dataset_id = dataset.get("id")
        self.data = dataset["summary"]
        self.update_dashboard()

    def download_report(self):
        if not self.current_dataset_id:
            QMessageBox.warning(self, "Error", "No dataset loaded.")
            return

        default_name = f"chemviz_report_{self.current_dataset_id}.pdf"
        file_path, _ = QFileDialog.getSaveFileName(self, "Save Report", default_name, "PDF Files (*.pdf)")

        if file_path:
            try:
                url = f"{API_BASE}/report/{self.current_dataset_id}/"
                response = requests.get(
                    url,
                    headers=self.auth_headers(),
                    stream=True
                )

                if response.status_code == 200:
                    with open(file_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    # The QMessageBox call here will now be visible
                    QMessageBox.information(self, "Success", "Report downloaded successfully!")
                else:
                    QMessageBox.warning(self, "Failed", f"Server error: {response.status_code}")
            except Exception as e:
                QMessageBox.critical(self, "Error", str(e))

    def update_dashboard(self):
        while self.res_layout.count():
            item = self.res_layout.takeAt(0)
            if item.widget(): item.widget().deleteLater()
            elif item.layout(): self.clear_layout(item.layout())

        self.placeholder_lbl = None

        # Dashboard Header with Download
        dash_header = QHBoxLayout()
        dash_title = QLabel("Analysis Results")
        dash_title.setStyleSheet("font-size: 18px; font-weight: 800; color: #1e293b;")
        dash_header.addWidget(dash_title)
        dash_header.addStretch()
        
        self.download_btn = QPushButton("Download Report")
        self.download_btn.setObjectName("SecondaryBtn")
        self.download_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.download_btn.clicked.connect(self.download_report)
        dash_header.addWidget(self.download_btn)
        
        self.res_layout.addLayout(dash_header)

        # Stats Row
        stats_grid = QGridLayout()
        stats_grid.setSpacing(20)
        stats_grid.addWidget(ModernStatBox("Samples", f"{self.data.get('count', 0)}"), 0, 0)
        stats_grid.addWidget(ModernStatBox("Flowrate", f"{self.data.get('avg_flowrate', 0):.1f}"), 0, 1)
        stats_grid.addWidget(ModernStatBox("Pressure", f"{self.data.get('avg_pressure', 0):.1f}"), 0, 2)
        stats_grid.addWidget(ModernStatBox("Temperature", f"{self.data.get('avg_temperature', 0):.1f}"), 0, 3)
        self.res_layout.addLayout(stats_grid)

        # Charts Area
        self.figure = Figure(figsize=(10, 5), facecolor='white', tight_layout=True)
        self.canvas = FigureCanvas(self.figure)
        self.canvas.setParent(self.res_card)
        self.canvas.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self.canvas.updateGeometry()
        self.res_layout.addWidget(self.canvas)

        # Pie Chart
        ax1 = self.figure.add_subplot(121)
        dist = self.data.get("type_distribution", {})
        if dist:
            colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
            ax1.pie(dist.values(), labels=dist.keys(), autopct="%1.1f%%", 
                   startangle=140, colors=colors, 
                   wedgeprops={'edgecolor': 'white', 'linewidth': 1.5})
            ax1.set_title("Equipment Distribution", fontsize=10, fontweight='bold', color='#475569')

        # Bar Graph
        ax2 = self.figure.add_subplot(122)
        metrics = ['Flow', 'Press', 'Temp']
        values = [
            self.data.get('avg_flowrate', 0), 
            self.data.get('avg_pressure', 0), 
            self.data.get('avg_temperature', 0)
        ]
        
        bars = ax2.bar(metrics, values, color="#818cf8", width=0.5)
        ax2.set_title("PERFORMANCE AVERAGE", fontsize=10, fontweight='bold', color='#475569')
        
        for bar in bars:
            yval = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{yval:.1f}', 
                    ha='center', va='bottom', fontsize=8, color='#64748b')

        ax2.spines['top'].set_visible(False)
        ax2.spines['right'].set_visible(False)
        ax2.yaxis.grid(True, linestyle='-', alpha=0.15)
        
        self.canvas.draw()
        QApplication.processEvents()

    def clear_layout(self, layout):
        while layout.count():
            child = layout.takeAt(0)
            if child.widget(): child.widget().deleteLater()
            elif child.layout(): self.clear_layout(child.layout())
    
    def resizeEvent(self, event):
        super().resizeEvent(event)
        if hasattr(self, 'canvas') and self.canvas:
            self.canvas.draw_idle()

if __name__ == "__main__":
    app = QApplication(sys.argv)

    while True:
        login = LoginDialog()
        if login.exec() != QDialog.DialogCode.Accepted:
            sys.exit()

        window = ChemVizDesktop(login.token)
        window.show()
        app.exec()
