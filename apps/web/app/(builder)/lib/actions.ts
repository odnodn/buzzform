import { createClient } from "@/lib/supabase/client"

export async function joinWaitlist(email: string) {
    if (!email || !email.includes('@')) {
        return { error: 'Invalid email address' }
    }

    const supabase = createClient()

    try {
        const { error } = await supabase
            .from('waitlist')
            .insert({ email })

        if (error) {
            // If it's a unique constraint violation (code 23505), we can treat it as success
            if (error.code === '23505') {
                return { success: true, message: "You're already on the list!" }
            }
            console.error('Supabase error:', error)
            return { error: 'Failed to join waitlist. Please try again.' }
        }

        return { success: true }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { error: 'Something went wrong. Please try again.' }
    }
}
