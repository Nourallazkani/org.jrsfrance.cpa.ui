export class I18n {

    defaultLanguage = "en";

    constructor() {
        this.messages = {

            "app": {
                "Sign in": {
                    "fr": "Connexion",
                    "ar":"تسجيل الدخول"
                },
                "Sign up": {
                    "fr": "Inscription",
                    "ar":"إنشاء حساب"
                },
                "About":{
                    "fr":"A propos",
                    "ar":"حول"
                }
            },

            "common": {
                "view list": {
                    "fr": "Voir liste",
                    "ar":"رؤية القائمة"
                },
                "view map": {
                    "fr": "Voir carte",
                    "ar":"رؤية الخريطة"
                },
                "City": {
                    "fr": "Ville",
                    "ar":"مدينة"
                },
                "Required level": {
                    "fr": "Niveau requis",
                    "ar":"المستوى المطلوب"
                },
                "Registration opening": {
                    "fr": "Ouverture des inscriptions",
                    "ar":"افتتاح التسجيل"
                },
                "Registration closing": {
                    "fr": "Cloture des inscriptions",
                    "ar":"إنهاء التسجيل"
                },
                "Sort by distance": {
                    "fr": "Classer par proximité",
                    "ar":"ترتيب بحسب القرب"
                },
                "Address": {
                    "fr": "Adresse",
                    "ar":"العنوان"
                },
                "Date": {
                    "fr": "Date",
                    "ar":"التاريخ"
                },
                "Hour": {
                    "fr": "Heure",
                    "ar":"الساعة"
                },
                "Contact": {
                    "fr": "Contact",
                    "ar":"اتصال"
                },
                "yes": {
                    "fr": "oui",
                    "ar":"نعم"
                },
                "no": {
                    "fr": "non",
                    "ar":"لا"
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
                    "ar":"البريد الالكتروني"
                },
                "Password": {
                    "fr": "Mot de passe",
                    "ar":"كلمة المرور"
                },
                "Remember me": {
                    "fr": "Se souvenir de moi",
                    "ar":"تذكّرني"
                },
                "Sign in": {
                    "fr": "Connexion",
                    "ar":"تسجيل الدخول"
                }
            },

            "user-form": {
                "Mail address": {
                    "fr": "Adresse mail",
                    "ar":"البريد الالكتروني"
                },
                "Password": {
                    "fr": "Mot de passe",
                    "ar":"كلمة المرور"
                },
                "First name": {
                    "fr": "Prénom",
                    "ar":"الاسم"
                },
                "Last name": {
                    "fr": "Nom",
                    "ar":"اسم العائلة"
                },
                "City or postal code": {
                    "fr": "Ville ou code postal",
                    "ar":"المدينة أو رمز المنطقة"
                },
                "I can offer": {
                    "fr": "Je peux proposer",
                    "ar":"يمكن أن أقدِّم"
                },
                "I am interested in": {
                    "fr": "Je suis intéressé par",
                    "ar":"أنا مهتمّ بِـ"
                },
                "French conversation": {
                    "fr": "Conversation française",
                    "ar":"محادثة فرنسية"
                },
                "Support in studies ": {
                    "fr": "Support dans les études",
                    "ar":"دعم دراسي"
                },
                "Interpreting": {
                    "fr": "Interprétariat",
                    "ar":"الترجمة الفورية"
                },
                "Cultural or sport activities": {
                    "fr": "Activités culturelles ou sportives",
                    "ar":"نشاطات ثقافيّة و رياضيّة"
                },
                "Sign up": {
                    "fr": "Je m'inscris",
                    "ar":"إنشاء حساب"
                },
                "Update profile": {
                    "fr": "Mettre à jour mon profil",
                    "ar":"تحديث ملفّي الشخصي"
                }
            },

            "refugees/index": {

            },
            "refugees/welcome": {

            },

            "refugees/teachings": {
                "Field of study": {
                    "fr": "Domaine",
                    "ar":"مجال دراسي"
                }
            },
            "refugees/professional-programs": {
                "Domain": {
                    "fr": "Domaine",
                    "ar":"مجال مهني"
                }
            },
            "refugees/events": {
                "Organised by": {
                    "fr": "Organisé par",
                    "ar":"منظمة من قِبل"
                },
                "More": {
                    "fr": "En savoir plus",
                    "ar":"معرفة المزيد"
                }
            },
            "refugees/workshops": {
                "Organised by": {
                    "fr": "Organisé par",
                    "ar":"منظمة من قِبل"
                },
                "More": {
                    "fr": "En savoir plus",
                    "ar":"معرفة المزيد"
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