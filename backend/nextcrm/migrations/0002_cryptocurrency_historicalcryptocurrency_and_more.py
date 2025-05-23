# Generated by Django 5.2 on 2025-04-15 20:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("nextcrm", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Cryptocurrency",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100)),
                ("symbol", models.CharField(max_length=10)),
                ("current_price", models.FloatField()),
                ("market_cap", models.BigIntegerField()),
                ("total_volume", models.BigIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name="HistoricalCryptocurrency",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100)),
                ("symbol", models.CharField(max_length=10)),
                ("current_price", models.FloatField()),
                ("market_cap", models.BigIntegerField()),
                ("total_volume", models.BigIntegerField()),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-timestamp"],
            },
        ),
        migrations.CreateModel(
            name="DashboardLayout",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("layout", models.JSONField(default=list)),
                ("widgets", models.JSONField(default=list)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="dashboard_layout",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
