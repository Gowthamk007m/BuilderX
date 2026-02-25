import json
import os
from urllib import error, request

from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GenerateProjectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request_obj):
        prompt = request_obj.data.get('prompt', '').strip()
        if not prompt:
            return Response({'detail': 'Prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return Response({'detail': 'OPENAI_API_KEY is not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        openai_payload = {
            'model': 'gpt-4o-mini',
            'messages': [
                {
                    'role': 'system',
                    'content': (
                        'You generate project plans. Return strict JSON with keys '
                        '"title" (string), "description" (string), and "feature_list" (array of strings).'
                    ),
                },
                {'role': 'user', 'content': prompt},
            ],
            'response_format': {'type': 'json_object'},
            'temperature': 0.7,
        }

        req = request.Request(
            'https://api.openai.com/v1/chat/completions',
            data=json.dumps(openai_payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )

        try:
            with request.urlopen(req, timeout=30) as response:
                raw_body = response.read().decode('utf-8')
        except error.HTTPError as exc:
            detail = exc.read().decode('utf-8')
            return Response(
                {'detail': 'OpenAI request failed.', 'error': detail},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except error.URLError:
            return Response({'detail': 'Unable to reach OpenAI API.'}, status=status.HTTP_502_BAD_GATEWAY)

        completion = json.loads(raw_body)
        content = completion['choices'][0]['message']['content']
        generated = json.loads(content)

        title = generated.get('title', 'Untitled Project')
        description = generated.get('description', '')
        feature_list = generated.get('feature_list', [])

        if not isinstance(feature_list, list):
            feature_list = []

        project = Project.objects.create(
            owner=request_obj.user,
            title=title,
            description=description,
            feature_list=feature_list,
        )

        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
