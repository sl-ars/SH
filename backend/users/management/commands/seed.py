from django.core.management.base import BaseCommand
from faker import Faker
from django.utils import timezone
from datetime import timedelta

from users.models import CustomUser, StudentProfile, EmployerProfile, CampusProfile
from companies.models import Company
from jobs.models import Job


class Command(BaseCommand):
    help = 'Seed database with test users, companies, and jobs'

    def handle(self, *args, **kwargs):
        fake = Faker()
        roles = ['student', 'employer', 'campus', 'admin']
        users_by_role = {}

        for role in roles:
            users = []
            for _ in range(3):
                user = CustomUser.objects.create_user(
                    email=fake.unique.email(),
                    password='password123',
                    name=fake.name(),
                    role=role,
                    phone=fake.phone_number(),
                    location=fake.city()
                )
                users.append(user)

                if role == 'student':
                    StudentProfile.objects.create(user=user, bio=fake.text(), skills=fake.words(5), achievements=fake.words(3))
                elif role == 'employer':
                    EmployerProfile.objects.create(user=user, company_name=fake.company(), industry="technology", website=fake.url(), description=fake.text())
                elif role == 'campus':
                    CampusProfile.objects.create(user=user, university=fake.company() + " University", department=fake.word(), position="Lecturer")

            users_by_role[role] = users

        companies = []
        for employer in users_by_role['employer']:
            company = Company.objects.create(
                name=fake.company(),
                description=fake.text(),
                website=fake.url(),
                location=fake.city(),
                industry=fake.random_element(elements=[choice[0] for choice in Job.INDUSTRY_CHOICES]),
                size=fake.random_element(["1-10", "11-50", "51-200"]),
                founded=str(fake.year()),
                verified=True
            )
            employer.employer_profile.company = company
            employer.employer_profile.save()
            employer.company = company.name
            employer.company_id = str(company.id)
            employer.save()
            companies.append((company, employer))

        for company, employer in companies:
            for _ in range(10):
                Job.objects.create(
                    title=fake.job(),
                    company=company.name,
                    company_id=str(company.id),
                    location=fake.city(),
                    type=fake.random_element(["full-time", "part-time", "contract"]),
                    salary_min=80000,
                    salary_max=150000,
                    description=fake.text(),
                    requirements=fake.words(5),
                    responsibilities=fake.words(5),
                    benefits=fake.words(5),
                    deadline=timezone.now() + timedelta(days=30),
                    industry=company.industry,
                    created_by=employer,
                    is_active=True
                )

        self.stdout.write(self.style.SUCCESS("✅ Seed data created successfully."))
