import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Dataset
from .serializers import DatasetSerializer

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

