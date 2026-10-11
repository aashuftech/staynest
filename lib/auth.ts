import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { connectDB } from "./mongodb";
import { User } from "./models/User";
import { nextUserPublicId } from "./user-public-id";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

const createToken = () => randomBytes(32).toString("hex");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          await connectDB();
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          });
          if (!user || !user.password || user.isBanned) return null;
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (!isValid) return null;
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  // NextAuth encrypts this JWT and stores it in the HTTP-only cookie below.
  // Tokens are deliberately never exposed through the client session object.
  session: {
    strategy: "jwt",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    updateAge: ACCESS_TOKEN_MAX_AGE,
  },
  jwt: { maxAge: REFRESH_TOKEN_MAX_AGE },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as typeof token & {
        accessToken?: string;
        accessTokenExpires?: number;
        refreshToken?: string;
        refreshTokenExpires?: number;
        isBanned?: boolean;
      };

      if (user) {
        token.id = user.id;
        // OAuth profiles do not carry the application's role. Read it from our
        // database so Google users receive the same permissions as credentials users.
        let role = (user as any).role as "USER" | "ADMIN" | undefined;
        if (!role && user.email) {
          try {
            await connectDB();
            const databaseUser = await User.findOne({
              email: user.email.toLowerCase(),
            })
              .select("role")
              .lean();
            role = databaseUser?.role;
          } catch (error) {
            console.error("Unable to read Google user role:", error);
          }
        }
        token.role = role || "USER";
        authToken.accessToken = createToken();
        authToken.accessTokenExpires = Date.now() + ACCESS_TOKEN_MAX_AGE * 1000;
        authToken.refreshToken = createToken();
        authToken.refreshTokenExpires =
          Date.now() + REFRESH_TOKEN_MAX_AGE * 1000;
      } else if (token.id) {
        // Re-check active accounts so a ban also invalidates a previously issued session.
        try {
          await connectDB();
          const currentUser = await User.findById(token.id)
            .select("isBanned")
            .lean();
          if (currentUser?.isBanned) {
            authToken.isBanned = true;
            delete (token as any).id;
            delete (token as any).role;
            return token;
          }
        } catch (error) {
          console.error("Unable to verify account status:", error);
        }
      }

      if (
        authToken.refreshToken &&
        authToken.refreshTokenExpires &&
        authToken.refreshTokenExpires > Date.now() &&
        (!authToken.accessTokenExpires ||
          authToken.accessTokenExpires <= Date.now())
      ) {
        // Rotate the access token while the encrypted refresh token is valid.
        authToken.accessToken = createToken();
        authToken.accessTokenExpires = Date.now() + ACCESS_TOKEN_MAX_AGE * 1000;
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as any).isBanned) return null as any;
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (existing?.isBanned) return false;
          if (!existing) {
            const publicId = await nextUserPublicId();
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "USER",
              publicId,
            });
          }
        } catch (err) {
          console.error("Google signin error:", err);
        }
      }
      return true;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
