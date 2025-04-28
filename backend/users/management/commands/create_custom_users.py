from django.core.management.base import BaseCommand
from django.db import transaction
from users.models import CustomUser, StudentProfile, EmployerProfile, CampusProfile

class Command(BaseCommand):
    help = 'Creates specific users with predefined credentials and roles: admin, campus, employer, student.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        users_to_create = [
            {'email': 'admin@example.com', 'name': 'Admin User', 'role': 'admin', 'password': 'pass1234'},
            {'email': 'campus@example.com', 'name': 'Campus User', 'role': 'campus', 'password': 'pass1234'},
            {'email': 'employer@example.com', 'name': 'Employer User', 'role': 'employer', 'password': 'pass1234'},
            {'email': 'student@example.com', 'name': 'Student User', 'role': 'student', 'password': 'pass1234'},
        ]

        created_count = 0
        skipped_count = 0

        for user_data in users_to_create:
            email = user_data['email']
            name = user_data['name']
            role = user_data['role']
            password = user_data['password']

            if CustomUser.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f"User {email} already exists. Skipping."))
                skipped_count += 1
                continue

            try:
                user_is_staff = False
                if role == 'admin':
                    user_is_staff = True
                
                user = CustomUser.objects.create_user(
                    email=email,
                    name=name,
                    password=password,
                    role=role,
                    is_active=True,
                    is_staff=user_is_staff 
                )
                self.stdout.write(self.style.SUCCESS(f"Successfully created user: {email} ({role}), is_staff: {user.is_staff}"))

                if role == 'student':
                    StudentProfile.objects.create(user=user, bio=f"{name}'s bio.")
                    self.stdout.write(self.style.SUCCESS(f"  - Created StudentProfile for {email}"))
                elif role == 'employer':
                    EmployerProfile.objects.create(
                        user=user, 
                        industry="Tech", 
                        description=f"Profile for {name} from {name} Inc."
                    )
                    user.company = f"{name} Inc."
                    user.save(update_fields=['company'])
                    self.stdout.write(self.style.SUCCESS(f"  - Created EmployerProfile for {email} (company field on profile is unlinked, user.company set to '{user.company}'))"))
                elif role == 'campus':
                    CampusProfile.objects.create(user=user, university=f"{name} University", department="Admissions", position="Representative")
                    self.stdout.write(self.style.SUCCESS(f"  - Created CampusProfile for {email}"))
                
                created_count += 1

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error creating user {email}: {e}"))
                skipped_count += 1
        
        self.stdout.write(self.style.SUCCESS(f"--- Summary ---"))
        self.stdout.write(self.style.SUCCESS(f"Users created: {created_count}"))
        self.stdout.write(self.style.WARNING(f"Users skipped (already exist or error): {skipped_count}"))

        if created_count > 0:
            self.stdout.write(self.style.NOTICE(f"Default password for new users is: pass1234")) 