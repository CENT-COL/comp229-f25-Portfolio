import otplib from 'otplib';
import qrcode from 'qrcode';

import UserModel from '../models/user.js';
import generateToken from '../utils/jwt.js';

// Create CRUD operations for User

// Get All Users = Same as db.users.find()
export const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message }); // 500 HTTP status code for server error
    }
}

// Read a user by ID = Same as db.users.findOne({_id: ObjectId("id")})
export const getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // 404 HTTP status code for not found
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message }); // 500 HTTP status code for server error
    }
}

// Create a new user = Same as db.users.insertOne()
export const createUser = async (req, res) => {
    try {
        const newUser = new UserModel(req.body);
        const savedUser = await newUser.save();

        const token = generateToken(savedUser);


        res.status(201).json({message: "User registered successfuly", user:savedUser, token}); // 201 HTTP status code for created
    } catch (error) {
        res.status(500).json({ message: error.message }); // 500 HTTP status code for server error
    }
}

// Update a user by ID = Same as db.users.updateOne({_id: ObjectId("id")}, {$set: {...}})
export const updateUser = async (req, res) => {
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id,req.body, {
            new: true
        });

        if (!updatedUser){
            return res.status(404).json({ message: 'User not found' }); // 404 HTTP status code for not found
        }

        res.status(200).json(updatedUser);
    } catch (error) {
       res.status(500).json({ message: error.message }); // 500 HTTP status code for server error
    }
}

// Delete a user by ID = Same as db.users.deleteOne({_id: ObjectId("id")})
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);

        if (!deletedUser){
            return res.status(404).json({ message: 'User not found' }); // 404 HTTP status code for not found
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message }); // 500 HTTP status code for server error
    }
}

// Login user
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body; // descructuring from body
        const user = await UserModel.findOne({email})

        if (!user){
            return res.status(404).json({ message: 'User not found' }); // 404 HTTP status code for not found
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid){
            return res.status(401).json({ message: 'Invalid password' }); // 401 HTTP status code for unauthorized
        }

        if (user.is2FAEnabled) {
            return res.status(200).json({ message: '2FA required', is2FAEnabled: true, email: user.email });
        }

        const token = generateToken(user)

        return res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(500).json({ message: error.message }); // 500 HTTP status code for server error
    }
}

// Generate and return a QR code for 2FA setup
export const setup2FA = async (req, res) => {
    const { email } = req.body;

    // Generate a unique secret for the user
    const secret = otplib.authenticator.generateSecret();

    // Genreate the QR code URL
    const otpauth = otplib.authenticator.keyuri(email, 'COMP229-F25-Portfolio-401', secret);

    // Generate the QR Code image
    try{
        const imageUrl = await qrcode.toDataURL(otpauth);

        // // Store the secret in the user's profile
        const user = await UserModel.findOneAndUpdate({email}, { otpSecret: secret });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: '2FA setup successful', imageUrl });
    } catch (error) {
        return res.status(500).json({ message: 'Error generating QR code', error: error.message });
    }
}

// Endpoint to verify the OTP during 2FA setup
export const verify2FASetup = async (req, res) => {
    const {email, token } = req.body; // token here is the same as the one time password generate by the authenticator app

    // Fetch user's secret from the database
    const user = await UserModel.findOne({email});

    if( !user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const secret = user.otpSecret;

    if (!secret) {
        return res.status(400).json({ message: '2FA not set up for this user' });
    }

    // Verify the provided token
    const isValid = otplib.authenticator.check(token, secret);

    if(isValid) {
        // Mark the user as having 2FA enabled
        user.is2FAEnabled = true;
        await user.save();

        return res.status(200).json({ message: '2FA verification successful' });
    } else {
        return res.status(400).json({ message: 'Invalid token' });
    }

}

// Endpoint to verify 2FA during login
export const verifyOTP = async (req, res) => {
    const { email, token } = req.body;

    // Fetch user's secret from the database
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const secret = user.otpSecret;

    if (!secret) {
        return res.status(400).json({ message: '2FA is not setup for this user' });
    }

    const isValid = otplib.authenticator.check(token, secret);

    if (isValid) {
        const token = generateToken(user)

        res.status(200).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: token,
        });
    } else {
        res.status(400).send('OTP is invalid');
    }
}