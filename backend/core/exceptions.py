import logging

from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied as DRFPermissionDenied, NotAuthenticated
from django.http import Http404
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings # For settings.DEBUG

logger = logging.getLogger(__name__)
def custom_exception_handler(exc, context):
    """
    Global exception handler that wraps all DRF errors in a consistent JSON format.
    Ensures 'status', 'message', 'data', and 'error' keys are present.
    """

    logger.exception("Unhandled exception in API")

    response = exception_handler(exc, context) # Get DRF's default response

    error_message = "An error occurred."
    error_code = 'error' # Generic default
    details = None
    response_status_code = status.HTTP_500_INTERNAL_SERVER_ERROR # Default for unhandled

    if response is not None: # DRF provided an initial response
        response_status_code = response.status_code
        details = response.data # Base details on DRF's response data

        if isinstance(exc, ValidationError):
            error_message = "Validation error."
            error_code = "validation_error"
            # details is already response.data, which contains field errors
        else: # Other DRF exceptions (NotAuthenticated, AuthenticationFailed, DRFPermissionDenied, etc.)
            if isinstance(response.data, dict) and 'detail' in response.data:
                error_message = str(response.data['detail'])
            elif isinstance(response.data, list) and response.data: # Should not happen often with DRF details
                error_message = str(response.data[0])
            elif response.data: # Fallback if response.data is just a string or other non-dict/list
                 error_message = str(response.data)
            
            # Use DRF's default code if available
            if hasattr(exc, 'default_code'):
                error_code = exc.default_code
            elif response_status_code == status.HTTP_401_UNAUTHORIZED : # NotAuthenticated might not have default_code sometimes
                error_code = 'not_authenticated' 
            elif response_status_code == status.HTTP_403_FORBIDDEN: # DRFPermissionDenied might not have default_code
                error_code = 'permission_denied'


    else: # DRF did not handle the exception (e.g., direct Http404 or DjangoPermissionDenied)
        details = str(exc)
        if isinstance(exc, Http404):
            response_status_code = status.HTTP_404_NOT_FOUND
            error_message = "Not found."
            error_code = 'not_found'
            details = None # No details for simple not found
        elif isinstance(exc, DjangoPermissionDenied): # Django's PermissionDenied
            response_status_code = status.HTTP_403_FORBIDDEN
            error_message = "Permission denied."
            error_code = 'permission_denied'
            details = None # No details for simple permission denied
        else: # Truly unhandled server error
            error_message = "Internal server error."
            error_code = 'server_error'
            if not settings.DEBUG: # Don't leak full exception details in production
                details = None
    
    final_response_data = {
        'status': 'fail', # All exceptions handled here result in a 'fail' status
        'message': error_message,
        'data': None, # No 'data' for error responses
        'error': {
            'code': error_code,
            'details': details
        }
    }
    
    return Response(final_response_data, status=response_status_code)
