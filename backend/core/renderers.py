from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    """
    Standardizes API responses to:
    {
        "status": "success" | "fail",
        "message": "OK" | "Error message",
        "data": ...,
        "error": { "code": ..., "details": {...} } or null
    }
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        status_code = getattr(response, 'status_code', 200)

        # Determine if the input 'data' is already in our fully standard format.
        # This is typically true if it came from custom_exception_handler or a utility like core.utils.ok/fail.
        is_fully_pre_standardized = (
            isinstance(data, dict) and
            "status" in data and
            "message" in data and
            ("data" in data or "error" in data) # Key check: payload container must exist
        )

        if is_fully_pre_standardized:
            # Data is already in the desired {status, message, data/error} structure.
            # Render it as is. Assumed to be correct, e.g. from custom_exception_handler or core.utils.ok/fail.
            return super().render(data, accepted_media_type, renderer_context)

        # If not fully pre-standardized, then 'data' is the raw payload (for success)
        # or a simpler error structure. We now build the standard structure around this 'data'.

        is_success_status_code = 200 <= status_code < 300
        standardized_response = {}

        if is_success_status_code:
            standardized_response = {
                "status": "success",
                "message": getattr(response, 'status_text', "OK"), # Use response status text or default
                "data": data,    # Nest the raw payload here
                "error": None
            }
        else:
            # 'data' is likely an error detail dict/str from DRF or a direct Response.
            error_message = "An error occurred."
            error_code = "error" 
            error_details = None

            if isinstance(data, dict):
                if "detail" in data: 
                    error_message = str(data.get("detail", error_message))
                    detail_obj = data.get("detail")
                    error_code = getattr(detail_obj, "code", error_code) if hasattr(detail_obj, "code") else error_code
                elif "non_field_errors" in data: 
                    error_message = str(data["non_field_errors"][0])
                    error_code = "validation_error"
                    error_details = data 
                elif "message" in data and isinstance(data.get("error"), dict) and "code" in data["error"]:
                    # Handle if 'data' is a dict from core.utils.fail() that wasn't caught by is_fully_pre_standardized
                    error_message = data["message"]
                    error_code = data["error"]["code"]
                    error_details = data["error"].get("details")
                elif data: # Catch-all for other error dicts
                    error_message = "Validation error"
                    error_code = "validation_error"
                    error_details = data
            elif isinstance(data, (str, list)): 
                error_message = str(data)
            
            # If error_message is still generic "An error occurred.", try to use response status_text.
            if error_message == "An error occurred." and response and hasattr(response, 'status_text') and response.status_text:
                error_message = response.status_text

            final_error_obj = {"code": error_code}
            if error_details:
                final_error_obj["details"] = error_details
            
            standardized_response = {
                "status": "fail",
                "message": error_message,
                "data": None,
                "error": final_error_obj
            }
        
        # Ensure the actual response status code is correctly set if it was modified or determined here.
        if response and hasattr(response, 'status_code'):
             response.status_code = status_code

        return super().render(standardized_response, accepted_media_type, renderer_context)