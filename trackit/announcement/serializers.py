from difflib import IS_CHARACTER_JUNK
from rest_framework import serializers
from .models import Article, Resources
from core.serializers import UserInfoSerializer

class ResourcesSerializer(serializers.ModelSerializer):
    uploaded_by = UserInfoSerializer(read_only=True)
    file_size = serializers.SerializerMethodField('get_file_size')

    def get_file_size(self, filename):
        try:
            return filename.file.size
        except OSError as e:
            pass
        return 0
  
    class Meta:
        model = Resources
        fields =  ['id', 'file_name', 'file_type', 'file_size', 'file', 'article', 'uploaded_at', 'uploaded_by']

class ArticleListSerializer(serializers.ModelSerializer):
    author = UserInfoSerializer(read_only=True)
    modified_by = UserInfoSerializer(read_only=True)
    resources = ResourcesSerializer(read_only=True, many=True)

    class Meta:
        model = Article
        fields = '__all__'
        datatables_always_serialize = ('id', 'preface')

class ArticleCRUDSerializer(serializers.ModelSerializer):
    author = UserInfoSerializer(read_only=True)

    def create(self, validated_data):
        article = Article(
            title = validated_data['title'],
            preface = validated_data['preface'],
            content = validated_data['content'],
            author = self.context['request'].user,
        )
        article.save()
        return article

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.preface = validated_data.get('preface', instance.preface)
        instance.content = validated_data.get('content', instance.content)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.modified_by = self.context['request'].user
        instance.save()
        return instance

    class Meta:
        model = Article
        fields = '__all__'

class ResourcesSerializer(serializers.ModelSerializer):
    uploaded_by = UserInfoSerializer(read_only=True)
    file_size = serializers.SerializerMethodField('get_file_size')

    def get_file_size(self, filename):
        try:
            return filename.file.size
        except OSError as e:
            pass
        return 0
        
    class Meta:
        model = Resources
        fields =  ['id', 'file_name', 'file_type', 'file_size', 'file', 'article', 'uploaded_at', 'uploaded_by']