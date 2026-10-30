/**
 * Date formatting utilities with proper timezone handling
 * Ensures dates are displayed correctly in Vietnam timezone (Asia/Ho_Chi_Minh)
 */

function parseDateSafely(dateStr: string): Date | null {
  try {
    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
    if (dateOnlyPattern.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    const dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
    if (dateTimePattern.test(dateStr)) {
      const [datePart, timePart] = dateStr.split('T')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hour, minute, second] = timePart.split(':').map(Number)
      return new Date(year, month - 1, day, hour, minute, second)
    }

    return new Date(dateStr)
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

export function formatDate(
  date?: string | Date | null,
  options?: { withTime?: boolean; timezone?: string }
): string {
  if (!date) return '—'

  try {
    let dateObj: Date
    if (typeof date === 'string') {
      const parsed = parseDateSafely(date)
      if (!parsed || Number.isNaN(parsed.getTime())) return '—'
      dateObj = parsed
    } else {
      dateObj = date
      if (Number.isNaN(dateObj.getTime())) return '—'
    }

    const timezone = options?.timezone || 'Asia/Ho_Chi_Minh'
    const withTime = options?.withTime ?? false

    if (!withTime) {
      const year = dateObj.getFullYear()
      const month = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
    }

    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '—'
  }
}

export function formatDateOnly(date?: string | Date | null): string {
  return formatDate(date, { withTime: false })
}

export function formatDateTime(date?: string | Date | null): string {
  return formatDate(date, { withTime: true })
}
