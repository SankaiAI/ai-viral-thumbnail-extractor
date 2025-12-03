
import { sql } from '@vercel/postgres';

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { userId, email, referralCode } = await request.json();

        if (!userId) {
            return new Response('Missing userId', { status: 400 });
        }

        // Check if user exists
        const { rows } = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
        let profile = rows[0];

        if (!profile) {
            // Create new user
            const newReferralCode = Math.random().toString(36).substring(2, 10);

            // Handle referral (if signed up with code)
            let referredBy = null;
            if (referralCode) {
                const { rows: referrerRows } = await sql`SELECT user_id FROM profiles WHERE referral_code = ${referralCode}`;
                if (referrerRows.length > 0) {
                    referredBy = referrerRows[0].user_id;
                    // Reward referrer
                    await sql`UPDATE profiles SET credits = credits + 10 WHERE user_id = ${referredBy}`;
                }
            }

            await sql`
        INSERT INTO profiles (user_id, email, credits, referral_code, referred_by)
        VALUES (${userId}, ${email}, 20, ${newReferralCode}, ${referredBy})
      `;

            const { rows: newRows } = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
            profile = newRows[0];
        }

        return new Response(JSON.stringify({ profile }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
