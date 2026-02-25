from django.conf import settings
from django.db import models


class Project(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    feature_list = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.title
