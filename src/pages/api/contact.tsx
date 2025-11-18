import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { prenom, nom, email, sujet, message } = data;

        // Validation
        if (!prenom || !nom || !email || !sujet || !message) {
            return new Response(
                JSON.stringify({ error: 'Tous les champs sont requis' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Resend
        const resend = new Resend(import.meta.env.RESEND_API_KEY);

        // Send email
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'titouan.winkel@edu.univ-fcomte.fr',
            reply_to: email,
            subject: `[Portfolio Contact] ${sujet}`,
            html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>De:</strong> ${prenom} ${nom} (${email})</p>
        <p><strong>Sujet:</strong> ${sujet}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
        });

        return new Response(
            JSON.stringify({ success: true, message: 'Email envoyé avec succès' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return new Response(
            JSON.stringify({ error: 'Erreur lors de l\'envoi de l\'email' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
