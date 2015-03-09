var languagesAllowed = [{code: 'en', name: '<img class="flag flag-us"></img> English'}, {code: 'es', name: '<img class="flag flag-es"></img> Spanish'}, {code: 'fr', name: '<img class="flag flag-fr"></img> French'}, {code: 'de', name: '<img class="flag flag-de"></img> German'}, {code: 'nl', name: '<img class="flag flag-nl"></img> Dutch'}];
	
var translation_en = {
	COMMENT_PLACEHOLDER: 'Comment..',
	COMMENT_POSTEDON: 'Posted on',

	MENU_PROFILE: 'Profile',
	MENU_SETTINGS: 'Settings',
	MENU_LINKS: 'My Links',
	MENU_LISTS: 'My Lists',
	MENU_MODERATE: 'Moderate',

	FLAG_en: '<img class="flag flag-us"></img> English',
	FLAG_fr: '<img class="flag flag-fr"></img> French',
	FLAG_de: '<img class="flag flag-de"></img> German',
	FLAG_nl: '<img class="flag flag-nl"></img> Dutch',
	FLAG_es: '<img class="flag flag-es"></img> Spanish',

	ADDLINKS_TITLE: 'Add Links',
	TITLE_HOME: 'Stream - Home',
	TITLE_PROFILE: 'Stream - Profile',
	TITLE_LIST: 'Stream - List',

	MOVIES: 'Movies',
	MOVIES_SINGULAR: 'movie',
	SHOWS: 'TV Shows',
	SHOWS_SINGULAR: 'TV show',
	SEASONS: 'Seasons',
	EPISODES: 'Episodes',
	LINKS: 'Links',
	REPORT: 'Report',
	ADD: 'Add',
	DELETE: 'Delete',
	EDITOR: 'Editor',
	VIEWS: 'Views',
	MEDIA: 'Media',
	TITLE: 'Title',
	ACTIONS: 'Actions',
	LOGIN: 'Log In',
	LOGOUT: 'Log Out',
	SIGNUP: 'Sign Up',
	BY: 'By',
	WITH: 'With',

	ALERT_NOLINK: '<strong>No link!</strong> Please <a href="#" title="Add link" data-toggle="modal" data-target="#formlinkModal">add one</a> or come back later...',
	ALERT_LOADING: '<strong>Loading!</strong> The video will appear in a few seconds...',
	ALERT_LOGINTOCOMMENT: '<strong>Log In</strong> to send a comment !',
	ALERT_LANGSETTINGS: 'Only the links matching your settings will be displayed',
	ALERT_SETTINGSUPDATED: 'Settings updated !',
	ALERT_COMINGSOON: 'Coming Soon !',
	ALERT_ERROR: 'Error !',
	ALERT_THANKYOU: 'Thank You !',
	ALERT_LINKREPORTED: 'This link has been reported',
	ALERT_LINKSADDED: " links have been added",
	ALERT_WRONGCREDENTIALS: "Wrong Credentials !",
	ALERT_NOPASSWORD: "No password provided",
	ALERT_NOUSERNAME: "No Username provided",
	ALERT_INVALIDEMAIL: "Invalid email address",
	ALERT_ALREADYINUSE: "Email or username already in use",
	ALERT_LOGGEDOUT: "Successfully logged out !",

	FORM_USERNAME: 'Username',
	FORM_PASSWORD: 'Password',
	FORM_EMAIL: 'E-mail',
	FORM_SUBTITLES: 'Subtitles',
	FORM_SAVE: 'Save changes',
	FORM_DELETE: 'DELETE',
	FORM_CLEAR: 'CLEAR',
	FORM_FOLLOW: 'Follow',
	FORM_REPORTLINK: "Report this link",
	FORM_MAINLANGUAGE: 'Main Language',
	FORM_ADDTOLIST: 'Add to List',
	FORM_ORIGINAL: 'Original',
	FORM_PREVIEW: 'Preview',

	LIST_MOSTWATCHED: "Most Watched {{media | uppercase | translate}}",
	LIST_WATCHEDRECENTLY: "{{media | uppercase | translate}} You Watched Recently",
	LIST_NEWRELEASES: "New Releases",

	SEARCH_RESULTSCOUNT: "{{count}} results for '{{query}}' in {{media | uppercase | translate}}",
	LINK_ADDED: "Added on"
}

