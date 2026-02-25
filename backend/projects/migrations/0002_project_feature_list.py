from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='feature_list',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
