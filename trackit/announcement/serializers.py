from difflib import IS_CHARACTER_JUNK
from rest_framework import serializers
from .models import Article, Resources
from core.serializers import UserInfoSerializer

class ArticleListSerializer(serializers.ModelSerializer):
    author = UserInfoSerializer(read_only=True)

    def create(self, validated_data):
        article = Article(
            title = validated_data['title'],
            preface = validated_data['preface'],
            content = validated_data['content'],
            author = self.context['request'].user,
            is_publish = validated_data['is_publish']
        )
        article.save()
        return article

    class Meta:
        model = Article
        fields = '__all__'