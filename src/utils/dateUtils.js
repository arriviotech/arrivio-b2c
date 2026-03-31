/**
 * Calculates the duration between two dates in months and days.
 * 
 * @param {string|Date} startDate 
 * @param {string|Date} endDate 
 * @returns {string} Formatted duration string (e.g., "1 month & 2 days")
 */
export const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) return "";

    // Ensure start is before end
    if (start > end) return "Invalid dates";

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += end.getMonth();

    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        // Get the number of days in the previous month of the end date
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
    }

    const parts = [];
    if (months >= 12) {
        const years = Math.floor(months / 12);
        const remMonths = months % 12;
        parts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (remMonths > 0) parts.push(`${remMonths} month${remMonths > 1 ? 's' : ''}`);
    } else if (months > 0) {
        parts.push(`${months} month${months > 1 ? 's' : ''}`);
    }
    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }

    return parts.join(' & ') || "0 days";
};
