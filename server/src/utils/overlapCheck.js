
function hasOverlap(newCheckIn, newCheckOut, existingBookings) {
    const newStart = new Date(newCheckIn);
    const newEnd = new Date(newCheckOut);

    for (const booking of existingBookings) {
        const existingStart = new Date(booking.checkInDate);
        const existingEnd = new Date(booking.checkOutDate);

        
        if (newStart < existingEnd && newEnd > existingStart) {
            return true;
        }
    }

    return false;
}


function validateBookingDates(checkIn, checkOut) {
    const errors = [];
    const now = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    
    if (isNaN(checkInDate.getTime())) {
        errors.push('Invalid check-in date');
    }

    if (isNaN(checkOutDate.getTime())) {
        errors.push('Invalid check-out date');
    }

    
    if (checkInDate < now) {
        errors.push('Check-in date cannot be in the past');
    }

    
    if (checkOutDate <= checkInDate) {
        errors.push('Check-out date must be after check-in date');
    }

    
    const hoursDiff = (checkOutDate - checkInDate) / (1000 * 60 * 60);
    if (hoursDiff < 1) {
        errors.push('Minimum booking duration is 1 hour');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

module.exports = {
    hasOverlap,
    validateBookingDates,
};
