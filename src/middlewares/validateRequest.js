import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error("Validation Error:", JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
