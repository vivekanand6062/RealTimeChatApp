import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { disconnectUserSockets, io } from "../socket/socket.js";

export const register = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        if (!fullName || !username || !password || !confirmPassword || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exit try different" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        // profilePhoto
        const maleProfilePhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        const femaleProfilePhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const defaultPhoto = gender === "male" ? maleProfilePhoto : femaleProfilePhoto;
        await User.create({
            fullName,
            username,
            password: hashedPassword,
            profilePhoto: defaultPhoto,
            avatar: defaultPhoto,
            gender
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const tokenData = {
            userId: user._id
        };

        const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL;
        return res.status(200).cookie("token", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false
        }).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            avatar: user.avatar || user.profilePhoto,
            gender: user.gender
        });

    } catch (error) {
        console.log(error);
    }
}
export const logout = (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL;
        return res.status(200).cookie("token", "", {
            maxAge: 0,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false
        }).json({
            message: "logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}
export const getOtherUsers = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        return res.status(200).json(otherUsers);
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const { fullName, profilePhoto, avatar } = req.body;

        const user = await User.findById(loggedInUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        const newPhoto = avatar || profilePhoto;
        if (newPhoto !== undefined) {
            user.profilePhoto = newPhoto;
            user.avatar = newPhoto;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                profilePhoto: user.profilePhoto,
                avatar: user.avatar || user.profilePhoto,
                gender: user.gender
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
}

export const deleteAccount = async (req, res) => {
    let session = null;
    let useTransaction = false;

    try {
        const loggedInUserId = req.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required to delete your account.",
                success: false
            });
        }

        // 1. Verify user exists
        const user = await User.findById(loggedInUserId);
        if (!user) {
            return res.status(404).json({
                message: "User account not found.",
                success: false
            });
        }

        // 2. Verify password with bcrypt
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect password. Your account has not been deleted.",
                success: false
            });
        }

        // 3. Start transaction if supported by MongoDB deployment
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            useTransaction = true;
        } catch (sessionErr) {
            session = null;
            useTransaction = false;
        }

        const queryOptions = useTransaction && session ? { session } : {};

        // 4. Delete user record (preserving shared conversation logs for other users)
        await User.findByIdAndDelete(loggedInUserId, queryOptions);

        if (useTransaction && session) {
            await session.commitTransaction();
        }

        // 5. Disconnect user sockets forcefully & update presence
        disconnectUserSockets(loggedInUserId);

        // 6. Notify connected clients in real time that this user account was deleted
        io.emit("userDeleted", loggedInUserId);

        // 7. Clear authentication cookie
        const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL;
        return res.status(200).cookie("token", "", {
            maxAge: 0,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false
        }).json({
            message: "Your account has been permanently deleted.",
            success: true
        });

    } catch (error) {
        if (useTransaction && session) {
            try {
                await session.abortTransaction();
            } catch (abortErr) {
                console.error("Transaction abort error:", abortErr);
            }
        }
        console.error("Account deletion error:", error.message || error);
        return res.status(500).json({
            message: "Unable to delete your account right now. Please try again later.",
            success: false
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};