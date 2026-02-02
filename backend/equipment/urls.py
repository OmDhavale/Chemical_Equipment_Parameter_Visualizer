from django.urls import path
from .views import UploadCSVView, HistoryView
from .views import generate_pdf_report

urlpatterns = [
    path('upload/', UploadCSVView.as_view(), name='upload'),
    path('history/', HistoryView.as_view(), name='history'),
    path("report/<int:dataset_id>/", generate_pdf_report),
]
