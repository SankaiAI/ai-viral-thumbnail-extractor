
import { sql } from '@vercel/postgres';

export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { userId } = await request.json();

        if (!userId) {
            return new Response('Missing userId', { status: 400 });
        }

        // Check credits
        const { rows } = await sql`SELECT credits FROM profiles WHERE user_id = ${userId}`;
        const user = rows[0];

        if (!user || user.credits <= 0) {
            return new Response(JSON.stringify({ success: false, message: 'Insufficient credits' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Deduct credit
        await sql`UPDATE profiles SET credits = credits - 1 WHERE user_id = ${userId}`;

        return new Response(JSON.stringify({ success: true }), {
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
