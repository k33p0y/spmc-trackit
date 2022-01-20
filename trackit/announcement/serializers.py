from rest_framework import serializers
from .models import Article, Resources
from core.serializers import UserInfoSerializer

class ArticleListSerializer(serializers.ModelSerializer):
    author = UserInfoSerializer(read_only=True)

    class Meta:
        model = Article
        fields = '__all__'