var translation_fr = {
	COMMENT_PLACEHOLDER: 'Commenter..',
	COMMENT_POSTEDON: 'Publié le',

	MENU_PROFILE: 'Profil',
	MENU_SETTINGS: 'Préférences',
	MENU_LINKS: 'Mes Liens',
	MENU_LISTS: 'Mes Listes',
	MENU_MODERATE: 'Modérer',

	FLAG_en: '<img class="flag flag-us"></img> Anglais',
	FLAG_fr: '<img class="flag flag-fr"></img> Français',
	FLAG_de: '<img class="flag flag-de"></img> Allemand',
	FLAG_nl: '<img class="flag flag-nl"></img> Néerlandais',
	FLAG_es: '<img class="flag flag-es"></img> Espagnol',

	ADDLINKS_TITLE: 'Ajouter des liens',
	TITLE_HOME: 'Stream - Home',
	TITLE_PROFILE: 'Stream - Profile',
	TITLE_LIST: 'Stream - List',

	MOVIES: 'Films',
	MOVIES_SINGULAR: 'film',
	SHOWS: 'Séries TV',
	SHOWS_SINGULAR: 'série TV',
	SEASONS: 'Saisons',
	EPISODES: 'Épisodes',
	LINKS: 'Liens',
	REPORT: 'Signaler',
	ADD: 'Ajouter',
	DELETE: 'Supprimer',
	EDITOR: 'Editeur',
	VIEWS: 'Vues',
	MEDIA: 'Média',
	TITLE: 'Titre',
	ACTIONS: 'Actions',
	LOGIN: 'Connexion',
	LOGOUT: 'Déconnexion',
	SIGNUP: 'Inscription',
	BY: 'De',
	WITH: 'Avec',

	ALERT_NOLINK: '<strong>Aucun lien!</strong> <a href="#" title="Add link" data-toggle="modal" data-target="#formlinkModal">Ajoutez-en un</a> ou revenez plus tard…',
	ALERT_LOADING: '<strong>Chargement!</strong> Votre vidéo appraîtra dans quelques secondes…',
	ALERT_LOGINTOCOMMENT: '<strong>Connectez-vous</strong> pour envoyer un commentaire !',
	ALERT_LANGSETTINGS: 'Seuls les liens répondant à vos préférences seront affichés',
	ALERT_SETTINGSUPDATED: 'Préférences mises à jour !',
	ALERT_COMINGSOON: 'Bientôt !',
	ALERT_ERROR: 'Erreur !',
	ALERT_THANKYOU: 'Merci !',
	ALERT_LINKREPORTED: 'Ce lien a été signalé',
	ALERT_LINKSADDED: " liens ajouté(s)",
	ALERT_WRONGCREDENTIALS: "Identifiants incorrects !",
	ALERT_NOPASSWORD: "Mot de passe non fourni",
	ALERT_NOUSERNAME: "Nom d'utilisateur non fourni",
	ALERT_INVALIDEMAIL: "Adresse e-mail non valide",
	ALERT_ALREADYINUSE: "E-mail ou nom d'utilisateur déjà utilisé(e)",
	ALERT_LOGGEDOUT: "Vous êtes déconnecté !",

	FORM_USERNAME: "Nom d'utilisateur",
	FORM_PASSWORD: "Mot de passe",
	FORM_EMAIL: 'E-mail',
	FORM_SUBTITLES: 'Sous-titres',
	FORM_SAVE: 'Enregistrer',
	FORM_DELETE: 'SUPP',
	FORM_CLEAR: 'RAS',
	FORM_MAINLANGUAGE: 'Langue principale',
	FORM_ADDTOLIST: 'Ajouter à',
	FORM_FOLLOW: "Suivre",
	FORM_REPORTLINK: "Signaler ce lien",
	FORM_ORIGINAL: 'Original',
	FORM_PREVIEW: 'Aperçu',

	LIST_MOSTWATCHED: "{{media | uppercase | translate}} Populaires",
	LIST_WATCHEDRECENTLY: "{{media | uppercase | translate}} Regardés Récemment",
	LIST_NEWRELEASES: "Nouvelles sorties",

	SEARCH_RESULTSCOUNT: "{{count}} résultats pour '{{query}}' dans les {{media | uppercase | translate}}",
	LINK_ADDED: "Ajouté le"
}