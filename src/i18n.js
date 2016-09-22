export class I18n {

    defaultLanguage = "en";

    constructor() {
        this.messages = {

            "app": {
                "Sign in": {
                    "fr": "Connexion"
                },
                "Sign up": {
                    "fr": "Inscription"
                }
            },
            "home": {
                "I am a refugee": {
                    "fr": "Je suis réfugié",
                    "ar": "أنـا لاجئ",
                    "prs": "من یک پناهنده هستم"
                }
            },

            "sign-in": {
                "Mail address": {
                    "fr": "Adresse mail"
                },
                "Password": {
                    "fr": "Mot de passe"
                },
                "Remember me": {
                    "fr": "Se souvenir de moi"
                },
                "Sign in": {
                    "fr": "Connexion"
                }
            },

            "refugees/welcome": {

            },
            "refugees/teachings": {
                "view list": {
                    "fr": "Voir liste"
                },
                "view map": {
                    "fr": "Voir carte"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité"
                }
            },
            "refugees/language-programs": {
                "view list": {
                    "fr": "Voir liste"
                },
                "view map": {
                    "fr": "Voir carte"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité"
                }

            },
            "refugees/professional-programs": {
                "view list": {
                    "fr": "Voir liste"
                },
                "view map": {
                    "fr": "Voir carte"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité"
                }
            },
            "refugees/events": {
                "view list": {
                    "fr": "Voir liste"
                },
                "view map": {
                    "fr": "Voir carte"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité"
                }

            },
            "refugees/workshops": {
                "view list": {
                    "fr": "Voir liste"
                },
                "view map": {
                    "fr": "Voir carte"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité"
                }

            },
            "refugees/profile": {

            },
            "refugees/meeting-requests": {

            },



            "organisations/welcome": {

            },
            "organisations/teachings": {

            },
            "organisations/language-programs": {

            },
            "organisations/professional-programs": {

            },
            "organisations/events": {

            },
            "organisations/workshops": {

            },
            "organisations/profile": {

            },



            "volunteers/welcome": {

            },
            "volunteers/events": {

            },
            "volunteers/profile": {

            },
            "volunteers/meeting-requests": {

            }
        }
    }

    getMessage(page, key, language) {
        if (language == this.defaultLanguage) {
            return key;
        }

        let message = this.messages[page];
        if (!message) {
            return key;
        }
        let translations = message[key];
        if (!translations) {
            return key;
        }
        return translations[language];
    }
}