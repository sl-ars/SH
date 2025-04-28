from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDay, TruncMonth

def get_date_range_and_trunc(period_str):
    """
    Calculates a start date, end date (now), and a truncation function 
    based on a period string ('week', 'month', 'year').
    """
    now = timezone.now()
    end_date = now

    if period_str == 'week':
        start_date = now - timedelta(days=6)
        trunc_function = TruncDay
    elif period_str == 'year':
        start_date = now - timedelta(days=364)
        trunc_function = TruncMonth
    else:


        start_date = now - timedelta(days=29) 
        trunc_function = TruncDay
    return start_date.replace(hour=0, minute=0, second=0, microsecond=0), end_date, trunc_function 