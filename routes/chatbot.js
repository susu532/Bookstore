const express = require('express');
const router = express.Router();

// Simple AI-like response for demonstration (replace with real AI integration if needed)
router.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: "Je n'ai pas compris votre question." });
  }
  const msg = message.toLowerCase();
  let reply = "Je suis un assistant virtuel. Posez-moi vos questions sur la bibliothèque !";
  if (/livre|book/.test(msg)) {
    if (/nouveau|recent|ajout/i.test(msg)) reply = "Voici la liste des derniers livres ajoutés : consultez la section 'Nouveautés' sur la page d'accueil.";
    else if (/disponible|stock|reste/i.test(msg)) reply = "Pour vérifier la disponibilité d'un livre, utilisez la recherche ou consultez la fiche du livre.";
    else if (/auteur|author/i.test(msg)) reply = "Vous pouvez filtrer les livres par auteur dans la section 'Livres'.";
    else reply = "Vous pouvez rechercher, filtrer et consulter les livres dans la section 'Livres'.";
  } else if (/emprunt|borrow/.test(msg)) {
    if (/prolonger|extend/i.test(msg)) reply = "Pour prolonger un emprunt, rendez-vous dans la section 'Emprunts' et cliquez sur 'Prolonger'.";
    else reply = "Pour emprunter un livre, ajoutez-le à votre panier puis validez la commande.";
  } else if (/commande|order/.test(msg)) {
    if (/statut|status/i.test(msg)) reply = "Vous pouvez suivre le statut de vos commandes dans la section 'Commandes'.";
    else if (/annuler|cancel/i.test(msg)) reply = "Pour annuler une commande, contactez le support ou utilisez la section 'Commandes' si l'option est disponible.";
    else reply = "Consultez vos commandes dans la section 'Commandes'.";
  } else if (/promo|réduction|discount/.test(msg)) {
    reply = "Les promotions en cours sont affichées sur la page d'accueil. N'hésitez pas à consulter la bannière promo !";
  } else if (/contact|aide|help|support/.test(msg)) {
    reply = "Contactez-nous via le formulaire de contact ou posez votre question ici. Nous sommes là pour vous aider !";
  } else if (/horaire|ouverture|fermeture|hours|open|close/.test(msg)) {
    reply = "La bibliothèque en ligne est accessible 24h/24, 7j/7 !";
  } else if (/avis|review|note|commentaire/.test(msg)) {
    reply = "Vous pouvez laisser un avis ou une note sur la fiche de chaque livre après l'avoir lu.";
  } else if (/paiement|payment|payer/.test(msg)) {
    reply = "Les paiements sont sécurisés. Vous pouvez payer par carte, PayPal ou à la livraison.";
  } else if (/inscription|register|compte|account/.test(msg)) {
    reply = "Pour créer un compte, cliquez sur 'S'inscrire' en haut à droite de la page d'accueil.";
  } else if (/merci|thanks|thank you/.test(msg)) {
    reply = "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.";
  }
  res.json({ reply });
});

module.exports = router;
