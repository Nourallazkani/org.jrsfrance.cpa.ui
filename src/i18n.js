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
                    "fr": "Voir liste",
                    "ar":""
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar":""
                },
                "City": {
                    "fr": "Ville",
                    "ar":""
                },
                "Required level": {
                    "fr": "Niveau requis",
                    "ar":""
                },
                "Registration opening": {
                    "fr": "Ouverture des inscriptions",
                    "ar":""
                },
                "Registration closing": {
                    "fr": "Cloture des inscriptions",
                    "ar":""
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar":""
                },
                "Address": {
                    "fr": "Adresse",
                    "ar":""
                },
                "Date": {
                    "fr": "Date",
                    "ar":""
                },
                "Hour": {
                    "fr": "Heure",
                    "ar":""
                },
                "Contact": {
                    "fr": "Contact",
                    "ar":""
                },
                "yes": {
                    "fr": "oui",
                    "ar":""
                },
                "no": {
                    "fr": "non",
                    "ar":""
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
                    "fr": "Adresse mail",
                    "ar":""
                },
                "Password": {
                    "fr": "Mot de passe",
                    "ar":""
                },
                "Remember me": {
                    "fr": "Se souvenir de moi",
                    "ar":""
                },
                "Sign in": {
                    "fr": "Connexion",
                    "ar":""
                }
            },

            "user-form": {
                "Mail address": {
                    "fr": "Adresse mail",
                    "ar":""
                },
                "Password": {
                    "fr": "Mot de passe",
                    "ar":""
                },
                "First name": {
                    "fr": "Prénom",
                    "ar":""
                },
                "Last name": {
                    "fr": "Nom",
                    "ar":""
                },
                "City or postal code": {
                    "fr": "Ville ou code postal",
                    "ar":""
                },
                "I can offer": {
                    "fr": "Je peux proposer",
                    "ar":""
                },
                "I am interested in": {
                    "fr": "Je suis intéressé par",
                    "ar":""
                },
                "French conversation": {
                    "fr": "Conversation française",
                    "ar":""
                },
                "Support in studies ": {
                    "fr": "Support dans les études",
                    "ar":""
                },
                "Interpreting": {
                    "fr": "Interprétariat",
                    "ar":""
                },
                "Cultural or sport activities": {
                    "fr": "Activités culturelles ou sportives",
                    "ar":""
                },
                "Sign up": {
                    "fr": "Je m'inscris",
                    "ar":""
                },
                "Update profile": {
                    "fr": "Mettre à jour mon profil",
                    "ar":""
                }
            },

            "refugees/index": {

            },
            "refugees/welcome": {

            },

            "refugees/teachings": {
                "Field of study": {
                    "fr": "Domaine",
                    "ar":""
                }
            },
            "refugees/professional-programs": {
                "Domain": {
                    "fr": "Domaine",
                    "ar":""
                }
            },
            "refugees/events": {
                "Organised by": {
                    "fr": "Organisé par",
                    "ar":""
                },
                "More": {
                    "fr": "En savoir plus",
                    "ar":""
                }
            },
            "refugees/workshops": {
                "Organised by": {
                    "fr": "Organisé par",
                    "ar":""
                },
                "More": {
                    "fr": "En savoir plus",
                    "ar":""
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