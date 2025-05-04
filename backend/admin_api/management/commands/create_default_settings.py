from django.core.management.base import BaseCommand
from admin_api.models import SystemSettings

class Command(BaseCommand):
    help = 'Create default system settings if they do not exist'

    def handle(self, *args, **kwargs):
        if not SystemSettings.objects.exists():
            self.stdout.write('Creating default system settings...')
            SystemSettings.objects.create(
                siteName='StudentHunter',
                supportEmail='support@studenthunter.com',
                maintenanceMode=False,
                emailNotifications=True,
                pushNotifications=False,
                twoFactorAuth=False,
                passwordExpiry=True,
                smtpServer='smtp.example.com',
                smtpPort='587',
                smtpUsername='user@example.com',
                smtpPassword='',
                smtpSecure=True,
                logoUrl='/images/logo.svg',
                faviconUrl='/favicon.ico',
                primaryColor='#3B82F6',
                primaryAccentColor='#2563EB',
                secondaryColor='#10B981',
                allowOpenRegistration=True,
                requireEmailVerification=True,
                allowStudentRegistration=True,
                allowEmployerRegistration=True,
                jobApprovalRequired=False,
                companyVerificationRequired=True,
                maxFileSizeInMb=5,
                allowedFileTypes=['pdf', 'doc', 'docx', 'jpg', 'png'],
                cookieConsentRequired=True
            )
            self.stdout.write(self.style.SUCCESS('Default system settings created successfully'))
        else:
            self.stdout.write('System settings already exist, skipping...') 