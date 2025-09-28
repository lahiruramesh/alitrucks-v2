import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/prisma/generated/prisma";
import { admin } from "better-auth/plugins"

const prisma = new PrismaClient();
export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        admin() 
    ],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
            },
            userType: {
                type: "string", 
                required: false,
            },
            companyName: {
                type: "string",
                required: false,
            },
            phoneNumber: {
                type: "string",
                required: false,
            },
            address: {
                type: "string",
                required: false,
            },
            city: {
                type: "string",
                required: false,
            },
            country: {
                type: "string",
                required: false,
            },
            postalCode: {
                type: "string",
                required: false,
            },
        }
    }
});