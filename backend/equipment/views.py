import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Dataset
from .serializers import DatasetSerializer

from django.http import HttpResponse
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, Image
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from io import BytesIO
import matplotlib.pyplot as plt

from .models import Dataset
from reportlab.platypus import TableStyle
from reportlab.lib import colors

class HistoryView(APIView):
    def get(self, request):
        datasets = Dataset.objects.order_by('-uploaded_at')[:5]
        serializer = DatasetSerializer(datasets, many=True)
        return Response(serializer.data)

class UploadCSVView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        df = pd.read_csv(file)

        summary = {
            "count": len(df),
            "avg_flowrate": float(df["Flowrate"].mean()),
            "avg_pressure": float(df["Pressure"].mean()),
            "avg_temperature": float(df["Temperature"].mean()),
            "type_distribution": df["Type"].value_counts().to_dict()
        }

        dataset = Dataset.objects.create(
            name=file.name,
            summary=summary
        )

        # keep only last 5
        while Dataset.objects.count() > 5:
            oldest = Dataset.objects.order_by('uploaded_at').first()
            if oldest:
                oldest.delete()
            else:
                break

        return Response(summary, status=status.HTTP_201_CREATED)

def generate_pdf_report(request, dataset_id):
    dataset = Dataset.objects.get(id=dataset_id)
    s = dataset.summary

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="{dataset.name}_report.pdf"'
    )

    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    elements = []

    # ---------- TITLE ----------
    elements.append(Paragraph("ChemViz – Analysis Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(f"<b>Dataset:</b> {dataset.name}", styles["Normal"]))
    elements.append(Paragraph(f"<b>Uploaded:</b> {dataset.uploaded_at}", styles["Normal"]))
    elements.append(Spacer(1, 16))

    # ---------- SUMMARY TABLE ----------
    table_data = [
        ["Metric", "Value"],
        ["Samples", s["count"]],
        ["Avg Flowrate", round(s["avg_flowrate"], 2)],
        ["Avg Pressure", round(s["avg_pressure"], 2)],
        ["Avg Temperature", round(s["avg_temperature"], 2)],
    ]

    summary_table = Table(table_data, colWidths=[3 * inch, 2 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
    ]))

    elements.append(summary_table)
    elements.append(Spacer(1, 24))

    # ---------- PIE CHART ----------
    pie_buffer = BytesIO()
    labels = list(s["type_distribution"].keys())
    values = list(s["type_distribution"].values())

    plt.figure(figsize=(4, 4))
    plt.pie(values, labels=labels, autopct="%1.1f%%", startangle=140)
    plt.title("Equipment Type Distribution")
    plt.tight_layout()
    plt.savefig(pie_buffer, format="png", dpi=150)
    plt.close()
    pie_buffer.seek(0)

    # ---------- BAR CHART ----------
    bar_buffer = BytesIO()
    metrics = ["Flowrate", "Pressure", "Temperature"]
    averages = [
        s["avg_flowrate"],
        s["avg_pressure"],
        s["avg_temperature"],
    ]

    plt.figure(figsize=(4, 4))
    plt.bar(metrics, averages, color="#6366f1")
    plt.title("Average Parameters")
    plt.ylabel("Value")
    plt.tight_layout()
    plt.savefig(bar_buffer, format="png", dpi=150)
    plt.close()
    bar_buffer.seek(0)

    # ---------- CHARTS SIDE-BY-SIDE (SINGLE PAGE) ----------
    elements.append(Paragraph("Visual Analysis", styles["Heading2"]))
    elements.append(Spacer(1, 12))

    charts_table = Table(
        [[
            Image(pie_buffer, width=3.2 * inch, height=3.2 * inch),
            Image(bar_buffer, width=3.2 * inch, height=3.2 * inch),
        ]],
        colWidths=[3.5 * inch, 3.5 * inch]
    )

    charts_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))

    elements.append(charts_table)

    # ---------- BUILD PDF ----------
    doc.build(elements)
    return response