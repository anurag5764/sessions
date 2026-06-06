from rest_framework import permissions

class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow CREATORs to write/modify sessions.
    USERs are only allowed safe read-only methods (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        # Safe read-only operations are allowed for everyone (including unauthenticated)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write operations are restricted to authenticated CREATORs
        return request.user and request.user.is_authenticated and request.user.role == 'CREATOR'

    def has_object_permission(self, request, view, obj):
        # Read operations allowed
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write operations (update/delete) are only allowed to the owner/creator
        return obj.creator == request.user


class IsUserAndCanBook(permissions.BasePermission):
    """
    Custom permission to only allow USERs to create bookings.
    Creators can read bookings for their sessions, and users can read their own bookings.
    """
    def has_permission(self, request, view):
        # Must be authenticated
        if not (request.user and request.user.is_authenticated):
            return False
            
        # Creating a booking is only allowed for the USER role
        if request.method == 'POST':
            return request.user.role == 'USER'
            
        # Reading bookings is allowed for both roles
        return request.user.role in ['USER', 'CREATOR']

    def has_object_permission(self, request, view, obj):
        # A USER can only view/manage their own bookings
        if request.user.role == 'USER':
            return obj.user == request.user
        # A CREATOR can only view bookings matching their sessions
        if request.user.role == 'CREATOR':
            return obj.session.creator == request.user
        return False
