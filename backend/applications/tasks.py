from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
# Ensure your Application model path is correct
from .models import Application 
# Assuming Job model is in a 'jobs' app and has 'created_by' and 'title'
# from jobs.models import Job 

User = get_user_model()

@shared_task(bind=True, max_retries=3, default_retry_delay=60) # Added bind, retries and delay
def send_new_application_email_task(self, application_id):
    """
    Sends an email to the employer when a new application is submitted.
    """
    try:
        # Use select_related to optimize DB query if Job and User are ForeignKey
        application = Application.objects.select_related('job__created_by', 'student').get(id=application_id)
        job = application.job
        # Ensure job.created_by is the employer User instance with an email attribute
        employer = job.created_by 
        student = application.student

        if not employer or not hasattr(employer, 'email') or not employer.email:
            print(f"Task send_new_application_email_task: Employer or employer email not found for job ID {job.id}. Application ID: {application_id}")
            return # Or raise an error to retry if appropriate for your logic

        if not student or not hasattr(student, 'email') or not student.email:
            print(f"Task send_new_application_email_task: Student or student email not found for application ID {application_id}")
            # Decide if this is critical; email is to employer, so student email might not be needed here.
            # For this task, student's name is used in the email body.

        employer_name = getattr(employer, 'get_full_name', lambda: employer.email)() or employer.email
        student_name = getattr(student, 'get_full_name', lambda: student.email)() or student.email
        
        subject = f'New Application Received for "{job.title}"'
        message_body = (
            f"Dear {employer_name},"
            f"A new application has been submitted by {student_name} "
            f"for your job posting: {job.title}."
            f"Application ID: {application.id}"
            f"Applicant: {student_name}"
            f"You can view the full application details in your employer dashboard."
            f"Regards,The StudentHunter Team"
        )
        
        send_mail(
            subject,
            message_body,
            settings.DEFAULT_FROM_EMAIL,
            [employer.email],
            fail_silently=False
        )
        print(f"Task send_new_application_email_task: Email sent to {employer.email} for application ID {application_id}")

    except Application.DoesNotExist:
        print(f"Task send_new_application_email_task: Application with ID {application_id} does not exist. Task will not be retried.")
        # No retry for DoesNotExist, as the object is gone.
    except Exception as exc:
        print(f"Task send_new_application_email_task: Error sending email for application ID {application_id}: {exc}")
        # Celery will retry based on shared_task decorator settings (max_retries, default_retry_delay)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60) # Added bind, retries and delay
def send_interview_scheduled_email_task(self, application_id):
    """
    Sends an email to the student when an interview is scheduled for their application.
    """
    try:
        application = Application.objects.select_related('student', 'job').get(id=application_id)
        student = application.student
        job = application.job

        if not student or not hasattr(student, 'email') or not student.email:
            print(f"Task send_interview_scheduled_email_task: Student or student email not found for application ID {application.id}")
            return # Or raise an error to retry

        # Assuming application model has an 'interview_date' field.
        # Add other relevant fields like 'interview_location', 'interview_notes' if they exist.
        interview_date_str = "Not yet specified"
        if hasattr(application, 'interview_date') and application.interview_date:
            try:
                interview_date_str = application.interview_date.strftime('%B %d, %Y at %I:%M %p %Z')
            except AttributeError: # Handle if interview_date is not a datetime object
                 interview_date_str = str(application.interview_date)


        student_name = getattr(student, 'get_full_name', lambda: student.email)() or student.email

        subject = f'Interview Scheduled: Your Application for "{job.title}"'
        message_body = (
            f"Dear {student_name},"
            f"Great news! An interview has been scheduled for your application to the job: {job.title}."
            f"Job Title: {job.title}"
            f"Application ID: {application.id}"
            f"Interview Date: {interview_date_str}"

            f"Please log in to your StudentHunter account for any further details or updates from the employer."
            f"Best of luck with your interview!"
            f"Regards,The StudentHunter Team"
        )

        send_mail(
            subject,
            message_body,
            settings.DEFAULT_FROM_EMAIL,
            [student.email],
            fail_silently=False
        )
        print(f"Task send_interview_scheduled_email_task: Email sent to {student.email} for application ID {application_id}")

    except Application.DoesNotExist:
        print(f"Task send_interview_scheduled_email_task: Application with ID {application_id} does not exist. Task will not be retried.")
    except Exception as exc:
        print(f"Task send_interview_scheduled_email_task: Error sending email for application ID {application_id}: {exc}")
        raise self.retry(exc=exc) 