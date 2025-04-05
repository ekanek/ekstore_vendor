class Date
  def beginning_of_ist_day_in_utc
    self.in_time_zone('New Delhi').beginning_of_day.in_time_zone('UTC')
  end

  def end_of_ist_day_in_utc
    self.in_time_zone('New Delhi').end_of_day.in_time_zone('UTC')
  end

  def today_in_ist
    DateTime.now.in_time_zone('New Delhi').end_of_day.to_date
  end
end
