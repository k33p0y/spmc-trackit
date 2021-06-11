from rest_framework import permissions


class CanGenerateReference(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.user.has_perm('requests.generate_reference'):
            return True
        return False