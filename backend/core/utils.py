from rest_framework.response import Response
from rest_framework import status


def ok(data=None, *, message="OK", code=status.HTTP_200_OK):
    return Response({"status": "success", "message": message, "data": data}, status=code)


def fail(message, *, code=status.HTTP_400_BAD_REQUEST, details=None, redirectTo=None):
    error = {"details": details}
    if redirectTo:
        error["redirectTo"] = redirectTo
    return Response({"status": "fail", "message": message, "error": error}, status=code)
