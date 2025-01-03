import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { animeId, episode } = req.query;

  if (!animeId || !episode) {
    return res.status(400).json({ error: 'Anime ID et épisode sont requis.' });
  }

  try {
    const response = await axios.get(`https://api.amvstr.me/api/v2/stream/${animeId}/${episode}`, {
      responseType: 'json',
    });

    // Ajouter les en-têtes CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://zenanime-topaz.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Gérer les requêtes préliminaires OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Transférer la réponse de l'API externe
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de streaming:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
} 