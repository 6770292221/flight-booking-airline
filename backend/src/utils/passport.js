import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AccountMongooseModel } from "../models/account_models.js";

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://flight-booking-airline.onrender.com/api/v1/user-core-api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const displayName = profile.displayName || "Google User";

            if (!email) return done(new Error("No email found in Google profile"));

            // หา user จากระบบ
            let user = await AccountMongooseModel.findOne({ email });

            if (!user) {
                const [firstName, ...rest] = displayName.split(" ");
                const lastName = rest.join(" ") || "-";

                // สร้าง user ใหม่
                user = await AccountMongooseModel.create({
                    firstName,
                    lastName,
                    email,
                    password: "",      // เพราะใช้ Google Login
                    phoneNumber: "",   // ไม่มีจาก Google ก็ใส่ค่าว่าง
                    isAdmin: false,
                    verified: true,    // ถือว่า verified แล้ว
                });

                console.log(`User created from Google login: ${email}`);
            } else {
                console.log(`Existing Google user: ${email}`);
            }

            return done(null, user);
        } catch (err) {
            console.error("Error in Google", err);
            return done(err, null);
        }
    }
));
