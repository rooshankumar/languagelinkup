import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dx6ulcmub/image/upload/v1622721661/default-profile_f5olon.png", // Default avatar
    },
    bio: {
      type: String,
      default: "",
    },
    nativeLanguages: {
      type: [String],
      required: [true, "At least one native language is required"],
    },
    learningLanguages: {
      type: [String],
      required: [true, "At least one learning language is required"],
    },
    proficiency: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    streak: {
      count: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    points: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    onlineStatus: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// **Middleware to Hash Passwords**
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// **Method to Compare Passwords**
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// **Middleware to Update Last Active Time**
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastActive: new Date() });
  next();
});

// **Method to Update Profile Picture**
userSchema.methods.updateProfilePicture = async function (newImageUrl) {
  this.profilePicture = newImageUrl;
  await this.save();
};

// **Create User Model**
const User = mongoose.model("User", userSchema);
export default User;
