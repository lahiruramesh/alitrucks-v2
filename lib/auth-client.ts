import { createAuthClient } from "better-auth/client"
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [
        adminClient()
    ]
})

// Extended auth client with profile management
export const profileClient = {
    ...authClient,
    
    // Update user profile
    updateProfile: async (profileData: {
        name?: string;
        phoneNumber?: string;
        address?: string;
        city?: string;
        country?: string;
        postalCode?: string;
        companyName?: string;
    }) => {
        try {
            const session = await authClient.getSession();
            if (!session.data?.user?.id) {
                throw new Error("No active session");
            }

            const response = await fetch(`/api/users/${session.data.user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update profile");
            }

            return await response.json();
        } catch (error) {
            console.error("Profile update error:", error);
            throw error;
        }
    },

    // Get user profile
    getProfile: async (userId?: string) => {
        try {
            const session = await authClient.getSession();
            const targetUserId = userId || session.data?.user?.id;
            
            if (!targetUserId) {
                throw new Error("No user ID provided");
            }

            const response = await fetch(`/api/users/${targetUserId}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch profile");
            }

            return await response.json();
        } catch (error) {
            console.error("Profile fetch error:", error);
            throw error;
        }
    }
}