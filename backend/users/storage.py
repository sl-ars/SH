from core.storage import PublicAssetStorage, PrivateAssetStorage


class AvatarStorage(PublicAssetStorage):
    location = "media"


class ResumeStorage(PrivateAssetStorage):
    location = "resumes"
