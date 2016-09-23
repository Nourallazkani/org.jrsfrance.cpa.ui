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
                },
                "About":{
                    "fr":"A propos"
                }
            },

            "common": {
                "view list": {
                    "fr": "Voir liste"
                },
                "view map": {
                    "fr": "Voir carte"
                },
                "City": {
                    "fr": "Ville"
                },
                "Required level": {
                    "fr": "Niveau requis"
                },
                "Registration opening": {
                    "fr": "Ouverture des inscriptions"
                },
                "Registration closing": {
                    "fr": "Cloture des inscriptions"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité"
                },
                "Address": {
                    "fr": "Adresse"
                },
                "Date": {
                    "fr": "Date"
                },
                "Hour": {
                    "fr": "Heure"
                },
                "Contact": {
                    "fr": "Contact"
                },
                "yes": {
                    "fr": "oui"
                },
                "no": {
                    "fr": "non"
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

            "user-form": {
                "Mail address": {
                    "fr": "Adresse mail"
                },
                "Password": {
                    "fr": "Mot de passe"
                },
                "First name": {
                    "fr": "Prénom"
                },
                "Last name": {
                    "fr": "Nom"
                },
                "City or postal code": {
                    "fr": "Ville ou code postal"
                },
                "I can offer": {
                    "fr": "Je peux proposer"
                },
                "I am interested in": {
                    "fr": "Je suis intéressé par"
                },
                "French conversation": {
                    "fr": "Conversation française"
                },
                "Support in studies ": {
                    "fr": "Support dans les études"
                },
                "Interpreting": {
                    "fr": "Interprétariat"
                },
                "Cultural or sport activities": {
                    "fr": "Activités culturelles ou sportives"
                },
                "Sign up": {
                    "fr": "Je m'inscris"
                },
                "Update profile": {
                    "fr": "Mettre à jour mon profil"
                }
            },

            "refugees/index": {

            },
            "refugees/welcome": {

            },

            "refugees/teachings": {
                "Field of study": {
                    "fr": "Domaine"
                }
            },
            "refugees/professional-programs": {
                "Domain": {
                    "fr": "Domaine"
                }
            },
            "refugees/events": {
                "Organised by": {
                    "fr": "Organisé par"
                },
                "More": {
                    "fr": "En savoir plus"
                }
            },
            "refugees/workshops": {
                "Organised by": {
                    "fr": "Organisé par"
                },
                "More": {
                    "fr": "En savoir plus"
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

        let message = this.messages[page] || this.messages["common"];

        if (!message) {
            return key;
        }
        let translations = message[key] || this.messages["common"][key];
        if (!translations) {
            return key;
        }
        return translations[language];
    }
}