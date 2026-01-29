const Joi = require('joi');


function validate(schema, property = 'body') {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            return res.status(400).json({
                message: 'Validation error',
                errors,
            });
        }

        
        req[property] = value;
        next();
    };
}


function sanitizeInput(req, res, next) {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                
                if (key.startsWith('$')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            }
        }
        return obj;
    };

    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);

    next();
}


const schemas = {
    signup: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(12).required(),
        fullName: Joi.string().min(2).max(100).required(),
        phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),

    verifyMfa: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required(),
    }),

    updateProfile: Joi.object({
        fullName: Joi.string().min(2).max(100).optional(),
        phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(null, ''),
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(12).required(),
    }),

    createHotel: Joi.object({
        name: Joi.string().min(2).max(200).required(),
        description: Joi.string().min(10).max(2000).required(),
        address: Joi.string().min(5).max(300).required(),
        city: Joi.string().min(2).max(100).required(),
        country: Joi.string().min(2).max(100).required(),
        rating: Joi.number().min(0).max(5).optional(),
        amenities: Joi.array().items(Joi.string()).optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
    }),

    createRoom: Joi.object({
        hotel: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        roomNumber: Joi.string().min(1).max(20).required(),
        type: Joi.string().valid('Single', 'Double', 'Suite', 'Deluxe', 'Presidential').required(),
        description: Joi.string().min(10).max(1000).required(),
        pricePerNight: Joi.number().min(0).required(),
        capacity: Joi.number().min(1).max(10).required(),
        amenities: Joi.array().items(Joi.string()).optional(),
        images: Joi.array().items(Joi.string().uri()).optional(),
    }),

    createBooking: Joi.object({
        room: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        checkInDate: Joi.date().iso().required(),
        checkOutDate: Joi.date().iso().greater(Joi.ref('checkInDate')).required(),
        guestCount: Joi.number().min(1).required(),
        specialRequests: Joi.string().max(500).optional().allow(''),
    }),

    createPayment: Joi.object({
        booking: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer').required(),
    }),
};

module.exports = {
    validate,
    sanitizeInput,
    schemas,
};
