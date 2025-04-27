from storages.backends.s3boto3 import S3Boto3Storage

class PublicAssetStorage(S3Boto3Storage):
    location = "public-assets"
    file_overwrite = False
    querystring_auth = False


class PrivateAssetStorage(S3Boto3Storage):
    location = "private-assets"
    file_overwrite = False