import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const OTP_TTL_MS = 5 * 60 * 1000;

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ user_id: userId }, secret, { expiresIn: "7d" });
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_TTL_MS);

    const user = await User.findOneAndUpdate(
      { phone },
      { otp, otp_expires: otpExpires },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    console.log(`Mock OTP for ${phone}: ${otp}`);

    const response = {
      success: true,
      message: "OTP sent",
      is_new_user: !user.name,
    };

    if (process.env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return res.json(response);
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "phone and otp are required" });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.otp || !user.otp_expires) {
      return res.status(400).json({ error: "OTP not requested" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date(user.otp_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (name && !user.name) {
      user.name = name;
    }

    if (!user.name) {
      return res.status(400).json({ error: "Name is required for new users" });
    }

    user.otp = null;
    user.otp_expires = null;
    await user.save();

    const token = signToken(user._id.toString());

    return res.json({
      success: true,
      token,
      user: {
        user_id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        alt_phone: user.alt_phone ?? null,
        avatar: user.avatar ?? null,
        warehouse_id: user.warehouse_id,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        user_id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        alt_phone: user.alt_phone ?? null,
        avatar: user.avatar ?? null,
        warehouse_id: user.warehouse_id,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, alt_phone, avatar } = req.body;
    const user = await User.findById(req.user.user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name !== undefined) {
      if (!name.trim())
        return res.status(400).json({ error: "Name cannot be empty" });
      user.name = name.trim();
    }
    if (alt_phone !== undefined) user.alt_phone = alt_phone || null;
    if (avatar !== undefined) user.avatar = avatar || null;

    await user.save();

    return res.json({
      success: true,
      user: {
        user_id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        alt_phone: user.alt_phone ?? null,
        avatar: user.avatar ?? null,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};
