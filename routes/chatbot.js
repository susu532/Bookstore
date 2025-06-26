const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Emprunt = require('../models/Emprunt');

// Simple AI-like response for demonstration (replace with real AI integration if needed)
router.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: "Je n'ai pas compris votre question." });
  }
  const msg = message.toLowerCase();
  let reply = "Je suis un assistant virtuel. Posez-moi vos questions sur la bibliothèque !";
  if (!req.session) req.session = {};
  let { lastIntent, lastEntity, lastBotReply, userName, unknownCount } = req.session;

  // --- ADVANCED: Remember user's name if given ---
  const nameMatch = msg.match(/je m'appelle ([a-zA-ZÀ-ÿ\- ]+)/i) || msg.match(/my name is ([a-zA-ZÀ-ÿ\- ]+)/i);
  if (nameMatch) {
    req.session.userName = nameMatch[1].trim();
    reply = `Enchanté, ${req.session.userName} ! Comment puis-je vous aider ?`;
    req.session.lastIntent = 'greeting_named';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Detect repeated questions or confusion ---
  if (req.session.lastUserMsg && req.session.lastUserMsg === msg) {
    reply = "Je vois que vous avez posé la même question. Peut-être puis-je vous aider autrement ou reformuler ma réponse ?";
    req.session.lastIntent = 'repeat';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- MULTI-TURN LOGIC: Handle follow-up entity replies first ---
  if (lastIntent === 'borrow_book_pending' && msg.length < 40 && /[a-zA-Z0-9]/.test(msg)) {
    // Did you mean suggestion for typos (simple example)
    if (msg.length <= 3) {
      reply = "Pouvez-vous préciser le titre du livre ?";
      req.session.lastIntent = 'borrow_book_pending';
    } else {
      reply = `Pour emprunter ${message}, ajoutez-le à votre panier puis validez la commande.`;
      req.session.lastIntent = 'borrow_book';
      req.session.lastEntity = message;
    }
  } else if (lastIntent === 'review_info' && msg.length < 40 && /[a-zA-Z0-9]/.test(msg)) {
    reply = `Pour laisser un avis sur ${message}, rendez-vous sur sa fiche et cliquez sur 'Laisser un avis'.`;
    req.session.lastIntent = 'review_book';
    req.session.lastEntity = message;
  } else if (lastIntent === 'buy_book_pending' && msg.length < 40 && /[a-zA-Z0-9]/.test(msg)) {
    reply = `Pour acheter ${message}, ajoutez-le à votre panier puis procédez au paiement.`;
    req.session.lastIntent = 'buy_book';
    req.session.lastEntity = message;
  } else if (lastIntent === 'read_book_pending' && msg.length < 40 && /[a-zA-Z0-9]/.test(msg)) {
    reply = `Pour lire ${message}, consultez sa fiche et cherchez un extrait ou une version numérique si disponible.`;
    req.session.lastIntent = 'read_book';
    req.session.lastEntity = message;
  } else {
    // --- INTENT DETECTION ---
    if (/livre|book/.test(msg)) {
      if (/nouveau|recent|ajout/i.test(msg)) {
        reply = "Voici la liste des derniers livres ajoutés : consultez la section 'Nouveautés' sur la page d'accueil.";
        req.session.lastIntent = 'ask_new_books';
      } else if (/disponible|stock|reste/i.test(msg)) {
        reply = "Pour vérifier la disponibilité d'un livre, utilisez la recherche ou consultez la fiche du livre.";
        req.session.lastIntent = 'ask_availability';
      } else if (/auteur|author/i.test(msg)) {
        reply = "Vous pouvez filtrer les livres par auteur dans la section 'Livres'.";
        req.session.lastIntent = 'ask_author';
      } else {
        reply = "Vous pouvez rechercher, filtrer et consulter les livres dans la section 'Livres'.";
        req.session.lastIntent = 'ask_books';
      }
    } else if (/emprunt|borrow/.test(msg)) {
      if (/prolonger|extend/i.test(msg)) {
        reply = "Pour prolonger un emprunt, rendez-vous dans la section 'Emprunts' et cliquez sur 'Prolonger'.";
        req.session.lastIntent = 'extend_borrow';
      } else {
        const bookMatch = msg.match(/emprunter (.+)/);
        if (bookMatch) {
          reply = `Pour emprunter ${bookMatch[1]}, ajoutez-le à votre panier puis validez la commande.`;
          req.session.lastIntent = 'borrow_book';
          req.session.lastEntity = bookMatch[1];
        } else {
          reply = "Quel livre souhaitez-vous emprunter ?";
          req.session.lastIntent = 'borrow_book_pending';
        }
      }
    } else if (/commande|order/.test(msg)) {
      if (/statut|status/i.test(msg)) {
        reply = "Vous pouvez suivre le statut de vos commandes dans la section 'Commandes'.";
        req.session.lastIntent = 'order_status';
      } else if (/annuler|cancel/i.test(msg)) {
        reply = "Pour annuler une commande, contactez le support ou utilisez la section 'Commandes' si l'option est disponible.";
        req.session.lastIntent = 'order_cancel';
      } else {
        reply = "Consultez vos commandes dans la section 'Commandes'.";
        req.session.lastIntent = 'order_info';
      }
    } else if (/promo|réduction|discount/.test(msg)) {
      reply = "Les promotions en cours sont affichées sur la page d'accueil. N'hésitez pas à consulter la bannière promo !";
      req.session.lastIntent = 'promo_info';
    } else if (/contact|aide|help|support/.test(msg)) {
      reply = "Contactez-nous via le formulaire de contact ou posez votre question ici. Nous sommes là pour vous aider ! Voici quelques exemples :\n- Emprunter un livre\n- Voir mes commandes\n- Laisser un avis\n- Modifier mon compte";
      req.session.lastIntent = 'contact';
    } else if (/horaire|ouverture|fermeture|hours|open|close/.test(msg)) {
      reply = "La bibliothèque en ligne est accessible 24h/24, 7j/7 !";
      req.session.lastIntent = 'hours';
    } else if (/avis|review|note|commentaire/.test(msg)) {
      reply = "Vous pouvez laisser un avis ou une note sur la fiche de chaque livre après l'avoir lu.";
      req.session.lastIntent = 'review_info';
    } else if (/paiement|payment|payer/.test(msg)) {
      reply = "Les paiements sont sécurisés. Vous pouvez payer par carte, PayPal ou à la livraison.";
      req.session.lastIntent = 'payment_info';
    } else if (/inscription|register|compte|account/.test(msg)) {
      reply = "Pour créer un compte, cliquez sur 'S'inscrire' en haut à droite de la page d'accueil.";
      req.session.lastIntent = 'register_info';
    } else if (/merci|thanks|thank you/.test(msg)) {
      reply = "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.";
      req.session.lastIntent = 'thanks';
    } else if (/qui (est|sont) (le|la|les)? ?(auteur|author|écrivain|writer)/.test(msg)) {
      reply = "Pour chaque livre, l'auteur est indiqué sur la fiche du livre. Vous pouvez aussi rechercher par auteur dans la section 'Livres'.";
      req.session.lastIntent = 'author-info';
    } else if (/comment (créer|faire) (un )?compte|inscription|register/.test(msg)) {
      reply = "Cliquez sur 'S'inscrire' en haut à droite, puis remplissez le formulaire pour créer votre compte.";
      req.session.lastIntent = 'register';
    } else if (/comment (emprunter|borrow)/.test(msg)) {
      reply = "Pour emprunter un livre, ajoutez-le à votre panier puis validez la commande dans la section 'Panier'.";
      req.session.lastIntent = 'borrow';
    } else if (/comment (laisser|mettre|donner) (un )?(avis|review|note|commentaire)/.test(msg)) {
      reply = "Après avoir lu un livre, rendez-vous sur sa fiche et cliquez sur 'Laisser un avis' ou 'Noter ce livre'.";
      req.session.lastIntent = 'review';
    } else if (/mot de passe oublié|forgot password|reset password/.test(msg)) {
      reply = "Cliquez sur 'Mot de passe oublié' sur la page de connexion pour réinitialiser votre mot de passe.";
      req.session.lastIntent = 'password';
    } else if (/livres? (populaire|populaires|best-seller|meilleur|top)/.test(msg)) {
      reply = "Les livres les plus populaires sont mis en avant sur la page d'accueil et dans la section 'Livres'.";
      req.session.lastIntent = 'popular';
    } else if (/livres? (gratuit|free)/.test(msg)) {
      reply = "Certains livres gratuits sont disponibles dans la section 'Livres'. Utilisez le filtre 'Prix' pour les trouver.";
      req.session.lastIntent = 'free';
    } else if (/où|ou|where/.test(msg) && /trouver|find/.test(msg) && /livre|book/.test(msg)) {
      reply = "Utilisez la barre de recherche en haut de la page ou la section 'Livres' pour trouver un livre spécifique.";
      req.session.lastIntent = 'find-book';
    } else if (/livres? (fantastique|science[- ]?fiction|roman|jeunesse|manga|bd|bande dessinée|poésie|théâtre|biographie|histoire|science|philosophie|art|cuisine|voyage|guide|scolaire|langue|dictionnaire|encyclopédie)/.test(msg)) {
      reply = "Vous pouvez filtrer les livres par genre dans la section 'Livres'.";
      req.session.lastIntent = 'genre';
    } else if (/quels? sont? les? horaires?/.test(msg)) {
      reply = "La bibliothèque en ligne est ouverte 24h/24, 7j/7. Les horaires physiques sont indiqués sur la page de contact.";
      req.session.lastIntent = 'hours';
    } else if (/remboursement|rembourser|refund/.test(msg)) {
      reply = "Pour toute demande de remboursement, contactez le support via le formulaire de contact.";
      req.session.lastIntent = 'refund';
    } else if (/livraison|delivery|expédition|expedier|envoyer/.test(msg)) {
      reply = "La livraison est disponible en France et à l'international. Les délais et frais sont indiqués lors de la commande.";
      req.session.lastIntent = 'delivery';
    } else if (/peux-tu|pouvez-vous|est-ce que tu peux|est-ce que vous pouvez/.test(msg)) {
      reply = "Je peux vous aider à trouver des livres, expliquer les fonctionnalités du site, ou répondre à vos questions sur la bibliothèque.";
      req.session.lastIntent = 'capabilities';
    } else if (/qui es-tu|qui êtes-vous|présente-toi|présentez-vous/.test(msg)) {
      reply = "Je suis le chatbot assistant de Books garden™, là pour vous aider à profiter au mieux de la bibliothèque en ligne !";
      req.session.lastIntent = 'identity';
    } else if (/je veux|i want|j'aimerais|i would like/.test(msg)) {
      if (/emprunter|borrow/.test(msg) && !/livre|book|roman|manga|bd|bande dessinée/.test(msg)) {
        reply = "Quel livre souhaitez-vous emprunter ?";
        req.session.lastIntent = 'borrow_book_pending';
      } else if (/lire|read/.test(msg) && !/livre|book|roman|manga|bd|bande dessinée/.test(msg)) {
        reply = "Quel livre souhaitez-vous lire ?";
        req.session.lastIntent = 'read_book_pending';
      } else if (/acheter|buy/.test(msg) && !/livre|book|roman|manga|bd|bande dessinée/.test(msg)) {
        reply = "Quel livre souhaitez-vous acheter ?";
        req.session.lastIntent = 'buy_book_pending';
      } else {
        reply = "Dites-m'en plus sur ce que vous souhaitez faire !";
        req.session.lastIntent = 'clarify';
      }
    } else if (/bonjour|salut|hello|coucou|bonsoir/.test(msg)) {
      reply = req.session.userName ? `Bonjour ${req.session.userName} ! Comment puis-je vous aider aujourd'hui ?` : "Bonjour ! Comment puis-je vous aider aujourd'hui ?";
      req.session.lastIntent = 'greeting';
    } else if (/je ne sais pas|i don't know|aucune idée|no idea/.test(msg)) {
      reply = "Pas de souci ! Dites-moi ce que vous cherchez ou posez-moi une question.";
      req.session.lastIntent = 'unknown';
    } else if (/pas utile|inutile|nul|bête|stupide|useless|bad bot/.test(msg)) {
      reply = "Je suis désolé si je n'ai pas pu vous aider. Votre retour est important pour m'améliorer ! Si vous souhaitez contacter le support, dites 'contacter support'.";
      req.session.lastIntent = 'feedback';
    } else if (/génial|super|merci beaucoup|top|parfait|awesome|great|amazing|excellent/.test(msg)) {
      reply = "Merci pour votre retour positif ! Je suis ravi d'avoir pu vous aider.";
      req.session.lastIntent = 'positive_feedback';
    } else if (/merci|thanks|thank you|thx|gracias|danke|shukran|شكرا|grazie|arigato|obrigado/.test(msg)) {
      reply = "Avec plaisir ! N'hésitez pas si vous avez d'autres questions.";
      req.session.lastIntent = 'thanks';
    } else {
      // Escalation: if unknown multiple times, offer support
      req.session.unknownCount = (req.session.unknownCount || 0) + 1;
      if (req.session.unknownCount >= 2) {
        reply = "Je ne suis pas sûr de comprendre. Voulez-vous que je vous mette en contact avec le support ?";
        req.session.lastIntent = 'escalate_support';
      } else {
        reply = "Je n'ai pas compris votre question. Pouvez-vous reformuler ou demander autre chose ?";
        req.session.lastIntent = 'unknown';
      }
    }
  }

  // --- FOLLOW-UP LOGIC ---
  if (/oui|yes|d'accord|okay|ok/.test(msg) && lastBotReply && lastIntent === 'escalate_support') {
    reply = "Un membre de notre équipe va vous contacter prochainement. Merci de votre patience !";
    req.session.lastIntent = 'support_contacted';
    req.session.unknownCount = 0;
  } else if (/oui|yes|d'accord|okay|ok/.test(msg) && lastBotReply) {
    reply = "Super ! N'hésitez pas à demander autre chose.";
    req.session.lastIntent = 'followup_positive';
    req.session.unknownCount = 0;
  }

  // --- ADVANCED: Reset/Clear session context ---
  if (/reset|clear|oublie tout|oublie ma session|efface tout|forget everything|clear memory/.test(msg)) {
    req.session.lastIntent = null;
    req.session.lastEntity = null;
    req.session.lastBotReply = null;
    req.session.userName = null;
    req.session.unknownCount = 0;
    req.session.language = null;
    reply = "J'ai effacé la mémoire de cette session. Comment puis-je vous aider maintenant ?";
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Recommendations with real data ---
  if (/recommande|recommander|suggest|conseil|conseiller|recommend|book to read|livre à lire/.test(msg)) {
    try {
      // Try to get a genre from the user's message
      const genreMatch = msg.match(/(science[- ]?fiction|fantastique|fantasy|mystère|mystery|roman|romance|histoire|history|biographie|biography)/i);
      let genre = genreMatch ? genreMatch[1].toLowerCase() : null;
      let query = genre ? { genre: new RegExp(genre, 'i') } : {};
      // Get 1 random book from the genre or any book
      const books = await Book.aggregate([
        { $match: query },
        { $sample: { size: 1 } }
      ]);
      if (books.length > 0) {
        const book = books[0];
        reply = req.session.language === 'en'
          ? `I recommend "${book.title}" by ${book.author}. You can find it in the '${book.genre}' section.`
          : `Je vous recommande "${book.title}" de ${book.author}. Vous le trouverez dans la section '${book.genre}'.`;
      } else {
        reply = req.session.language === 'en'
          ? "I couldn't find a book to recommend right now. Try another genre!"
          : "Je n'ai pas trouvé de livre à recommander pour l'instant. Essayez un autre genre !";
      }
    } catch (e) {
      reply = req.session.language === 'en'
        ? "Sorry, I couldn't fetch a recommendation right now."
        : "Désolé, je n'ai pas pu trouver de recommandation pour le moment.";
    }
    req.session.lastIntent = 'recommendation';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Capabilities list ---
  if (/que peux-tu faire|what can you do|tes capacités|tes fonctions|tes services|tes possibilités|your features|your skills/.test(msg)) {
    reply = req.session.language === 'en'
      ? `I can help you with:
- Finding and filtering books
- Borrowing and ordering books
- Checking your orders and borrows
- Leaving reviews
- Getting recommendations
- Contacting support
- Telling book jokes and facts
- Switching language (French/English)
- And more!`
      : `Je peux vous aider à :
- Trouver et filtrer des livres
- Emprunter et commander des livres
- Consulter vos commandes et emprunts
- Laisser des avis
- Vous recommander des livres
- Contacter le support
- Raconter des blagues ou anecdotes sur les livres
- Changer de langue (français/anglais)
- Et plus encore !`;
    req.session.lastIntent = 'capabilities_list';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Conversation summary ---
  if (/résumé de la conversation|conversation summary|what did we talk about|qu'avons-nous dit|récapitulatif/.test(msg)) {
    const summary = [];
    if (req.session.userName) summary.push(req.session.language === 'en' ? `Your name: ${req.session.userName}` : `Votre nom : ${req.session.userName}`);
    if (req.session.lastIntent) summary.push(req.session.language === 'en' ? `Last intent: ${req.session.lastIntent}` : `Dernière intention : ${req.session.lastIntent}`);
    if (req.session.lastEntity) summary.push(req.session.language === 'en' ? `Last entity: ${req.session.lastEntity}` : `Dernière entité : ${req.session.lastEntity}`);
    reply = summary.length
      ? (req.session.language === 'en' ? `Here's a summary of our conversation so far:
- ` : `Voici un résumé de notre conversation :
- `) + summary.join('\n- ')
      : (req.session.language === 'en' ? "We haven't discussed much yet!" : "Nous n'avons pas encore beaucoup discuté !");
    req.session.lastIntent = 'conversation_summary';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Privacy/data info ---
  if (/données|data|confidentialité|privacy|rgpd|gdpr|comment tu utilises mes données|how do you use my data/.test(msg)) {
    reply = req.session.language === 'en'
      ? "I only use your data to answer your questions during this session. No personal data is stored after you leave or close the chat."
      : "J'utilise uniquement vos données pour répondre à vos questions pendant cette session. Aucune donnée personnelle n'est conservée après la fermeture du chat.";
    req.session.lastIntent = 'privacy_info';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Proactive reminders ---
  if (!req.session.lastReminderTime || Date.now() - req.session.lastReminderTime > 1000 * 60 * 10) {
    // Suggest a feature if not mentioned recently
    if (!['promo_info','review_info','recommendation'].includes(req.session.lastIntent)) {
      reply = req.session.language === 'en'
        ? "Tip: Check out our current promotions, leave a review on a book you've read, or ask for a recommendation!"
        : "Astuce : Découvrez nos promotions en cours, laissez un avis sur un livre lu, ou demandez-moi une recommandation !";
      req.session.lastReminderTime = Date.now();
      req.session.lastIntent = 'reminder';
      req.session.unknownCount = 0;
      req.session.lastUserMsg = msg;
      req.session.lastBotReply = reply;
      return res.json({ reply });
    }
  }

  // --- ADVANCED: Activity summary with real data ---
  if (/résumé de mes emprunts|summary of my borrows|my borrow summary|mes activités|my activity|mes commandes|my orders/.test(msg)) {
    try {
      const userId = req.session.userId || (req.user && req.user._id) || (req.session.user && req.session.user._id);
      if (!userId) throw new Error('Utilisateur non connecté');
      const [user, borrows, orders] = await Promise.all([
        User.findById(userId),
        Emprunt.find({ user: userId }),
        Order.find({ user: userId })
      ]);
      let summary = req.session.language === 'en'
        ? `You have ${borrows.length} active borrows and ${orders.length} orders.\nPoints: ${user.points || 0}, Level: ${user.level || 1}.`
        : `Vous avez ${borrows.length} emprunts actifs et ${orders.length} commandes.\nPoints : ${user.points || 0}, Niveau : ${user.level || 1}.`;
      reply = summary;
    } catch (e) {
      reply = req.session.language === 'en'
        ? "I couldn't retrieve your activity. Please make sure you are logged in."
        : "Je n'ai pas pu récupérer vos activités. Veuillez vous assurer que vous êtes connecté.";
    }
    req.session.lastIntent = 'activity_summary';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Did you mean (book title suggestions) ---
  if (lastIntent === 'borrow_book_pending' && msg.length >= 3 && msg.length < 40 && /[a-zA-Z0-9]/.test(msg)) {
    // Try to find similar book titles
    const books = await Book.find({ title: { $regex: msg, $options: 'i' } }).limit(3);
    if (books.length === 1) {
      reply = req.session.language === 'en'
        ? `To borrow "${books[0].title}", add it to your cart and confirm your order.`
        : `Pour emprunter "${books[0].title}", ajoutez-le à votre panier puis validez la commande.`;
      req.session.lastIntent = 'borrow_book';
      req.session.lastEntity = books[0].title;
    } else if (books.length > 1) {
      reply = req.session.language === 'en'
        ? `Did you mean: ${books.map(b => '"' + b.title + '"').join(', ')}?`
        : `Vouliez-vous dire : ${books.map(b => '"' + b.title + '"').join(', ')} ?`;
      req.session.lastIntent = 'borrow_book_pending';
    } else {
      reply = req.session.language === 'en'
        ? "I couldn't find a book with that title. Can you check the spelling or try another?"
        : "Je n'ai pas trouvé de livre avec ce titre. Pouvez-vous vérifier l'orthographe ou essayer un autre ?";
      req.session.lastIntent = 'borrow_book_pending';
    }
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Real-time book stock check ---
  if (/disponible|stock|reste|en stock|availability|how many|combien/.test(msg) && /livre|book|titre|title/.test(msg)) {
    // Try to extract a book title from the message
    const titleMatch = msg.match(/(?:livre|book|titre|title)[^a-zA-Z0-9]*([a-zA-Z0-9\-\' ]{3,})/i);
    let bookTitle = titleMatch ? titleMatch[1].trim() : null;
    if (bookTitle) {
      const book = await Book.findOne({ title: { $regex: bookTitle, $options: 'i' } });
      if (book) {
        reply = req.session.language === 'en'
          ? `"${book.title}" by ${book.author} has ${book.stock || 0} copies available.`
          : `"${book.title}" de ${book.author} a ${book.stock || 0} exemplaire(s) disponible(s).`;
      } else {
        reply = req.session.language === 'en'
          ? `I couldn't find the book "${bookTitle}" in our catalog.`
          : `Je n'ai pas trouvé le livre "${bookTitle}" dans notre catalogue.`;
      }
    } else {
      reply = req.session.language === 'en'
        ? "Please specify the book title to check its availability."
        : "Veuillez préciser le titre du livre pour vérifier sa disponibilité.";
    }
    req.session.lastIntent = 'stock_check';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Real reviews for a book ---
  if (/avis|review|note|commentaire/.test(msg) && /livre|book|titre|title/.test(msg)) {
    // Try to extract a book title from the message
    const titleMatch = msg.match(/(?:livre|book|titre|title)[^a-zA-Z0-9]*([a-zA-Z0-9\-\' ]{3,})/i);
    let bookTitle = titleMatch ? titleMatch[1].trim() : null;
    if (bookTitle) {
      const book = await Book.findOne({ title: { $regex: bookTitle, $options: 'i' } });
      if (book && book.reviews && book.reviews.length > 0) {
        // Show up to 2 most recent reviews
        const reviews = book.reviews.slice(-2).map(r => req.session.language === 'en'
          ? `Rating: ${r.rating}/5 - "${r.text}"`
          : `Note : ${r.rating}/5 - "${r.text}"`
        ).join('\n');
        reply = req.session.language === 'en'
          ? `Here are some recent reviews for "${book.title}":\n${reviews}`
          : `Voici quelques avis récents pour "${book.title}" :\n${reviews}`;
      } else if (book) {
        reply = req.session.language === 'en'
          ? `There are no reviews yet for "${book.title}".`
          : `Il n'y a pas encore d'avis pour "${book.title}".`;
      } else {
        reply = req.session.language === 'en'
          ? `I couldn't find the book "${bookTitle}" in our catalog.`
          : `Je n'ai pas trouvé le livre "${bookTitle}" dans notre catalogue.`;
      }
    } else {
      reply = req.session.language === 'en'
        ? "Please specify the book title to see its reviews."
        : "Veuillez préciser le titre du livre pour voir ses avis.";
    }
    req.session.lastIntent = 'book_reviews';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Personalized borrow/order status ---
  if ((/statut|status|où en est|where is|suivi|track/.test(msg)) && (/commande|order|emprunt|borrow/.test(msg))) {
    try {
      const userId = req.session.userId || (req.user && req.user._id) || (req.session.user && req.session.user._id);
      if (!userId) throw new Error('Utilisateur non connecté');
      let statusMsg = '';
      if (/emprunt|borrow/.test(msg)) {
        const borrows = await Emprunt.find({ user: userId }).sort({ createdAt: -1 }).limit(2);
        if (borrows.length > 0) {
          statusMsg = borrows.map(e => {
            return req.session.language === 'en'
              ? `Borrowed: "${e.bookTitle}" - Status: ${e.status}`
              : `Emprunt : "${e.bookTitle}" - Statut : ${e.status}`;
          }).join('\n');
        } else {
          statusMsg = req.session.language === 'en'
            ? "You have no current borrows."
            : "Vous n'avez pas d'emprunts en cours.";
        }
      } else if (/commande|order/.test(msg)) {
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(2);
        if (orders.length > 0) {
          statusMsg = orders.map(o => {
            return req.session.language === 'en'
              ? `Order: #${o._id.toString().slice(-6)} - Status: ${o.status}`
              : `Commande : #${o._id.toString().slice(-6)} - Statut : ${o.status}`;
          }).join('\n');
        } else {
          statusMsg = req.session.language === 'en'
            ? "You have no current orders."
            : "Vous n'avez pas de commandes en cours.";
        }
      }
      reply = statusMsg;
    } catch (e) {
      reply = req.session.language === 'en'
        ? "I couldn't retrieve your status. Please make sure you are logged in."
        : "Je n'ai pas pu récupérer votre statut. Veuillez vous assurer que vous êtes connecté.";
    }
    req.session.lastIntent = 'status_check';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Personalized book wishlist ---
  if (/wishlist|favoris|mes favoris|ma liste de souhaits|my wishlist/.test(msg)) {
    try {
      const userId = req.session.userId || (req.user && req.user._id) || (req.session.user && req.session.user._id);
      if (!userId) throw new Error('Utilisateur non connecté');
      const user = await User.findById(userId);
      if (user && user.wishlist && user.wishlist.length > 0) {
        // Fetch book titles from wishlist
        const books = await Book.find({ _id: { $in: user.wishlist } }).limit(3);
        reply = req.session.language === 'en'
          ? `Your wishlist: ${books.map(b => '"' + b.title + '"').join(', ')}`
          : `Vos favoris : ${books.map(b => '"' + b.title + '"').join(', ')}`;
      } else {
        reply = req.session.language === 'en'
          ? "Your wishlist is empty."
          : "Votre liste de souhaits est vide.";
      }
    } catch (e) {
      reply = req.session.language === 'en'
        ? "I couldn't retrieve your wishlist. Please make sure you are logged in."
        : "Je n'ai pas pu récupérer vos favoris. Veuillez vous assurer que vous êtes connecté.";
    }
    req.session.lastIntent = 'wishlist';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  // --- ADVANCED: Book rating statistics ---
  if ((/note moyenne|average rating|moyenne|rating/.test(msg)) && (/livre|book|titre|title/.test(msg))) {
    const titleMatch = msg.match(/(?:livre|book|titre|title)[^a-zA-Z0-9]*([a-zA-Z0-9\-\' ]{3,})/i);
    let bookTitle = titleMatch ? titleMatch[1].trim() : null;
    if (bookTitle) {
      const book = await Book.findOne({ title: { $regex: bookTitle, $options: 'i' } });
      if (book && book.reviews && book.reviews.length > 0) {
        const avg = (book.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / book.reviews.length).toFixed(2);
        reply = req.session.language === 'en'
          ? `The average rating for "${book.title}" is ${avg}/5 based on ${book.reviews.length} reviews.`
          : `La note moyenne pour "${book.title}" est de ${avg}/5 sur ${book.reviews.length} avis.`;
      } else if (book) {
        reply = req.session.language === 'en'
          ? `There are no ratings yet for "${book.title}".`
          : `Il n'y a pas encore de notes pour "${book.title}".`;
      } else {
        reply = req.session.language === 'en'
          ? `I couldn't find the book "${bookTitle}" in our catalog.`
          : `Je n'ai pas trouvé le livre "${bookTitle}" dans notre catalogue.`;
      }
    } else {
      reply = req.session.language === 'en'
        ? "Please specify the book title to see its average rating."
        : "Veuillez préciser le titre du livre pour voir sa note moyenne.";
    }
    req.session.lastIntent = 'book_rating';
    req.session.unknownCount = 0;
    req.session.lastUserMsg = msg;
    req.session.lastBotReply = reply;
    return res.json({ reply });
  }

  req.session.lastUserMsg = msg;
  req.session.lastBotReply = reply;
  res.json({ reply });
});

module.exports = router;
