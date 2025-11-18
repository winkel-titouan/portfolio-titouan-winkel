import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    console.log('[v0] API Contact called');
    console.log('[v0] RESEND_API_KEY exists:', !!import.meta.env.RESEND_API_KEY);

    try {
        const data = await request.json();
        const { prenom, nom, email, sujet, message } = data;

        console.log('[v0] Form data received:', { prenom, nom, email, sujet });

        // Validation
        if (!prenom || !nom || !email || !sujet || !message) {
            console.log('[v0] Validation failed - missing fields');
            return new Response(
                JSON.stringify({ error: 'Tous les champs sont requis' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!import.meta.env.RESEND_API_KEY) {
            console.error('[v0] RESEND_API_KEY is not defined');
            return new Response(
                JSON.stringify({ error: 'Configuration serveur manquante' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Resend
        const resend = new Resend(import.meta.env.RESEND_API_KEY);

        console.log('[v0] Attempting to send email...');

        // Send email
        const result = await resend.emails.send({
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

        console.log('[v0] Email sent successfully:', result);

        return new Response(
            JSON.stringify({ success: true, message: 'Email envoyé avec succès' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('[v0] Erreur lors de l\'envoi de l\'email:', error);
        return new Response(
            JSON.stringify({
                error: 'Erreur lors de l\'envoi de l\'email',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
