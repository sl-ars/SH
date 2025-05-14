from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class Campus(models.Model):
    name = models.CharField(_("Campus Name"), max_length=255)
    address = models.TextField(_("Address"))
    contact_email = models.EmailField(_("Contact Email"))
    contact_phone = models.CharField(_("Contact Phone"), max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="administered_campus"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _("Campus")
        verbose_name_plural = _("Campuses")
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

class CampusStudent(models.Model):
    STUDENT_STATUS = (
        ('active', _('Active')),
        ('graduated', _('Graduated')),
        ('suspended', _('Suspended')),
        ('withdrawn', _('Withdrawn')),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campus_students"
    )
    campus = models.ForeignKey(
        Campus,
        on_delete=models.CASCADE,
        related_name="students"
    )
    student_id = models.CharField(_("Student ID"), max_length=50, unique=True)
    enrollment_date = models.DateField(_("Enrollment Date"))
    status = models.CharField(
        _("Status"),
        max_length=20,
        choices=STUDENT_STATUS,
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Campus Student")
        verbose_name_plural = _("Campus Students")
        unique_together = ('campus', 'student_id')
        ordering = ['-enrollment_date']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"
