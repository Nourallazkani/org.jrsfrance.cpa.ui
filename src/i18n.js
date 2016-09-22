export class I18n {

    defaultLanguage = "en";

    constructor() {
        this.messages = {

            "app": {
                "Sign in": {
                    "fr": "Connexion",
                    "ar": "تسجيل الدخول"
                },
                "Sign up": {
                    "fr": "Inscription",
                    "ar": "إنشاء حساب"
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
                    "ar": "اسم المستخدم"
                },
                "Password": {
                    "fr": "Mot de passe",
                    "ar": "كلمة المرور"
                },
                "Remember me": {
                    "fr": "Se souvenir de moi",
                    "ar": "تذكرني دائما"
                },
                "Sign in": {
                    "fr": "Connexion",
                    "ar": "تسجيل الدخول"
                }
            },

            "refugees/welcome": {

            },
            "refugees/teachings": {
                "view list": {
                    "fr": "Voir liste",
                    "ar": "رؤية القائمة"
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar": "رؤية الخريطة"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar": "ترتيب بحسب القُرب"
                }
            },
            "refugees/language-programs": {
                "view list": {
                    "fr": "Voir liste",
                    "ar": "رؤية القائمة"
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar": "رؤية الخريطة"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar": "ترتيب بحسب القُرب"
                }

            },
            "refugees/professional-programs": {
                "view list": {
                    "fr": "Voir liste",
                    "ar": "رؤية القائمة"
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar": "رؤية الخريطة"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar": "ترتيب بحسب القُرب"
                }
            },
            "refugees/events": {
                "view list": {
                    "fr": "Voir liste",
                    "ar": "رؤية القائمة"
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar": "رؤية الخريطة"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar": "ترتيب بحسب القُرب"
                }

            },
            "refugees/workshops": {
                "view list": {
                    "fr": "Voir liste",
                    "ar": "رؤية القائمة"
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar": "رؤية الخريطة"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar": "ترتيب بحسب القُرب"
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