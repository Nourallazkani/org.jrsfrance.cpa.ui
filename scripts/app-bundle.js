define('app',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-router', 'aurelia-fetch-client', 'aurelia-event-aggregator', 'aurelia-templating-resources', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaRouter, _aureliaFetchClient, _aureliaEventAggregator, _aureliaTemplatingResources, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.App = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var App = exports.App = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaRouter.Router, _aureliaEventAggregator.EventAggregator, _aureliaFramework.BindingEngine, _aureliaTemplatingResources.BindingSignaler, _aureliaFramework.CompositionTransaction, _common.UserDetails, _common.ApplicationConfig, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    App.prototype.setUserLanguage = function setUserLanguage(newLanguage) {
      this.userDetails.language = newLanguage;
      this.bindingSignaler.signal('language-change');
    };

    function App(httpClient, router, ea, bindingEngine, bindingSignaler, compositionTransaction, userDetails, appConfig, i18nMessages, referenceData) {
      var _this = this;

      _classCallCheck(this, App);

      this.moment = _moment2.default;
      this.httpClient = httpClient;
      this.ea = ea;
      this.userDetails = userDetails;
      this.bindingSignaler = bindingSignaler;
      this.compositionTransactionNotifier = compositionTransaction.enlist();

      if (userDetails.language == "ar" || userDetails.language == "prs") {
        document.body.style.direction = "rtl";
      }

      bindingEngine.propertyObserver(userDetails, 'language').subscribe(function (newLanguage) {
        console.log(_this.router.currentInstruction.config.name != 'home');
        if (newLanguage == "ar" || newLanguage == "prs" && _this.router.currentInstruction.config.name != 'home') {
          document.body.style.direction = "rtl";
        } else {
          document.body.style.direction = "ltr";
        }
      });

      this.i18n = function (key) {
        return i18nMessages.getMessage("app", key, userDetails.language);
      };

      this.httpClient.configure(function (config) {
        config.withBaseUrl(appConfig.apiEndpoint).withDefaults({
          headers: {}
        }).withInterceptor({
          request: function request(_request) {
            if (userDetails.account && userDetails.account.accessKey) {
              _request.headers.set("AccessKey", userDetails.account.accessKey);
            }
            if (userDetails.language) {
              _request.headers.set("Accept-Language", userDetails.language);
            }
            return _request;
          },
          response: function response(_response) {
            if (_response.status >= 400 && _response.status <= 599) {
              if (_response.url.indexOf("authz/signIn") == -1 && _response.url.indexOf("authz/signUp") == -1) {
                ea.publish("error", _response);
              }
              throw _response;
            } else {
              return _response;
            }
          }
        });
      });

      this.ea.subscribe("referenceDataUpdate", function (x) {
        if (x && x.domain) {
          _this.httpClient.fetch('referenceData?noCache=true').then(function (resp) {
            return resp.json();
          }).then(function (results) {
            return referenceData.refresh(x.domain, results);
          });
        } else {
          _this.httpClient.fetch('referenceData?noCache=true').then(function (resp) {
            return resp.json();
          }).then(function (results) {
            return referenceData.refreshAll(x);
          });
        }
      });

      this.httpClient.fetch("referenceData").then(function (x) {
        return x.json();
      }).then(function (x) {
        return referenceData.load(x);
      });
    }

    App.prototype.created = function created() {
      var _this2 = this;

      if (localStorage.getItem("accessKey") != null || window.location.href.split("ak=").length == 2) {

        var accessKey = localStorage.getItem("accessKey") || (0, _common.getQueryParam)("ak");
        this.httpClient.fetch("authentication", { method: "POST", body: (0, _aureliaFetchClient.json)({ accessKey: accessKey }) }).then(function (x) {
          return x.json();
        }).then(function (account) {
          _this2.userDetails.account = account;
          _this2.compositionTransactionNotifier.done();
        }).catch(function () {
          localStorage.removeItem("accessKey");
          _this2.compositionTransactionNotifier.done();
        });
      } else {
        this.compositionTransactionNotifier.done();
      }
    };

    App.prototype.configureRouter = function configureRouter(config, router) {
      config.title = 'CPA';
      config.options.pushState = true;
      config.options.hashChange = false;

      config.map([{ route: ['', 'home'], name: 'home', moduleId: './views/home', nav: true, title: 'Home' }, { route: ['about'], name: 'about', moduleId: './views/about', nav: true, title: 'About' }, { route: 'refugees', name: 'refugees', moduleId: './views/refugees/index', nav: true, title: 'Réfugiés' }, { route: 'volunteers', name: 'volunteers', moduleId: './views/volunteers/index', nav: true, title: 'Bénévoles' }, { route: 'organisations', name: 'organisations', moduleId: './views/organisations/index', nav: true, title: 'Organisation' }]);
      this.router = router;
    };

    App.prototype.viewProfile = function viewProfile() {
      if (this.userDetails.account.profile == "R") {
        this.router.navigate("refugees/profile");
      } else if (this.userDetails.account.profile == "V") {
        this.router.navigate("volunteers/profile");
      } else if (this.userDetails.account.profile == "O") {
        this.router.navigate("organisations/profile");
      }
    };

    App.prototype.signOut = function signOut() {
      this.userDetails.account = null;
      localStorage.removeItem("accessKey");
      this.authzAction = null;
      if (this.userDetails.profile != "R") {
        this.userDetails.profile = null;
        this.router.navigateToRoute("home");
      } else {
        if (this.router.currentInstruction.fragment == "/refugees/profile") {
          this.router.navigateToRoute("refugees");
        }
      }
    };

    return App;
  }()) || _class);
});
define('common',["exports", "./environment"], function (exports, _environment) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.UserDetails = exports.ReferenceData = exports.ApplicationConfig = undefined;
    exports.getUri = getUri;
    exports.getQueryParam = getQueryParam;
    exports.viewLocation = viewLocation;
    exports.viewItinerary = viewItinerary;
    exports.getDistance = getDistance;

    var _environment2 = _interopRequireDefault(_environment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var ApplicationConfig = exports.ApplicationConfig = function ApplicationConfig() {
        _classCallCheck(this, ApplicationConfig);

        this.apiEndpoint = _environment2.default.apiEndpoint;
    };

    var ReferenceData = exports.ReferenceData = function () {
        function ReferenceData() {
            _classCallCheck(this, ReferenceData);
        }

        ReferenceData.prototype.load = function load(source) {
            for (var p in source) {
                this[p] = source[p];
            }
        };

        ReferenceData.prototype.refreshAll = function refreshAll(source) {
            this.load(source);
        };

        ReferenceData.prototype.refresh = function refresh(domain, source) {
            this[domain] = source;
        };

        return ReferenceData;
    }();

    var UserDetails = exports.UserDetails = function () {
        function UserDetails() {
            _classCallCheck(this, UserDetails);
        }

        _createClass(UserDetails, [{
            key: "language",
            get: function get() {
                return localStorage.getItem("language");
            },
            set: function set(value) {
                localStorage.setItem("language", value);
            }
        }, {
            key: "profile",
            get: function get() {
                return localStorage.getItem("profile");
            },
            set: function set(value) {
                if (value == null) {
                    localStorage.removeItem("profile");
                } else {
                    localStorage.setItem("profile", value);
                }
            }
        }, {
            key: "address",
            get: function get() {
                var _address = localStorage.getItem("address");
                return _address ? JSON.parse(_address) : null;
            },
            set: function set(value) {
                if (value) {
                    localStorage.setItem("address", JSON.stringify(value));
                } else {
                    localStorage.removeItem("address");
                }
            }
        }]);

        return UserDetails;
    }();

    function getUri(path, params) {
        if (!params) {
            return path;
        } else {
            var paramsAsArray = [];
            for (var p in params) {
                var value = params[p];
                if (value != null) {
                    paramsAsArray.push(p + "=" + value);
                }
            }
            if (paramsAsArray.length > 0) {
                return path + "?" + paramsAsArray.join("&");
            } else {
                return path;
            }
        }
    };

    function getQueryParam(paramName, url) {
        var href = url ? url : window.location.href;
        var reg = new RegExp('[?&]' + paramName + '=([^&#]*)', 'i');
        var string = reg.exec(href);
        return string ? string[1] : null;
    }

    if (typeof Number.prototype.toRad === "undefined") {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        };
    }
    function viewLocation(address) {

        var placeName = address.street1 + ",+" + address.postalCode + "+" + address.locality;
        var url = "https://www.google.com/maps/place/" + placeName + "/" + address.lat + "," + address.lng;
        window.open(url, 'map', "width=1200,height=600");
    };

    function viewItinerary(address1, address2) {
        console.log("inside viewItinerary");
        var url = "https://www.google.com/maps/dir/" + address1.lat + "," + address1.lng + "/" + address2.lat + "," + address2.lng;
        window.open(url, 'map', "width=1200,height=600");
    }

    function getDistance(from, to) {
        if (!(from && to && from.lat && from.lat && to.lng && to.lng)) {
            return null;
        }

        var lat1 = from.lat;
        var lng1 = from.lng;
        var lat2 = to.lat;
        var lng2 = to.lng;

        var R = 6371e3;
        var φ1 = lat1.toRad();
        var φ2 = lat2.toRad();
        var Δφ = (lat2 - lat1).toRad();
        var Δλ = (lng2 - lng1).toRad();

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        var dM = R * c;
        var dKm = R * c / 1000;

        return Math.round(dKm * 100) / 100;
    }
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('i18n',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var I18n = exports.I18n = function () {
        function I18n() {
            var _common;

            _classCallCheck(this, I18n);

            this.defaultLanguage = "en";

            this.messages = {

                "app": {
                    "Sign in": {
                        "fr": "Connexion",
                        "ar": "تسجيل الدخول",
                        "prs": "ورود"
                    },
                    "Sign up": {
                        "fr": "Inscription",
                        "ar": "إنشاء حساب",
                        "prs": "نام نویسی"
                    },
                    "About": {
                        "fr": "A propos",
                        "ar": "حول",
                        "prs": "در باره"
                    },
                    "Sign out": {
                        "fr": "Déconnexion",
                        "ar": "تسجيل الخروج",
                        "prs": "خروج"
                    },
                    "My profile": {
                        "fr": "Mon profil",
                        "ar": "ملفّّي الشخصي",
                        "prs": "نمایه من"
                    }
                },

                "common": (_common = {
                    "view list": {
                        "fr": "Voir liste",
                        "ar": "رؤية القائمة",
                        "prs": "دیدن فهرست "
                    },
                    "view map": {
                        "fr": "Voir carte",
                        "ar": "رؤية الخريطة",
                        "prs": "دیدن نقشه"
                    },
                    "City": {
                        "fr": "Ville",
                        "ar": "مدينة",
                        "prs": "شهر"
                    },
                    "Required level": {
                        "fr": "Niveau requis",
                        "ar": "المستوى المطلوب",
                        "prs": "سطح مورد نیاز"
                    },
                    "Registration opening": {
                        "fr": "Ouverture des inscriptions",
                        "ar": "افتتاح التسجيل",
                        "prs": "آغاز ثبت نام"
                    },
                    "Registration closing": {
                        "fr": "Cloture des inscriptions",
                        "ar": "إنتهاء التسجيل",
                        "prs": "ختم ثبت نام"
                    },
                    "Registration": {
                        "fr": "inscriptions",
                        "ar": "التسجيل",
                        "prs": "ثبت نام"
                    },
                    "Sort by distance": {
                        "fr": "Classer par proximité",
                        "ar": "ترتيب بحسب القرب",
                        "prs": "مرتب سازی بر اساس فاصله"
                    },
                    "Address": {
                        "fr": "Adresse",
                        "ar": "العنوان",
                        "prs": "آدرس"
                    },
                    "Date": {
                        "fr": "Date",
                        "ar": "التاريخ",
                        "prs": "تاریخ"
                    },
                    "From": {
                        "fr": "Début",
                        "ar": "من",
                        "prs": ""
                    },
                    "To": {
                        "fr": "Fin",
                        "ar": "إلى",
                        "prs": ""
                    },
                    "Hour": {
                        "fr": "Heure",
                        "ar": "الساعة",
                        "prs": "ساعت "
                    },
                    "Contact": {
                        "fr": "Contact",
                        "ar": "اتصال",
                        "prs": "تماس"
                    },
                    "yes": {
                        "fr": "oui",
                        "ar": "نعم",
                        "prs": "بلی"
                    },
                    "no": {
                        "fr": "non",
                        "ar": "لا",
                        "prs": "نخیر"
                    },
                    "Cancel": {
                        "fr": "Annuler",
                        "ar": "إلغاء",
                        "prs": ""
                    },
                    "Save": {
                        "fr": "Enregistrer",
                        "ar": "حفظ",
                        "prs": ""
                    },
                    "Modify": {
                        "fr": "Modifier",
                        "ar": "تعديل",
                        "prs": ""
                    },
                    "Link": {
                        "fr": "Lien",
                        "ar": "رابط",
                        "prs": ""
                    },
                    "Delete": {
                        "fr": "Supprimer",
                        "ar": "حذف",
                        "prs": ""
                    },
                    "Are you sure you want to delete this offer?": {
                        "fr": "Etes vous sûr de vouloir supprimer ce offre ?",
                        "ar": "هل أنتم متأكّدون من حذف هذه العرض؟",
                        "prs": ""
                    },
                    "Main Information": {
                        "fr": "Informations principales",
                        "ar": "معلومات أساسيّة",
                        "prs": ""
                    },
                    "Type": {
                        "fr": "Type",
                        "ar": "النوع",
                        "prs": ""
                    }
                }, _common["Type"] = {
                    "fr": "Type",
                    "ar": "النوع",
                    "prs": ""
                }, _common["Field of study"] = {
                    "fr": "Domaine d'etude",
                    "ar": "مجال الدراسة",
                    "prs": "رشته تحصیلی"
                }, _common),

                "home": {
                    "Refugee or asylum seeker": {
                        "fr": "Réfugié ou demandeur d'asile",
                        "ar": "لاجئ أو طالب لجوء",
                        "prs": "پناهنده یا پناهجو"
                    },
                    "I'm a Volunteer": {
                        "fr": "Je suis bénévole",
                        "ar": "أنا متطوع",
                        "prs": "من یک داوطلب هستم"
                    },
                    "I can help according to my availability in ": {
                        "fr": "Je peux aider selon mes disponibilités par",
                        "ar": "يمكنني أن أساعد بحسبب وقتي المتاح في ",
                        "prs": ""
                    },
                    "Learning French language": {
                        "fr": "L’apprentissage de français",
                        "ar": "تعلّم اللغة الفرنسية",
                        "prs": ""
                    },
                    "Support in certain hight study formations": {
                        "fr": "le soutien pour certaines formations supérieures",
                        "ar": "الدعم لبعض مجالات التعليم العالي",
                        "prs": ""
                    },
                    "Interpreting": {
                        "fr": "l’interprétariat",
                        "ar": "الترجمة الفورية",
                        "prs": ""
                    },
                    "I can present my offers for the refugees so they can find the ones that are most adapted to their needs": {
                        "fr": "Je peux présenter mes offres de formation pour les réfugiés afin qu’ils retrouvent celles qui sont les plus adaptées à leurs besoins",
                        "ar": "يمكنني أن أنشر عروضي المخصصة للاجئين من أجل أن يختاروا منها ما يناسب حاجاتهم ",
                        "prs": ""
                    },
                    "Sign in": {
                        "fr": "Je me connecte",
                        "ar": "أُسجّلُ الدّخول",
                        "prs": ""
                    },
                    "Sign up": {
                        "fr": "Je m'inscris",
                        "ar": "أَطلبُ التسجيل",
                        "prs": ""
                    },
                    "Watch video": {
                        "fr": "Voir la vidéo",
                        "ar": "أُشاهد الفيديو",
                        "prs": ""
                    },
                    "Back": {
                        "fr": "Retour",
                        "ar": "رجوع",
                        "prs": ""
                    }
                },

                "sign-in": {
                    "Mail address": {
                        "fr": "Adresse mail",
                        "ar": "البريد الالكتروني",
                        "prs": "آدرس ایمیل"
                    },
                    "Password": {
                        "fr": "Mot de passe",
                        "ar": "كلمة المرور",
                        "prs": "رمز عبور"
                    },
                    "remember me": {
                        "fr": "se souvenir de moi",
                        "ar": "تذكّرني",
                        "prs": "من را به یاد داشته باش"
                    },
                    "Sign in": {
                        "fr": "Connexion",
                        "ar": "تسجيل الدخول",
                        "prs": "ورود"
                    },
                    "Invalid mail address or password": {
                        "fr": "Adresse mail ou mot de passe invalide",
                        "ar": " عنوان البريدأو كلمة المرور غير صالح",
                        "prs": "آدرس ایمیل یا رمز عبور نادرست است"
                    },
                    "Reset my password": {
                        "fr": "Réinitialiser mon mot de passe",
                        "ar": "إعادة تعيين كلمة مروري",
                        "prs": "تنظیم جدید رمز عبور"
                    },
                    "Recover password confirmation": {
                        "fr": "Un mail vous a été envoyé, il contient un lien permettant de réinitialiser votre mot de passe.",
                        "en": "An email has been sent, which contains a link to reset your password.",
                        "ar": "تم إرسال رسالة الكترونية (إيميل) تحتوي على رابط إعادة تعيين كلمة مروركم.",
                        "prs": "برای تنظیم مجدد رمز عبور، برای شما یک ایمیل شامل یک لینک فرستاده شد"
                    }
                },

                "user-form": {
                    "Mail address": {
                        "fr": "Adresse mail",
                        "ar": "البريد الالكتروني",
                        "prs": "آدرس ایمیل"
                    },
                    "Phone": {
                        "fr": "Téléphone",
                        "ar": "الهاتف",
                        "prs": "تیلیفون"
                    },
                    "Mastered languages": {
                        "fr": "Langues maitrisées",
                        "ar": "الّلغات المتقنة",
                        "prs": "زبان"
                    },
                    "Password": {
                        "fr": "Mot de passe",
                        "ar": "كلمة المرور",
                        "prs": "رمز عبور"
                    },
                    "First name": {
                        "fr": "Prénom",
                        "ar": "الاسم",
                        "prs": "نام"
                    },
                    "Last name": {
                        "fr": "Nom",
                        "ar": "اسم العائلة",
                        "prs": "نام خانوادگی"
                    },
                    "City or postal code": {
                        "fr": "Ville ou code postal",
                        "ar": "المدينة أو رمز المنطقة",
                        "prs": "شهر یا کد پستی"
                    },
                    "I can offer": {
                        "fr": "Je peux proposer",
                        "ar": "يمكن أن أقدِّم",
                        "prs": "میتوانم پیشنهاد دهم"
                    },
                    "I am interested in": {
                        "fr": "Je suis intéressé par",
                        "ar": "أنا مهتمّ بِـ",
                        "prs": "من علاقه مند هستم در"
                    },
                    "French lessons": {
                        "fr": "Leçons de français",
                        "ar": "محادثة فرنسية",
                        "prs": "درس های فرانسوی"
                    },
                    "Support in studies": {
                        "fr": "Support dans les études",
                        "ar": "دعم دراسي",
                        "prs": "پشتیبانی در مطالعات"
                    },
                    "Interpreting": {
                        "fr": "Interprétariat",
                        "ar": "الترجمة الفورية",
                        "prs": "ترجمه"
                    },
                    "Cultural or sport activities": {
                        "fr": "Activités culturelles ou sportives",
                        "ar": "نشاطات ثقافيّة و رياضيّة",
                        "prs": "فعالیت های فرهنگی یا ورزشی"
                    },
                    "Sign up": {
                        "fr": "Je m'inscris",
                        "ar": "إنشاء حساب",
                        "prs": "نام نویسی"
                    },
                    "Update profile": {
                        "fr": "Mettre à jour mon profil",
                        "ar": "تحديث ملفّي الشخصي",
                        "prs": "به روز رسانی نمایه من"
                    },
                    "Another acccout is linked to this address": {
                        "fr": "Un autre compte est associé à cette adresse",
                        "ar": "يوجد حساب آخر مرتبط بهذا العنوان.",
                        "prs": "یک حساب دیگر با این آدرس مرتبط است"
                    }
                },

                "refugees/index": {
                    "French courses": {
                        "fr": "Apprentissage du français",
                        "ar": "تعلّم الفرنسية",
                        "prs": "آموزش زبان فرانسوی"
                    },
                    "University studies": {
                        "fr": "Etudes supérieures",
                        "ar": "دراسة جامعية",
                        "prs": "تحصیلات عالی"
                    },
                    "Professional training": {
                        "fr": "Formation professionelles",
                        "ar": "تدريب مهني",
                        "prs": "آموزش های حرفه ای"
                    },
                    "Workshops": {
                        "fr": "Ateliers socio linguistiques",
                        "ar": "ورشات سوسيولغوية",
                        "prs": "کار گاه های زبانی ـ اجتماعی"
                    },
                    "Events": {
                        "fr": "Evenements",
                        "ar": "فعّاليات",
                        "prs": "برنامه ها"
                    },
                    "Self learning": {
                        "fr": "Auto apprentissage",
                        "ar": "تعليم ذاتي",
                        "prs": "روش های خود آموزی زبان"
                    },
                    "Meet a volunteer": {
                        "fr": "Rencontrer un bénévole",
                        "ar": "التقي متطوعاً",
                        "prs": "دیدار با یک داوطلب"
                    }
                },
                "refugees/welcome": {
                    "French courses adapted to your needs (higher education, professional French, French for daily life)": {
                        "fr": "Des cursus de français selon les besoins (enseignement supérieur, français à visée professionnelle, français pour la vie quotidienne)",
                        "ar": "البحث عن عروض لتعلم اللغة الفرنسية حسب الحاجة ( الفرنسية لمتابعة التعليم العالي، الفرنسية للمهنين، الفرنسية للحياة اليومية).",
                        "prs": "(زبان فرانسوی مطابق نیاز مندی ها  شما (زبان فرانسوی برای تحصیلات عالی، زبان فرانسوی در بخش آموزش های حرفه ای و زبان فرانسوی برای زندگی روزمره"
                    },
                    "Higher education offers with linguistic support": {
                        "fr": "Des offres d’études supérieures avec accompagnement linguistique",
                        "ar": "البحث عن عروض لمتابعة التعليم العالي مع مرافقة لغوية",
                        "prs": "پیشنهاد تحصیلات عالی همراه با پشتیبانی زبانی"
                    },
                    "Professional trainings with linguistic support": {
                        "fr": "Des offres de formations professionnelles avec accompagnement linguistique",
                        "ar": "البحث عن عروض لتدريبات مهنية مع مرافقة لغوية",
                        "prs": "پیشنهاد آموزش های حرفه ای همراه با پشتیبانی زبانی"
                    },
                    "Workshops to develop communication skills for daily life": {
                        "fr": "Ateliers qui visent à développer les compétences de communication pour la vie quotidienne.",
                        "ar": "البحث عن ورشات عمل لتطوير مهارات التواصل اللّغوية الضرورية من أجل شؤون الحياة اليومية الاجتماعية.",
                        "prs": "کارگاه های آموزشی برای ارتقای مهارت های ارتباطی در زندگی روزمره"
                    },
                    "Cultural, sport or recreational activities to improve your French": {
                        "fr": "Activités culturelles, sportives ou ludiques en vue de progresser en français",
                        "ar": " فعاليات ثقافية أو رياضية أو للترفيه معنية بتعلم الفرنسية",
                        "prs": "فعالیت های فرهنگی، ورزشی و یا تفریحی برای بهبود یادگیری زبان فرانسوی"
                    },
                    "Directory of all the libraries offering self-learning methods": {
                        "fr": "Annuaire des bibliothèques qui proposent et conseillent des méthodes d’auto-apprentissage.",
                        "ar": "عناوين المكتبات التي تقترح و توفّر طرق لتعلّم الفرنسية بشكلٍ ذاتي.",
                        "prs": "راهنمای کتاب خانه ها برای یاد گیری خود آموزی زبان فرانسوی"
                    },
                    "Get in touch with a volunteer for support in learning French, interpreting or other trainings": {
                        "fr": "Entrer en relation avec un bénévole pour un accompagnement dans l’apprentissage du français, l’interprétariat, ou d’autres formations.",
                        "ar": "البحث عن متطوعين للمساعدة أثناء تعلّم الفرنسية أو في مرحلة التعليم العالي أو المرافقة -عند الحاجة- حين مواعيد الحصول على الأأوراق الرسمية)",
                        "prs": "ایجاد رابطه همراه با یک داوطلب برای همراهی در قسمت فراگیری زبان فرانسوی، ترجمه و سایر آموزش های حرفه ای"
                    }
                },
                "refugees/teachings": {
                    "Field of study": {
                        "fr": "Domaine d'etude",
                        "ar": "مجال الدراسة",
                        "prs": "رشته تحصیلی"
                    }
                },
                "refugees/professional-programs": {
                    "Domain": {
                        "fr": "Domaine pro",
                        "ar": "المجال المهني",
                        "prs": "بخش"
                    }
                },
                "refugees/events": {
                    "Organised by": {
                        "fr": "Organisé par",
                        "ar": "منظمة من قِبل",
                        "prs": "ترتیب و تنظیم توسط"
                    },
                    "More": {
                        "fr": "En savoir plus",
                        "ar": "معرفة المزيد",
                        "prs": "برای معلومات بیشتر"
                    }
                },
                "refugees/workshops": {
                    "Organised by": {
                        "fr": "Organisé par",
                        "ar": "منظمة من قِبل",
                        "prs": "ترتیب و تنظیم توسط"
                    },
                    "More": {
                        "fr": "En savoir plus",
                        "ar": "معرفة المزيد",
                        "prs": "برای معلومات بیشتر"
                    }
                },
                "refugees/profile": {},
                "refugees/meeting-requests": {
                    "New appointment request": {
                        "fr": "Nouvelle demande de rendez vous",
                        "ar": "طلب موعد جديد",
                        "prs": "درخواست جدید برای وعده ملاقات"
                    },
                    "Accepted requests": {
                        "fr": "Demandes acceptées",
                        "ar": "الطلبات التي قُبِلت",
                        "prs": ""
                    },
                    "On Wating requests": {
                        "fr": "Demandes en attente",
                        "ar": "الطلبات قيد الانتظار",
                        "prs": ""
                    },
                    "Request type": {
                        "fr": "Type de demande",
                        "ar": "نوع الموعد",
                        "prs": "نوع درخواست"
                    },
                    "Interpreting": {
                        "fr": "Interprétariat",
                        "ar": "ترجمة فورية",
                        "prs": "ترجمه"
                    },
                    "Support in studies": {
                        "fr": "Soutien dans les études",
                        "ar": " دعم الدراسي",
                        "prs": "پشتیبانی در مطالعات"
                    },
                    "French lessons": {
                        "fr": "Leçons de français",
                        "ar": "دروس الفرنسية ",
                        "prs": "درس های زبان فرانسوی"
                    },
                    "Additional information": {
                        "fr": "Informations complémentaires",
                        "ar": "معلومات إضافية",
                        "prs": "معلومات بیشتر"
                    },
                    "optional": {
                        "fr": "facultatif",
                        "ar": "اختياري",
                        "prs": "اختیاری"
                    },
                    "Date": {
                        "fr": "Date",
                        "ar": "التاريخ",
                        "prs": "تاریخ"
                    },
                    "City or postal code": {
                        "fr": "Ville ou code postal",
                        "ar": "البلد أو الرمز البريدي",
                        "prs": "شهر یا کد پستی"
                    },
                    "To contact you": {
                        "fr": "Pour vous contacter",
                        "ar": "للتواصل معكم",
                        "prs": "برای تماس با شما"
                    },
                    "Telephone": {
                        "fr": "Téléphone",
                        "ar": "الهاتف",
                        "prs": "تیلیفون"
                    },
                    "Mail address": {
                        "fr": "Adresse mail",
                        "ar": "العنوان البريدي",
                        "prs": "آدرس ایمیل"
                    },
                    "Send my request": {
                        "fr": "Envoyer ma demande",
                        "ar": "إرسال طلبي",
                        "prs": "فرستادن درخواست من"
                    },
                    "Accepted by": {
                        "fr": "Accepté par ",
                        "ar": "قُبِلَ من:",
                        "prs": "پذیرفته شده توسط"
                    },
                    "Posted the": {
                        "fr": "Posté le ",
                        "ar": "طُلِب في ",
                        "prs": "فرستاده شده در"
                    },
                    "For": {
                        "fr": "Pour ",
                        "ar": "من أجل",
                        "prs": "برای"
                    },
                    "Region": {
                        "fr": "Région",
                        "ar": "المنطقة",
                        "prs": "منطقه"
                    },
                    "My request": {
                        "fr": "Ma demande",
                        "ar": "طلبي",
                        "prs": "درخواست من"
                    },
                    "No access, please sign up or sign in": {
                        "fr": "Pas d'accès, veuillez s'inscrire ou se connecter",
                        "ar": "للوصول لهذه الخدمة، تفضّلوا بإنشاء حساب أو بتسجيل الدخول.",
                        "prs": "قابل دسترس نیست، لطفن نام نویسی کنید و یا متصل شودید"
                    }
                },

                "organisations/welcome": {
                    "French courses adapted to your needs (higher education, professional French, French for daily life)": {
                        "fr": "Des cursus de français selon les besoins (enseignement supérieur, français à visée professionnelle, français pour la vie quotidienne)",
                        "ar": "البحث عن عروض لتعلم اللغة الفرنسية حسب الحاجة ( الفرنسية لمتابعة التعليم العالي، الفرنسية للمهنين، الفرنسية للحياة اليومية).",
                        "prs": "(زبان فرانسوی مطابق نیاز مندی ها  شما (زبان فرانسوی برای تحصیلات عالی، زبان فرانسوی در بخش آموزش های حرفه ای و زبان فرانسوی برای زندگی روزمره"
                    },
                    "Higher education offers with linguistic support": {
                        "fr": "Des offres d’études supérieures avec accompagnement linguistique",
                        "ar": "البحث عن عروض لمتابعة التعليم العالي مع مرافقة لغوية",
                        "prs": "پیشنهاد تحصیلات عالی همراه با پشتیبانی زبانی"
                    },
                    "Professional trainings with linguistic support": {
                        "fr": "Des offres de formations professionnelles avec accompagnement linguistique",
                        "ar": "البحث عن عروض لتدريبات مهنية مع مرافقة لغوية",
                        "prs": "پیشنهاد آموزش های حرفه ای همراه با پشتیبانی زبانی"
                    },
                    "Workshops to develop communication skills for daily life": {
                        "fr": "Ateliers qui visent à développer les compétences de communication pour la vie quotidienne.",
                        "ar": "البحث عن ورشات عمل لتطوير مهارات التواصل اللّغوية الضرورية من أجل شؤون الحياة اليومية الاجتماعية.",
                        "prs": "کارگاه های آموزشی برای ارتقای مهارت های ارتباطی در زندگی روزمره"
                    },
                    "Cultural, sport or recreational activities to improve your French": {
                        "fr": "Activités culturelles, sportives ou ludiques en vue de progresser en français",
                        "ar": " فعاليات ثقافية أو رياضية أو للترفيه معنية بتعلم الفرنسية",
                        "prs": "فعالیت های فرهنگی، ورزشی و یا تفریحی برای بهبود یادگیری زبان فرانسوی"
                    }
                },
                "organisations/index": {
                    "French courses": {
                        "fr": "Apprentissage du français",
                        "ar": "تعلّم الفرنسية",
                        "prs": "آموزش زبان فرانسوی"
                    },
                    "University studies": {
                        "fr": "Etudes supérieures",
                        "ar": "دراسة جامعية",
                        "prs": "تحصیلات عالی"
                    },
                    "Professional training": {
                        "fr": "Formation professionelles",
                        "ar": "تدريب مهني",
                        "prs": "آموزش های حرفه ای"
                    },
                    "Workshops": {
                        "fr": "Ateliers socio linguistiques",
                        "ar": "ورشات سوسيولغوية",
                        "prs": "کار گاه های زبانی ـ اجتماعی"
                    },
                    "Events": {
                        "fr": "Evenements",
                        "ar": "فعّاليات",
                        "prs": "برنامه ها"
                    }

                },
                "organisations/teachings": {
                    "Create a new teaching": {
                        "fr": "Créer un nouvel enseignement",
                        "ar": "إنشاء فرصة تعليم جديدة",
                        "prs": ""
                    }
                },
                "organisations/language-programs": {
                    "Include future courses": {
                        "fr": "Inclure les cours futurs",
                        "ar": "تَضمّن الدروس المستقبلية",
                        "prs": ""
                    },
                    "Include past courses": {
                        "fr": "Inclure les cours passés",
                        "ar": "تَضمّن الدروس الفائتة",
                        "prs": ""
                    },
                    "Create a new French course": {
                        "fr": "Créer un nouveau cours de français",
                        "ar": "إنشاء درس فرنسيّة جديد",
                        "prs": ""
                    }
                },
                "organisations/professional-programs": {
                    "Include future trainings": {
                        "fr": "Inclure les formation futures",
                        "ar": "تَضمّن التدريبات المستقبلية",
                        "prs": ""
                    },
                    "Include past trainings": {
                        "fr": "Inclure les formation passées",
                        "ar": "تَضمّن التدريبات الفائتة",
                        "prs": ""
                    },
                    "Create new professional training": {
                        "fr": "Créer une nouvelle formation professionnelle",
                        "ar": "إنشاء تدريب مهني جديد",
                        "prs": ""
                    }
                },
                "organisations/events": {
                    "Include": {
                        "fr": "Inclure",
                        "ar": "تَضمّن",
                        "prs": ""
                    },
                    "the workshops": {
                        "fr": "les ateliers",
                        "ar": "الورشات",
                        "prs": ""
                    },
                    "the events": {
                        "fr": "les évenements",
                        "ar": "الفعّاليّات",
                        "prs": ""
                    },
                    "future": {
                        "fr": "futurs",
                        "ar": "المستقبلية",
                        "prs": ""
                    },
                    "past": {
                        "fr": "passés",
                        "ar": "الفائتة",
                        "prs": ""
                    },
                    "Create a new": {
                        "fr": "Créer un nouvel",
                        "ar": "إنشاء",
                        "prs": ""
                    }

                },
                "organisations/workshops": {},
                "organisations/profile": {},

                "volunteers/welcome": {
                    "Availabilities": {
                        "fr": "Disponibilités",
                        "ar": "متاح لـ",
                        "prs": "دسترسی"
                    },
                    "Events for volunteers": {
                        "fr": "Evenements pour les bénévoles",
                        "ar": "فعاليات للمتطوعين",
                        "prs": "برنامه ها برای داوطلبان"
                    },
                    "Methods of teaching": {
                        "fr": "Méthodes pour enseigner",
                        "ar": "مناهج من أجل التعليم",
                        "prs": "روش تدریس"
                    },
                    "Meetings": {
                        "fr": "Demande de rendez vous",
                        "ar": "طلبات المواعيد",
                        "prs": "درخواست وعده ملاقات"
                    }
                },
                "volunteers/availabilities": {
                    "Thanks for your registration": {
                        "fr": "Merci pour votre inscription",
                        "ar": "شكرا لتسجيلكم",
                        "prs": "تشکر از ثبت نام شما"
                    },
                    "Could you complete your profile by telling us how you wish to help the refugees ?": {
                        "fr": "Pourriez vous compléter votre profil en indiquant comment vous souhaitez aider les réfugiés ?",
                        "ar": "هل بإمكانكم إكمال حسابكم الشخصي لإخبارنا كيف ترغبون مساعدة اللاجئين ؟",
                        "prs": "آیا می توانید نمایه تان را تکمیل نموده و تذکر دهید که چگونه می خواهید پناهندگان را کمک کنید؟"
                    },
                    "Explanations": {
                        "fr": "Explications",
                        "ar": "توضيح",
                        "prs": "توضیحات"
                    },

                    "French lessons": {
                        "fr": "Leçons de français",
                        "ar": "محادثة فرنسية",
                        "prs": "درس های زبان فرانسوی"
                    },
                    "Explanations-french-lessons": {
                        "fr": "des cours de français, donnés à un réfugié dans les centre d'accueil de demandeurs d'asile (où autre lieu à décidé entre vous et le réfugié). Si vous n'avez jamais enseigné le français à des etrangers n'hésitez pas à consulter la rubrique 'Evenements pour les bénévoles', qui recensent notamment les cours FLE (français langue étrangère). Vous pouvez aussi trouver des méthodes de langues dans la rubrique 'méthodes pour enseigner'",
                        "en": "french conversations sessions (+/- 1 hour), where you can help a refugee to improve their french",
                        "ar": "جلسات محادثة فرنسية تدوم لـ (+/- ساعة)، بهدف مساعدة لاجئ لتحسين فرنسيته",
                        "prs": "جلسات مهاوره به زبان فرانسوی (+/- ۱ ساعت)،‌ فرصتی که می توانید برای بهبود زبان فرانسوی یک پناهنده کمک کنید"
                    },
                    "Explanations-address": {
                        "fr": "Indiquer votre ville nous permettra de ne vous soliciter que pour les réfugiés qui habitent à proximité. Elle ne sera jamais divuglée sur le site ni communiqué à des tiers. Si vous le souhaitez vous pouvez n'inscrire que votre ville ou votre code postal",
                        "en": "Telling us the city where you live will help us to sollicate you help only for refugees who leave in your area. It will <u>never</u> be displayed on the site or given to anyone. If you prefer you can give us only your city or your postal code",
                        "ar": " إخبارنا بعنوان سكنكم يسمح لنا بطلب مساعدتكم في حال احتياجها من قبل لاجئ يسكن بالقرب منكم. لن تظهر هذه المعلومات أبدا ولن نرسلها لأي شخص كان!. يمكنكم إذا أردتم أن تزودنا فقط باسم مدينتكم أو برمزها البريدي.",
                        "prs": "تذکر شهر برای ما اجازه خواهد داد تا شما بتوانید برای پناهندگان نزدیک شما کمک نمایید، هرگز در سایت منتشر و یا با شخص سومی در میان گذاشته نخواهد شد. اگر خواستید می توانید تنها اسم شهر یا کد پستی تان را بنویسید"
                    },
                    "Interpreting": {
                        "fr": "Interprétariat",
                        "ar": "الترجمة الفورية",
                        "prs": "تذکر شهر برای ما اجازه خواهد داد تا شما بتوانید برای پناهندگان نزدیک شما کمک نمایید، هرگز در سایت منتشر و یا با شخص سومی در میان گذاشته نخواهد شد. اگر خواستید می توانید تنها اسم شهر یا کد پستی تان را بنویسید"
                    },
                    "Explanations-interpreting": {
                        "fr": "Si vous maitrisez une langue étrangère cela peut beaucoup aider les réfugiés, notamment lorsqu'ils ont besoin de se faire comprendre dans l'accomplissement d'une démarche administrative. Même si vous parlez anglais cela peut-être d'une grande aide car beaucoup de réfugiés parlent anglais aussi.",
                        "en": "if you master another language it could be a great help for refugees,especially when they need to do an administrative task. Very often they don't speak french well enough to understand clearly the administrative procedure. If you speak english it can be of a great  help since many refugees can speak english as well.",
                        "ar": "إذا كنتم تتقنون لغة أخرى فهذا قد يساعد جداً اللاجئين، خصوصا حينما يحتاجون التواصل عند القيام بالمهام الإدارية، إذ أنهم غالبا لا يتكلمون الفرنسية بشكل كاف يسمح لهم بفهم الإجراءات الإدارية بوضوح، فإذا كنتم تتكلمون الانجليزية مثلا، فذلك رائع! حيث معظم اللاجئيين تتكلم الانجليزية.",
                        "prs": "گر آشنایی به یک زبان بیرونی دارید،‌ می تواند پناهندگان را خیلی کمک می کند، به ویژه در  پیشبرد امور اداری. حتا اگر به زبان انگلیسی دسترسی دارید می تواند پناهندگان را کمک زیاد نماید چون بیشتر پناهندگان با زبان انگلسی آشنایی دارند"
                    },
                    "Support in studies": {
                        "fr": "Support dans les études",
                        "ar": "الدعم الدراسي",
                        "prs": "پشتیبانی در مطالعات"
                    },
                    "Explanations-support-in-studies": {
                        "fr": "Si vous maitriser un domaine tel que les mathématique, la physique, etc... Accepteriez vous d'aider un réfugié dans ses études ?",
                        "en": "if you master a domain like mathematic, physics, ... would you accept to help refugees in their studies ?",
                        "ar": "إذا كنتم تتقنون مجالا معيّناً كالرياضيات، أو الفيزياء... فهل تقبلون مساعدة اللاجئين في دراستهم ؟",
                        "prs": "اگر آشنایی در یک رشته خاص دارید مانند ریاضی، فیزیک و غیره، آیا می توانید یک پناهنده را در قسمت درس هایش کمک کنید؟"
                    },
                    "Cultural or sport activities": {
                        "fr": "Activites culturelles ou sportives",
                        "ar": "فعّاليات ثقافية و رياضية",
                        "prs": "فعالیت های فرهنگی و یا ورزشی"
                    },
                    "Explanations-activities": {
                        "fr": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                        "en": "If you have some time to organise some culture and sport activities for the refugees, then it'll be great!",
                        "ar": "أذا كان لديكم الوقت لتنظيم بعض النشاطات الثقافية و الرياضيّة فسيكون ذلك من دواعي سرور اللاجئين.",
                        "prs": ""
                    },
                    "Update availabilities": {
                        "fr": "Mettre à jour mes disponibilités",
                        "ar": "تحديث معلوماتي",
                        "prs": "به روز سازی دسترسی های من"
                    }
                },
                "volunteers/events": {},
                "volunteers/profile": {
                    "Thanks for your registration": {
                        "fr": "Merci pour votre inscription",
                        "ar": "شكرا لتسجيلكم",
                        "prs": "تشکر از نام نویسی شما"
                    },
                    "Could you complete your profile by telling us how you wish to help the refugees ?": {
                        "fr": "Pourriez vous compléter votre profil en indiquant comment vous souhaitez aider les réfugiés ?",
                        "ar": "هل بإمكانكم إكمال حسابكم الشخصي لإخبارنا كيف ترغبون مساعدة اللاجئين ؟",
                        "prs": "آیا می توانید نمایه تان را تکمیل نموده با اشاره به این که چگونه می خواهید یک پناهنده را کمک کنید؟"
                    },
                    "Explanations": {
                        "fr": "Explications",
                        "ar": "توضيح",
                        "prs": "توضیح"
                    },
                    "Your address": {
                        "fr": "Votre adresse",
                        "ar": "عنوانكم",
                        "prs": "آدرس شما"
                    },
                    "French lessons": {
                        "fr": "Leçons de français",
                        "ar": "محادثة فرنسية",
                        "prs": "درس های زبان فرانسوی"
                    },
                    "Explanations-french-lessons": {
                        "fr": "des séances de conversation d'une heure, durant lesquels vous aider les réfugiés à améliorer leur français.",
                        "en": "french conversations sessions (+/- 1 hour), where you can help a refugee to improve their french",
                        "ar": "جلسات محادثة فرنسية تدوم لـ (+/- ساعة)، بهدف مساعدة لاجئ لتحسين فرنسيته",
                        "prs": "جلسات مهاوره به زبان فرانسوی (+/- ۱ ساعت)،‌ فرصتی که می توانید برای بهبود زبان فرانسوی یک پناهنده کمک کنید"
                    },
                    "Explanations-address": {
                        "fr": "Indiquer votre ville nous permettra de ne vous soliciter que pour les réfugiés qui habitent à proximité. Elle ne sera jamais divuglée sur le site ni communiqué à des tiers. Si vous le souhaitez vous pouvez n'inscrire que votre ville ou votre code postal",
                        "en": "Telling us the city where you leave will help us to sollicate you help only for refugees who leave in your area. It will <u>never</u> be displayed on the site or given to anyone. If you prefer you can give us only your city or your postal code",
                        "ar": " إخبارنا بعنوان سكنكم يسمح لنا بطلب مساعدتكم في حال احتياجها من قبل لاجئ يسكن بالقرب منكم. لن تظهر هذه المعلومات أبدا ولن نرسلها لأي شخص كان!. يمكنكم إذا أردتم أن تزودنا فقط باسم مدينتكم أو برمزها البريدي.",
                        "prs": "تذکر شهر برای ما اجازه خواهد داد تا شما بتوانید برای پناهندگان نزدیک شما کمک نمایید، هرگز در سایت منتشر و یا با شخص سومی منتشر یا در میان گذاشته نخواهد شد. اگر خواستید می توانید تنها اسم شهر یا کد پستی تان را بنویسید"
                    },
                    "Interpreting": {
                        "fr": "Interprétariat",
                        "ar": "الترجمة الفورية",
                        "prs": "ترجمه"
                    },
                    "Explanations-interpreting": {
                        "fr": "Si vous maitrisez une langue étrangère cela peut beaucoup aider les réfugiés, notamment lorsqu'ils ont besoin de se faire comprendre dans l'accomplissement d'une démarche administrative. Même si vous parlez anglais cela peut-être d'une grande aide car beaucoup de réfugiés parlent anglais aussi.",
                        "en": "if you master another language it could be a great help for refugees,especially when they need to do an administrative task. Very often they don't speak french well enough to understand clearly the administrative procedure. If you speak english it can be of a great  help since many refugees can speak english as well.",
                        "ar": "إذا كنتم تتقنون لغة أخرى فهذا قد يساعد جداً اللاجئين، خصوصا حينما يحتاجون التواصل عند القيام بالمهام الإدارية، إذ أنهم غالبا لا يتكلمون الفرنسية بشكل كاف يسمح لهم بفهم الإجراءات الإدارية بوضوح، فإذا كنتم تتكلمون الانجليزية مثلا، فذلك رائع! حيث معظم اللاجئيين تتكلم الانجليزية.",
                        "prs": "اگر آشنایی به یک زبان بیرونی دارید،‌ می تواند پناهندگان را خیلی کمک می کند، به ویژه در  پیشبرد امور اداری شان. حتا اگر به زبان انگلیسی دسترسی دارید می تواند پناهندگان را کمک زیاد نماید چون بیشتر پناهندگان با زبان انگلیسی آشنایی دارند"
                    },
                    "Support in studies": {
                        "fr": "Support dans les études",
                        "ar": "الدعم الدراسي",
                        "prs": "پشتیبانی در مطالعات"
                    },
                    "Explanations-support-in-studies": {
                        "fr": "Si vous maitriser un domaine tel que les mathématique, la physique, etc... Accepteriez vous d'aider un réfugié dans ses études ?",
                        "en": "if you master a domain like mathematic, physics, ... would you accept to help refugees in their studies ?",
                        "ar": "إذا كنتم تتقنون مجالا معيّناً كالرياضيات، أو الفيزياء... فهل تقبلون مساعدة اللاجئين في دراستهم ؟",
                        "prs": "اگر آشنایی در یک رشته خاص دارید مانند ریاضی، فیزیک و غیره، آیا می توانید یک پناهنده را در قسمت درس هایش کمک کنید؟"
                    }
                },
                "volunteers/meeting-requests": {
                    "I can answer to this request": {
                        "fr": "Je peux répondre à cette demande",
                        "ar": "أستطيع الردّ على هذا الطلب",
                        "prs": "می توانم به این درخواست پاسخ بگویم"
                    },
                    "I cannot answer to this request": {
                        "fr": "Je ne peux pas répondre à cette demande",
                        "ar": "لا أستطيع الردّ على هذا الطلب",
                        "prs": "نمی توانم به این درخواست پاسخ بگویم"
                    },
                    "View messages": {
                        "fr": "Voir les messages",
                        "ar": "رؤية الرسائل",
                        "prs": "دیدن پیام ها"
                    }
                }
            };
        }

        I18n.prototype.getMessage = function getMessage(page, key, language) {

            var message = this.messages[page] || this.messages["common"];

            if (!message) {
                return key;
            }
            var translations = message[key] || this.messages["common"][key];
            if (!translations) {
                return key;
            }
            return translations[language] || key;
        };

        return I18n;
    }();
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().globalResources('resources/elements/multiple-select').globalResources('resources/elements/gmap').globalResources('resources/elements/date-time-input').globalResources('resources/attributes/place-autocomplete').globalResources('resources/attributes/dynamic-text-align').globalResources('resources/attributes/always-visible').globalResources('resources/value-converters/object-keys-value-converter').globalResources('resources/value-converters/date-format-value-converter').feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      _environment2.default.apiEndpoint = "http://localhost:8080/api/";
      aurelia.use.plugin('aurelia-testing');
    } else {
      _environment2.default.apiEndpoint = "http://api.cpafrance.fr/";
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('moment-locales',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var FrLocale = exports.FrLocale = function () {
        function FrLocale() {
            _classCallCheck(this, FrLocale);

            this.months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
            this.monthsShort = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
            this.weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
            this.weekdaysShort = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
            this.weekdaysMin = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
            this.longDateFormat = {
                "LT": "HH:mm",
                "LTS": "HH:mm:ss",
                "L": "DD/MM/YYYY",
                "LL": "D MMMM YYYY",
                "LLL": "D MMMM YYYY LT",
                "LLLL": "dddd D MMMM YYYY LT"
            };
            this.calendar = {
                "sameDay": "[Aujourd'hui à] LT",
                "nextDay": '[Demain à] LT',
                "nextWeek": 'dddd [à] LT',
                "lastDay": '[Hier à] LT',
                "lastWeek": 'dddd [dernier à] LT',
                "sameElse": 'L'
            };
            this.relativeTime = {
                "future": "dans %s",
                "past": "il y a %s",
                "s": "quelques secondes",
                "m": "une minute",
                "mm": "%d minutes",
                "h": "une heure",
                "hh": "%d heures",
                "d": "un jour",
                "dd": "%d jours",
                "M": "un mois",
                "MM": "%d mois",
                "y": "une année",
                "yy": "%d années"
            };
            this.ordinalParse = "/\d{1,2}(er|ème)/";
            this.week = {
                "dow": 1,
                "doy": 4 };
        }

        FrLocale.prototype.ordinal = function ordinal(number) {
            return number + (number === 1 ? 'er' : 'ème');
        };

        FrLocale.prototype.isPM = function isPM(input) {
            return input.charAt(0) === "M";
        };

        FrLocale.prototype.meridiem = function meridiem(hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        };

        return FrLocale;
    }();

    ;

    var ArLocale = exports.ArLocale = function () {
        function ArLocale() {
            _classCallCheck(this, ArLocale);

            this.months = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"];
            this.monthsShort = ["كا ثاني.", "شبط.", "آذر", "نيس.", "أيا", "حزير", "تمو.", "آب", "أيلو.", "تش أول.", "تش ثاني.", "كا أول."];
            this.weekdays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
            this.weekdaysShort = ["أحد.", "اثن.", "ثلات.", "أرب.", "خمس.", "جمع.", "سبت."];
            this.weekdaysMin = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
            this.longDateFormat = {
                "LT": "HH:mm",
                "LTS": "HH:mm:ss",
                "L": "DD/MM/YYYY",
                "LL": "D MMMM YYYY",
                "LLL": "D MMMM YYYY LT",
                "LLLL": "dddd D MMMM YYYY LT"
            };
            this.calendar = {
                "sameDay": "[اليوم في] LT",
                "nextDay": '[غداً في] LT',
                "nextWeek": 'dddd [à] LT',
                "lastDay": '[البارحة في] LT',
                "lastWeek": 'dddd [dernier à] LT',
                "sameElse": 'L'
            };
            this.relativeTime = {
                "future": "dans %s",
                "past": "il y a %s",
                "s": "quelques secondes",
                "m": "une minute",
                "mm": "%d minutes",
                "h": "une heure",
                "hh": "%d heures",
                "d": "un jour",
                "dd": "%d jours",
                "M": "un mois",
                "MM": "%d mois",
                "y": "une année",
                "yy": "%d années"
            };
            this.ordinalParse = "/\d{1,2}(er|ème)/";
            this.week = {
                "dow": 1,
                "doy": 4 };
        }

        ArLocale.prototype.ordinal = function ordinal(number) {
            return number + (number === 1 ? 'er' : 'ème');
        };

        ArLocale.prototype.isPM = function isPM(input) {
            return input.charAt(0) === "M";
        };

        ArLocale.prototype.meridiem = function meridiem(hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        };

        return ArLocale;
    }();

    ;

    var PrsLocale = exports.PrsLocale = function () {
        function PrsLocale() {
            _classCallCheck(this, PrsLocale);

            this.months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
            this.monthsShort = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
            this.weekdays = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
            this.weekdaysShort = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
            this.weekdaysMin = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
            this.longDateFormat = {
                "LT": "HH:mm",
                "LTS": "HH:mm:ss",
                "L": "DD/MM/YYYY",
                "LL": "D MMMM YYYY",
                "LLL": "D MMMM YYYY LT",
                "LLLL": "dddd D MMMM YYYY LT"
            };
            this.calendar = {
                "sameDay": "[Aujourd'hui à] LT",
                "nextDay": '[Demain à] LT',
                "nextWeek": 'dddd [à] LT',
                "lastDay": '[Hier à] LT',
                "lastWeek": 'dddd [dernier à] LT',
                "sameElse": 'L'
            };
            this.relativeTime = {
                "future": "dans %s",
                "past": "il y a %s",
                "s": "quelques secondes",
                "m": "une minute",
                "mm": "%d minutes",
                "h": "une heure",
                "hh": "%d heures",
                "d": "un jour",
                "dd": "%d jours",
                "M": "un mois",
                "MM": "%d mois",
                "y": "une année",
                "yy": "%d années"
            };
            this.ordinalParse = "/\d{1,2}(er|ème)/";
            this.week = {
                "dow": 1,
                "doy": 4 };
        }

        PrsLocale.prototype.ordinal = function ordinal(number) {
            return number + (number === 1 ? 'er' : 'ème');
        };

        PrsLocale.prototype.isPM = function isPM(input) {
            return input.charAt(0) === "M";
        };

        PrsLocale.prototype.meridiem = function meridiem(hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        };

        return PrsLocale;
    }();

    ;
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('views/about',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var About = exports.About = function About() {
        _classCallCheck(this, About);
    };
});
define('views/home',['exports', 'aurelia-framework', 'aurelia-router', 'common', 'i18n'], function (exports, _aureliaFramework, _aureliaRouter, _common, _i18n) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Home = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Home = exports.Home = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _i18n.I18n, _aureliaRouter.Router), _dec(_class = function () {
        function Home(userDetails, i18nMessage, router) {
            _classCallCheck(this, Home);

            this.router = router;
            this.userDetails = userDetails;

            this.i18n = function (key, language) {
                return i18nMessage.getMessage("home", key, language || userDetails.language);
            };
            this.setUserDetails(null);
        }

        Home.prototype.setUserDetails = function setUserDetails(profile, languageKey) {
            this.userDetails.language = languageKey || "fr";

            this.userDetails.profile = profile;
            if (profile == "R") {
                this.router.navigateToRoute('refugees');
            } else if ((profile == "O" || profile == "V") && this.userDetails.account) {
                if (this.userDetails.account.accessKey.substring(0, 1) == "O" && profile == "O") {
                    this.router.navigateToRoute('organisations');
                } else if (this.userDetails.account.accessKey.substring(0, 1) == "V" && profile == "V") {
                    this.router.navigateToRoute('volunteers');
                }
            }
        };

        return Home;
    }()) || _class);
});
define('resources/attributes/always-visible',['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.AlwaysVisibleCustomAttribute = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var AlwaysVisibleCustomAttribute = exports.AlwaysVisibleCustomAttribute = (_dec = (0, _aureliaFramework.inject)(Element), _dec(_class = function () {
        function AlwaysVisibleCustomAttribute(element) {
            var _this = this;

            _classCallCheck(this, AlwaysVisibleCustomAttribute);

            this.element = element;

            this.scrollHandler = function () {
                if (window.pageYOffset > _this.initialPosition) {
                    _this.element.style.position = 'fixed';
                    _this.element.style.top = 0;

                    _this.element.style.width = '100%';
                    _this.element.style.boxSizing = 'border-box';
                } else {
                    _this.element.style.position = 'relative';
                }
            };
        }

        AlwaysVisibleCustomAttribute.prototype.attached = function attached() {
            this.initialPosition = this.element.getBoundingClientRect().top;
            window.onscroll = this.scrollHandler;
            window.addEventListener('scroll', this.scrollHandler, false);
        };

        AlwaysVisibleCustomAttribute.prototype.detached = function detached() {
            window.removeEventListener('scroll', this.scrollHandler, false);
        };

        return AlwaysVisibleCustomAttribute;
    }()) || _class);
});
define('resources/attributes/dynamic-text-align',['exports', 'aurelia-framework', 'common'], function (exports, _aureliaFramework, _common) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.RtlRightCustomAttribute = exports.RtlLeftCustomAttribute = exports.LtrRightCustomAttribute = exports.LtrLeftCustomAttribute = undefined;

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var _dec, _class, _dec2, _class2, _dec3, _class3, _dec4, _class4;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var AbstractDynamicTextAligner = function AbstractDynamicTextAligner(element, bindingEngine, userDetails, supportedLanguages, textAlignement) {
        _classCallCheck(this, AbstractDynamicTextAligner);

        if (supportedLanguages.includes(userDetails.language)) {
            element.style.textAlign = textAlignement;
        }
        bindingEngine.propertyObserver(userDetails, 'language').subscribe(function (newLanguage) {
            if (supportedLanguages.includes(newLanguage)) {
                element.style.textAlign = textAlignement;
            }
        });
    };

    var LtrLeftCustomAttribute = exports.LtrLeftCustomAttribute = (_dec = (0, _aureliaFramework.inject)(Element, _aureliaFramework.BindingEngine, _common.UserDetails), _dec(_class = function (_AbstractDynamicTextA) {
        _inherits(LtrLeftCustomAttribute, _AbstractDynamicTextA);

        function LtrLeftCustomAttribute(element, bindingEngine, userDetails) {
            _classCallCheck(this, LtrLeftCustomAttribute);

            return _possibleConstructorReturn(this, _AbstractDynamicTextA.call(this, element, bindingEngine, userDetails, ["en", "fr"], "left"));
        }

        return LtrLeftCustomAttribute;
    }(AbstractDynamicTextAligner)) || _class);
    var LtrRightCustomAttribute = exports.LtrRightCustomAttribute = (_dec2 = (0, _aureliaFramework.inject)(Element, _aureliaFramework.BindingEngine, _common.UserDetails), _dec2(_class2 = function (_AbstractDynamicTextA2) {
        _inherits(LtrRightCustomAttribute, _AbstractDynamicTextA2);

        function LtrRightCustomAttribute(element, bindingEngine, userDetails) {
            _classCallCheck(this, LtrRightCustomAttribute);

            return _possibleConstructorReturn(this, _AbstractDynamicTextA2.call(this, element, bindingEngine, userDetails, ["en", "fr"], "right"));
        }

        return LtrRightCustomAttribute;
    }(AbstractDynamicTextAligner)) || _class2);
    var RtlLeftCustomAttribute = exports.RtlLeftCustomAttribute = (_dec3 = (0, _aureliaFramework.inject)(Element, _aureliaFramework.BindingEngine, _common.UserDetails), _dec3(_class3 = function (_AbstractDynamicTextA3) {
        _inherits(RtlLeftCustomAttribute, _AbstractDynamicTextA3);

        function RtlLeftCustomAttribute(element, bindingEngine, userDetails) {
            _classCallCheck(this, RtlLeftCustomAttribute);

            return _possibleConstructorReturn(this, _AbstractDynamicTextA3.call(this, element, bindingEngine, userDetails, ["prs", "ar"], "left"));
        }

        return RtlLeftCustomAttribute;
    }(AbstractDynamicTextAligner)) || _class3);
    var RtlRightCustomAttribute = exports.RtlRightCustomAttribute = (_dec4 = (0, _aureliaFramework.inject)(Element, _aureliaFramework.BindingEngine, _common.UserDetails), _dec4(_class4 = function (_AbstractDynamicTextA4) {
        _inherits(RtlRightCustomAttribute, _AbstractDynamicTextA4);

        function RtlRightCustomAttribute(element, bindingEngine, userDetails) {
            _classCallCheck(this, RtlRightCustomAttribute);

            return _possibleConstructorReturn(this, _AbstractDynamicTextA4.call(this, element, bindingEngine, userDetails, ["prs", "ar"], "right"));
        }

        return RtlRightCustomAttribute;
    }(AbstractDynamicTextAligner)) || _class4);
});
define('resources/attributes/place-autocomplete',['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PlaceAutocompleteCustomAttribute = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

    var PlaceAutocompleteCustomAttribute = exports.PlaceAutocompleteCustomAttribute = (_dec = (0, _aureliaFramework.inject)(Element), _dec(_class = (_class2 = function () {
        function PlaceAutocompleteCustomAttribute(element) {
            _classCallCheck(this, PlaceAutocompleteCustomAttribute);

            _initDefineProp(this, 'target', _descriptor, this);

            _initDefineProp(this, 'userSelectionBinding', _descriptor2, this);

            _initDefineProp(this, 'targetProperty', _descriptor3, this);

            _initDefineProp(this, 'restrictions', _descriptor4, this);

            this.element = element;
        }

        PlaceAutocompleteCustomAttribute.prototype.created = function created() {
            if (!this.restrictions) {
                this.restrictions = ["geocode"];
            } else if (this.restrictions == 'regions') {
                this.restrictions = ["(regions)"];
            }
        };

        PlaceAutocompleteCustomAttribute.prototype.attached = function attached() {
            var _this = this;

            google.maps.event.addDomListener(this.element, 'keydown', function (e) {
                if (e.keyCode == 13) {
                    console.log('enter');
                    e.preventDefault();
                }
            });

            var options = {
                types: this.restrictions,
                componentRestrictions: { country: "fr" }
            };
            this.autocomplete = new google.maps.places.Autocomplete(this.element, options);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var geolocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    var circle = new google.maps.Circle({
                        center: geolocation,
                        radius: position.coords.accuracy
                    });
                    _this.autocomplete.setBounds(circle.getBounds());
                });
            }
            this.targetProperty = [this.targetProperty || "address"];
            if (this.target[this.targetProperty] && this.target[this.targetProperty].formattedAddress) {
                this.element.value = this.target[this.targetProperty].formattedAddress;
            }

            this.autocomplete.addListener('place_changed', function () {
                var place = _this.autocomplete.getPlace();
                var googleObject = { formatted_address: place.formatted_address, placeId: place.place_id };

                place.address_components.forEach(function (x) {
                    var googlePropertyName = x.types[0];
                    googleObject[googlePropertyName] = x["short_name"];
                });
                googleObject.lat = place.geometry.location.lat();
                googleObject.lng = place.geometry.location.lng();

                var appPlace = {};
                appPlace.formattedAddress = googleObject.formatted_address;

                if (googleObject.street_number || googleObject.route) {
                    appPlace.street1 = googleObject.street_number ? googleObject.street_number + " " + googleObject.route : googleObject.route;
                }
                if (googleObject.postal_code) {
                    appPlace.postalCode = googleObject.postal_code;
                }
                appPlace.locality = googleObject.locality.indexOf("Paris-") == 0 ? "Paris" : googleObject.locality;
                appPlace.country = googleObject.country == "FR" ? "France" : googleObject.country;

                appPlace.lat = googleObject.lat;
                appPlace.lng = googleObject.lng;
                appPlace.googleMapId = googleObject.placeId;

                _this.target[_this.targetProperty] = appPlace;
                if (_this.userSelectionBinding) {
                    _this.element.value = appPlace[_this.userSelectionBinding];
                }
            });
        };

        return PlaceAutocompleteCustomAttribute;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'target', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'userSelectionBinding', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'targetProperty', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'restrictions', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('resources/elements/date-time-input',['exports', 'aurelia-framework', 'moment'], function (exports, _aureliaFramework, _moment) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.DateTimeInputCustomElement = undefined;

    var _moment2 = _interopRequireDefault(_moment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2;

    var DateTimeInputCustomElement = exports.DateTimeInputCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaFramework.BindingEngine), _dec(_class = (_class2 = function () {
        function DateTimeInputCustomElement(bindingEngine) {
            _classCallCheck(this, DateTimeInputCustomElement);

            _initDefineProp(this, 'target', _descriptor, this);

            _initDefineProp(this, 'targetProperty', _descriptor2, this);

            this.bindingEngine = bindingEngine;
        }

        DateTimeInputCustomElement.prototype.attached = function attached() {
            var _this = this;

            if (this.target && this.targetProperty) {
                var value = this.target[this.targetProperty];
                this.time = (0, _moment2.default)(value).format("HH:mm");
                this.date = (0, _moment2.default)(value).format("YYYY-MM-DD");
            }
            this.bindingEngine.propertyObserver(this, 'date').subscribe(function (newDate) {
                _this.date = newDate;
                if (_this.date && _this.time) {
                    _this.target[_this.targetProperty] = (0, _moment2.default)(_this.date + ' ' + _this.time, "YYYY/MM/DD HH:mm").toDate();
                }
            });
            this.bindingEngine.propertyObserver(this, 'time').subscribe(function (newTime) {
                _this.time = newTime;
                if (_this.date && _this.time) {
                    _this.target[_this.targetProperty] = (0, _moment2.default)(_this.date + ' ' + _this.time, "YYYY/MM/DD HH:mm").toDate();
                }
            });
        };

        return DateTimeInputCustomElement;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'target', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'targetProperty', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('resources/elements/gmap',['exports', 'aurelia-framework'], function (exports, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.GmapCustomElement = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2;

    var GmapCustomElement = exports.GmapCustomElement = (_dec = (0, _aureliaFramework.inject)(Element), _dec(_class = (_class2 = function () {
        function GmapCustomElement(element) {
            _classCallCheck(this, GmapCustomElement);

            this.markers = [];

            _initDefineProp(this, 'center', _descriptor, this);

            _initDefineProp(this, 'places', _descriptor2, this);

            this.element = element;
        }

        GmapCustomElement.prototype.placesChanged = function placesChanged() {
            this.showPlaces();
        };

        GmapCustomElement.prototype.showPlaces = function showPlaces() {
            for (var _iterator = this.places, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var p = _ref;

                var myLatLng = { lat: p.item.address.lat, lng: p.item.address.lng };
                var _marker = new google.maps.Marker({ position: myLatLng, map: this.googleMap, title: p.item.organisation });
                this.markers.push(_marker);
            }
            if (this.googleMap) {
                    var newBoundary = new google.maps.LatLngBounds();
                    for (var _iterator2 = this.markers, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                        var _ref2;

                        if (_isArray2) {
                            if (_i2 >= _iterator2.length) break;
                            _ref2 = _iterator2[_i2++];
                        } else {
                            _i2 = _iterator2.next();
                            if (_i2.done) break;
                            _ref2 = _i2.value;
                        }

                        var marker = _ref2;

                        newBoundary.extend(marker.position);
                    }
                    this.googleMap.fitBounds(newBoundary);
                }
        };

        GmapCustomElement.prototype.attached = function attached() {
            var mapDiv = this.element.getElementsByTagName("div")[0];
            var center = this.center ? { lat: this.center.lat, lng: this.center.lng } : { lat: 48.866667, lng: 2.333333 };
            this.googleMap = new google.maps.Map(mapDiv, { center: center, zoom: 8 });
            this.showPlaces();
        };

        return GmapCustomElement;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'center', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'places', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('resources/elements/multiple-select',["exports", "aurelia-framework"], function (exports, _aureliaFramework) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MultipleSelectCustomElement = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3;

    var MultipleSelectCustomElement = exports.MultipleSelectCustomElement = (_dec = (0, _aureliaFramework.inject)(Element), _dec(_class = (_class2 = function () {
        function MultipleSelectCustomElement(element) {
            _classCallCheck(this, MultipleSelectCustomElement);

            _initDefineProp(this, "placeholder", _descriptor, this);

            _initDefineProp(this, "source", _descriptor2, this);

            _initDefineProp(this, "selection", _descriptor3, this);

            this.element = element;
        }

        MultipleSelectCustomElement.prototype.clear = function clear() {
            this.source.forEach(function (x) {
                return x.selected = false;
            });
            this.selection.splice(0, this.selection.length);
            this.input.value = this.selection.join(", ");
        };

        MultipleSelectCustomElement.prototype.click = function click(e) {
            e.selected = !e.selected;

            if (e.selected) {
                this.selection.push(e.item.name);
            } else {
                this.selection.splice(this.selection.indexOf(e.item.name), 1);
            }
            this.input.value = this.selection.join(", ");
        };

        MultipleSelectCustomElement.prototype.attached = function attached() {
            var _this = this;

            this.input = this.element.children[0];
            this.ul = this.element.children[1];

            if (this.selection == null) {
                this.selection = [];
            }
            this.source = this.source.map(function (x) {
                return { item: x, selected: _this.selection.indexOf(x.name) >= 0 };
            });
            this.input.value = this.selection.join(", ");

            this.ul.style.width = this.input.getBoundingClientRect().width + "px";
            this.ul.style.display = "none";

            this.input.addEventListener("focus", this.input.blur);

            this.inputClickEventListener = function (e) {
                _this.input.blur();
                _this.ul.style.display = _this.ul.style.display == "block" ? "none" : "block";
            };

            this.input.addEventListener("click", this.inputClickEventListener);

            this.bodyClickEventListener = function (e) {
                if (e.target.parentNode != _this.ul && e.target != _this.input) {
                    _this.ul.style.display = "none";
                }
            };
            document.body.addEventListener('click', this.bodyClickEventListener);
        };

        MultipleSelectCustomElement.prototype.detached = function detached() {
            document.body.removeEventListener('click', this.clickEventListener);
            this.input.removeEventListener("click", this.inputClickEventListener);
        };

        return MultipleSelectCustomElement;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "source", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "selection", [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('resources/value-converters/date-format-value-converter',['exports', 'common', 'aurelia-framework', 'moment', 'moment-locales'], function (exports, _common, _aureliaFramework, _moment, _momentLocales) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MyDateFormatValueConverter = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var MyDateFormatValueConverter = exports.MyDateFormatValueConverter = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _momentLocales.FrLocale, _momentLocales.ArLocale, _momentLocales.PrsLocale), _dec(_class = function () {
    function MyDateFormatValueConverter(userDetails, frLocale, arLocale, prsLocale) {
      _classCallCheck(this, MyDateFormatValueConverter);

      this.formaters = { event: "D/M/YYYY h:mm:ss a" };
      this.defaultFormat = "D/M/YYYY";

      this.userDetails = userDetails;
      _moment2.default.locale("fr", frLocale);
      _moment2.default.locale("ar", arLocale);
      _moment2.default.locale("prs", prsLocale);
    }

    MyDateFormatValueConverter.prototype.toView = function toView(value, format) {
      var locale = _moment2.default.locales().includes(this.userDetails.language) ? this.userDetails.language : "en";
      if (format != null) {
        return (0, _moment2.default)(value).locale(locale).format(format);
      } else {
        var formater = this.formaters[format];
        return (0, _moment2.default)(value).locale(locale).format(formater || this.defaultFormat);
      }
    };

    return MyDateFormatValueConverter;
  }()) || _class);
});
define('resources/value-converters/object-keys-value-converter',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var ObjectKeysValueConverter = exports.ObjectKeysValueConverter = function () {
    function ObjectKeysValueConverter() {
      _classCallCheck(this, ObjectKeysValueConverter);
    }

    ObjectKeysValueConverter.prototype.toView = function toView(value) {
      return value == null ? null : Object.keys(value);
    };

    return ObjectKeysValueConverter;
  }();

  ;
});
define('views/_components/sign-in-form',['exports', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-router', 'common', 'i18n'], function (exports, _aureliaFramework, _aureliaFetchClient, _aureliaRouter, _common, _i18n) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SignInForm = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor;

    var SignInForm = exports.SignInForm = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaRouter.Router, _aureliaFramework.BindingEngine, _common.UserDetails, _i18n.I18n), _dec(_class = (_class2 = function () {
        SignInForm.prototype.initialize = function initialize() {
            this.action = "sign-in";
            this.input = { realm: this.userDetails.profile };
            this.rememberMe = false;
            this.outcome = null;
        };

        function SignInForm(httpClient, router, bindingEngine, userDetails, i18nMessages) {
            var _this = this;

            _classCallCheck(this, SignInForm);

            _initDefineProp(this, 'successRoute', _descriptor, this);

            console.log("inside ctor");
            this.httpClient = httpClient;
            this.router = router;
            this.userDetails = userDetails;

            this.i18n = function (key) {
                return i18nMessages.getMessage("sign-in", key, userDetails.language);
            };

            bindingEngine.propertyObserver(userDetails, 'account').subscribe(function (newValue, oldValue) {
                if (newValue == null) {
                    _this.initialize();
                }
            });
        }

        SignInForm.prototype.attached = function attached() {
            this.initialize();
        };

        SignInForm.prototype.processSignIn = function processSignIn() {
            var _this2 = this;

            this.httpClient.fetch("authentication", { method: "POST", body: (0, _aureliaFetchClient.json)(this.input) }).then(function (x) {
                return x.json();
            }).then(function (account) {

                _this2.userDetails.account = account;
                if (_this2.userDetails.rememberMe) {
                    localStorage.setItem("accessKey", account.accessKey);
                }
                _this2.action = null;

                if (_this2.successRoute) {
                    _this2.router.navigate(_this2.successRoute);
                }
            }).catch(function (e) {
                if (e.status == 401) {
                    _this2.outcome = { status: "unauthorized" };
                } else {
                    e.json().then(function (x) {
                        return _this2.outcome = { status: "failure", errors: x };
                    });
                }
            });
        };

        SignInForm.prototype.retrySignIn = function retrySignIn() {
            this.outcome = null;
            this.action = "sign-in";
            this.input.password = null;
        };

        SignInForm.prototype.startPasswordRecoveryRequest = function startPasswordRecoveryRequest() {
            this.action = "recover-password";
            this.input.password = null;
            this.outcome = null;
        };

        SignInForm.prototype.processPasswordRecoveryRequest = function processPasswordRecoveryRequest() {
            var _this3 = this;

            this.httpClient.fetch("authz/passwordRecovery", { method: "POST", body: (0, _aureliaFetchClient.json)(this.input) }).then(function () {
                return _this3.outcome = { status: "accepted" };
            });
        };

        SignInForm.prototype.cancelSignIn = function cancelSignIn() {
            this.authz.action = null;
        };

        return SignInForm;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'successRoute', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: function initializer() {
            return null;
        }
    })), _class2)) || _class);
});
define('views/_components/user-form',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-router', 'aurelia-fetch-client'], function (exports, _common, _i18n, _aureliaFramework, _aureliaRouter, _aureliaFetchClient) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.UserForm = undefined;

    function _initDefineProp(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
        });
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function (key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function (desc, decorator) {
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
    }

    var _dec, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;

    var UserForm = exports.UserForm = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaRouter.Router, _aureliaFramework.CompositionTransaction, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = (_class2 = function () {
        function UserForm(fetchClient, router, compositionTransaction, userDetails, referenceData, i18nMessages) {
            _classCallCheck(this, UserForm);

            _initDefineProp(this, 'showCredentials', _descriptor, this);

            _initDefineProp(this, 'showDetails', _descriptor2, this);

            _initDefineProp(this, 'showIdentity', _descriptor3, this);

            _initDefineProp(this, 'successRoute', _descriptor4, this);

            _initDefineProp(this, 'action', _descriptor5, this);

            this.input = { languages: [] };

            this.fetchClient = fetchClient;
            this.router = router;
            this.userDetails = userDetails;
            this.referenceData = referenceData;
            this.i18n = function (key) {
                return i18nMessages.getMessage("user-form", key, userDetails.language);
            };

            this.compositionTransactionNotifier = compositionTransaction.enlist();
        }

        UserForm.prototype.created = function created() {
            var _this = this;

            if (this.userDetails.account && this.userDetails.account.accessKey) {
                var uri = void 0;
                if (this.userDetails.account.profile == "R") {
                    uri = "refugees/" + this.userDetails.account.id;;
                } else if (this.userDetails.account.profile == "O") {
                    uri = "organisations/" + this.userDetails.account.id;;
                }
                if (this.userDetails.account.profile == "V") {
                    uri = "volunteers/" + this.userDetails.account.id;;
                }
                if (!uri) return;
                this.fetchClient.fetch(uri).then(function (x) {
                    return x.json();
                }).then(function (x) {
                    _this.input = x;
                    _this.compositionTransactionNotifier.done();
                });
            } else {
                this.compositionTransactionNotifier.done();
            }
        };

        UserForm.prototype.attached = function attached() {
            if (!this.userDetails.account) {
                this.input = { languages: [] };
            }
            this.outcome = null;
            this.showCredentials = this.showCredentials === true || "true" == this.showCredentials;
            this.showDetails = this.showDetails === true || "true" == this.showDetails;
            this.showIdentity = this.showIdentity === true || "true" == this.showIdentity;
        };

        UserForm.prototype.signUp = function signUp() {
            var _this2 = this;

            this.state = "saving";
            var uri = this.userDetails.profile == "R" ? "refugees" : "volunteers";
            this.fetchClient.fetch(uri, { body: (0, _aureliaFetchClient.json)(this.input), method: "post" }).then(function (x) {
                return x.json();
            }).then(function (account) {
                _this2.state = null;
                _this2.userDetails.account = account;
                localStorage.setItem("accessKey", account.accessKey);
                _this2.userDetails.lastAction = "sign-up";
                if (_this2.successRoute) {
                    _this2.router.navigate(_this2.successRoute);
                } else {
                    _this2.outcome = { status: "ok" };
                }
            }).catch(function (e) {
                _this2.state = null;
                if (e.status == 409) {
                    _this2.outcome = { status: "conflict" };
                } else {
                    e.json().then(function (x) {
                        return _this2.outcome = { status: "failure", errors: x };
                    });
                }
            });
        };

        UserForm.prototype.updateProfile = function updateProfile() {
            var _this3 = this;

            this.state = "saving";
            var uri = (this.userDetails.account.profile == "R" ? "refugees" : "volunteers") + '/' + this.userDetails.account.id;
            this.fetchClient.fetch(uri, { body: (0, _aureliaFetchClient.json)(this.input), method: "put" }).then(function (x) {
                _this3.state = null;
                _this3.outcome = { status: "ok" };
                if (_this3.userDetails.lastAction == "sign-up") {
                    _this3.userDetails.lastAction = "update-profile";
                }
            }).catch(function (e) {
                _this3.state = null;
                if (e.status == 409) {
                    _this3.outcome = { status: "conflict" };
                } else {
                    return e.json().then(function (x) {
                        return _this3.outcome = { status: "failure", errors: x };
                    });
                }
            });
        };

        return UserForm;
    }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'showCredentials', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'showDetails', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'showIdentity', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'successRoute', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'action', [_aureliaFramework.bindable], {
        enumerable: true,
        initializer: null
    })), _class2)) || _class);
});
define('views/organisations/index',['exports', 'common', 'aurelia-framework', 'i18n'], function (exports, _common, _aureliaFramework, _i18n) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Index = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Index = exports.Index = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _i18n.I18n), _dec(_class = function () {
    function Index(userDetails, i18nMessages) {
      _classCallCheck(this, Index);

      if (userDetails.profile == null) {
        userDetails.profile = "O";
      }
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.i18n = function (key) {
        return i18nMessages.getMessage("organisations/index", key, userDetails.language);
      };
    }

    Index.prototype.configureRouter = function configureRouter(config, router) {
      config.map([{ route: '', name: 'organisations/welcome', moduleId: 'views/organisations/welcome', nav: true, title: 'Organisation > Index' }, { route: 'teachings', name: 'organisations/teachings', moduleId: 'views/organisations/teachings/teachings', nav: true, title: 'Enseignements supérieurs' }, { route: 'language-programs', name: 'organisations/language-programs', moduleId: 'views/organisations/language-programs/language-programs', nav: true, title: 'Apprentissage du français' }, { route: 'professional-programs', name: 'organisations/professional-programs', moduleId: 'views/organisations/professional-programs/professional-programs', nav: true, title: 'Apprentissage du français' }, { route: 'workshops', name: 'organisations/workshops', moduleId: 'views/organisations/workshops/workshops', nav: true, title: 'Ateliers socio linguistiques' }, { route: 'libraries', name: 'organisations/libraries', moduleId: 'views/organisations/libraries/libraries', nav: true, title: 'Auto apprentissage' }, { route: 'events', name: 'organisations/events', moduleId: 'views/organisations/events/events', nav: true, title: 'Evenements' }, { route: 'profile', name: 'organisations/profile', moduleId: 'views/organisations/profile/profile', nav: true, title: 'Profil' }]);

      this.router = router;
    };

    return Index;
  }()) || _class);
});
define('views/organisations/welcome',['exports', 'common', 'i18n', 'aurelia-framework'], function (exports, _common, _i18n, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Welcome = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Welcome = exports.Welcome = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _i18n.I18n), _dec(_class = function Welcome(userDetails, i18nMessages) {
        _classCallCheck(this, Welcome);

        this.i18n = function (key) {
            return i18nMessages.getMessage("organisations/welcome", key, userDetails.language);
        };
    }) || _class);
});
define('views/refugees/index',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-templating-resources'], function (exports, _common, _i18n, _aureliaFramework, _aureliaTemplatingResources) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Index = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Index = exports.Index = (_dec = (0, _aureliaFramework.inject)(_aureliaTemplatingResources.BindingSignaler, _aureliaFramework.BindingEngine, _common.UserDetails, _i18n.I18n), _dec(_class = function () {
    function Index(bindingSignaler, bindingEngine, userDetails, i18nMessages) {
      _classCallCheck(this, Index);

      if (userDetails.profile == null) {
        userDetails.profile = "R";
      }
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/index", key, userDetails.language);
      };
    }

    Index.prototype.configureRouter = function configureRouter(config, router) {
      config.map([{ route: '', name: 'refugees/welcome', moduleId: 'views/refugees/welcome', nav: true, title: 'Index' }, { route: 'teachings', name: 'refugees/teachings', moduleId: 'views/refugees/teachings/teachings', nav: true, title: 'Enseignements supérieurs' }, { route: 'language-programs', name: 'refugees/language-programs', moduleId: 'views/refugees/language-programs/language-programs', nav: true, title: 'Apprentissage du français' }, { route: 'professional-programs', name: 'refugees/professional-programs', moduleId: 'views/refugees/professional-programs/professional-programs', nav: true, title: 'Apprentissage du français' }, { route: 'workshops', name: 'refugees/workshops', moduleId: 'views/refugees/workshops/workshops', nav: true, title: 'Ateliers socio linguistiques' }, { route: 'self-teaching', name: 'refugees/self-teaching', moduleId: 'views/refugees/self-teaching/self-teaching', nav: true, title: 'Auto apprentissage' }, { route: 'events', name: 'refugees/events', moduleId: 'views/refugees/events/events', nav: true, title: 'Evenements' }, { route: 'meeting-requests', name: 'refugees/meeting-requests', moduleId: 'views/refugees/meeting-requests/meeting-requests', nav: true, title: 'Demande de rendez vous' }, { route: 'profile', name: 'refugees/profile', moduleId: 'views/refugees/profile/profile', nav: true, title: 'Profile' }]);

      this.router = router;
    };

    return Index;
  }()) || _class);
});
define('views/refugees/welcome',['exports', 'common', 'i18n', 'aurelia-framework'], function (exports, _common, _i18n, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Welcome = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Welcome = exports.Welcome = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _i18n.I18n), _dec(_class = function Welcome(userDetails, i18nMessages) {
        _classCallCheck(this, Welcome);

        this.i18n = function (key) {
            return i18nMessages.getMessage("refugees/welcome", key, userDetails.language);
        };
    }) || _class);
});
define('views/volunteers/index',['exports', 'aurelia-framework', 'common'], function (exports, _aureliaFramework, _common) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Index = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Index = exports.Index = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails), _dec(_class = function () {
    function Index(userDetails) {
      _classCallCheck(this, Index);

      if (userDetails.profile == null) {
        userDetails.profile = "R";
      }
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
    }

    Index.prototype.configureRouter = function configureRouter(config, router) {
      config.map([{ route: '', name: 'volunteers/welcome', moduleId: 'views/volunteers/welcome', nav: true, title: 'Accueil' }, { route: 'events', name: 'volunteers/events', moduleId: 'views/volunteers/events/events', nav: true, title: 'Evenements' }, { route: 'availabilities', name: 'volunteers/availabilities', moduleId: 'views/volunteers/availabilities/availabilities', nav: true, title: 'Disponibilités' }, { route: 'profile', name: 'volunteers/profile', moduleId: 'views/volunteers/profile/profile', nav: true, title: 'Profil' }, { route: 'meeting-requests', name: 'volunteers/meeting-requests', moduleId: 'views/volunteers/meeting-requests/meeting-requests', nav: true, title: 'Demande de rendez vous' }]);

      this.router = router;
    };

    return Index;
  }()) || _class);
});
define('views/volunteers/welcome',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Welcome = exports.Welcome = function () {
        function Welcome() {
            _classCallCheck(this, Welcome);

            this.firstTime = false;
        }

        Welcome.prototype.activate = function activate(params) {
            if (params.firstTime) {
                this.firstTime = params.firstTime;
            }
        };

        return Welcome;
    }();
});
define('views/organisations/events/events',['exports', 'common', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-event-aggregator', 'i18n', 'moment'], function (exports, _common, _aureliaFramework, _aureliaFetchClient, _aureliaEventAggregator, _i18n, _moment) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Events = undefined;

    var _moment2 = _interopRequireDefault(_moment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Events = exports.Events = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaEventAggregator.EventAggregator, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
        function Events(fetchClient, ea, userDetails, referenceData, i18nMessages) {
            _classCallCheck(this, Events);

            this.results = [];
            this.filter = { includePastEvents: false, includeFutureEvents: true };

            this.fetchClient = fetchClient;
            this.ea = ea;
            this.userDetails = userDetails;
            this.moment = _moment2.default;
            this.viewLocation = _common.viewLocation;
            this.referenceData = referenceData;
            this.i18n = function (key) {
                return i18nMessages.getMessage("organisations/events", key, userDetails.language);
            };
        }

        Events.prototype.created = function created() {
            this.filter.organisationId = this.userDetails.account.id;
            this.find();
        };

        Events.prototype.find = function find(language) {
            var _this = this;

            this.fetchClient.fetch((0, _common.getUri)("events", this.filter)).then(function (response) {
                return response.json();
            }).then(function (list) {
                return _this.results = list.map(function (x) {
                    return { item: x, action: null };
                });
            });
        };

        Events.prototype.new = function _new() {
            if (this.results.length == 0 || this.results[0].action != 'new') {
                this.results.unshift({ item: {}, action: 'new' });
            }
        };

        Events.prototype.save = function save(model) {
            var _this2 = this;

            model.state = "saving";

            var afterSave = function afterSave(responseBody) {
                model.action = null;
                model.state = null;
                model.errors = null;
                if (responseBody) {
                    model.item = responseBody;
                }
                _this2.ea.publish("referenceDataUpdate", { domain: "cities" });
            };

            if (model.action == 'new') {
                this.fetchClient.fetch("events", { method: "POST", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
                    return response.json();
                }).then(function (x) {
                    return afterSave(x);
                }).catch(function (e) {
                    return e.json().then(function (x) {
                        return model.errors = x;
                    });
                });
            } else {
                this.fetchClient.fetch('events/' + model.item.id, { method: "PUT", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
                    return afterSave();
                }).catch(function (e) {
                    return e.json().then(function (x) {
                        return model.errors = x;
                    });
                });
            }
        };

        Events.prototype.delete = function _delete(model) {
            var _this3 = this;

            var afterDelete = function afterDelete() {
                _this3.results.splice(_this3.results.indexOf(model), 1);
                _this3.ea.publish("referenceDataUpdate", { domain: "cities" });
            };
            this.fetchClient.fetch('events/' + model.item.id, { method: "DELETE" }).then(function (response) {
                return afterDelete();
            });
        };

        Events.prototype.cancelAction = function cancelAction(obj) {
            if (obj.action == 'edit' || obj.action == 'delete') {
                obj.action = null;
                obj.state = null;
            } else if (obj.action == 'new') {
                this.results.splice(0, 1);
            }
        };

        return Events;
    }()) || _class);
});
define('views/organisations/language-programs/language-programs',['exports', 'common', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-event-aggregator', 'i18n', 'moment'], function (exports, _common, _aureliaFramework, _aureliaFetchClient, _aureliaEventAggregator, _i18n, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LanguagePrograms = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var LanguagePrograms = exports.LanguagePrograms = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaEventAggregator.EventAggregator, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
    function LanguagePrograms(fetchClient, ea, userDetails, referenceData, i18nMessages) {
      _classCallCheck(this, LanguagePrograms);

      this.filter = { includeFutureEvents: true, includePastEvents: false };
      this.results = [];

      this.fetchClient = fetchClient;
      this.ea = ea;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.referenceData = referenceData;
      this.i18n = function (key) {
        return i18nMessages.getMessage("organisations/language-programs", key, userDetails.language);
      };
    }

    LanguagePrograms.prototype.created = function created() {
      this.filter.organisationId = this.userDetails.account.id;
      this.find();
    };

    LanguagePrograms.prototype.find = function find() {
      var _this = this;

      this.fetchClient.fetch((0, _common.getUri)("learnings/language-programs", this.filter)).then(function (response) {
        return response.json();
      }).then(function (list) {
        return _this.results = list.map(function (x) {
          return { item: x, action: null };
        });
      });
    };

    LanguagePrograms.prototype.new = function _new() {
      if (this.results.length == 0 || this.results[0].action != 'new') {
        this.results.unshift({ item: {}, action: 'new' });
      }
    };

    LanguagePrograms.prototype.save = function save(model) {
      var _this2 = this;

      model.state = "saving";
      var afterSave = function afterSave(responseBody) {
        model.action = null;
        model.state = null;
        model.errors = null;
        if (responseBody) {
          model.item = responseBody;
        }
        _this2.ea.publish("referenceDataUpdate", { domain: "cities" });
      };

      if (model.action == 'new') {
        this.fetchClient.fetch("learnings/language-programs", { method: "POST", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return response.json();
        }).then(function (x) {
          return afterSave(x);
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      } else {
        this.fetchClient.fetch("learnings/language-programs/" + model.item.id, { method: "PUT", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return afterSave();
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      }
    };

    LanguagePrograms.prototype.delete = function _delete(model) {
      var _this3 = this;

      var afterDelete = function afterDelete() {
        _this3.results.splice(_this3.results.indexOf(model), 1);
        _this3.ea.publish("referenceDataUpdate", { domain: "cities" });
      };
      this.fetchClient.fetch("learnings/language-programs/" + model.item.id, { method: "DELETE" }).then(function (response) {
        return afterDelete();
      });
    };

    LanguagePrograms.prototype.cancelAction = function cancelAction(obj) {
      if (obj.action == 'edit' || obj.action == 'delete') {
        obj.action = null;
        obj.state = null;
      } else if (obj.action == 'new') {
        this.results.splice(0, 1);
      }
    };

    return LanguagePrograms;
  }()) || _class);
});
define('views/organisations/professional-programs/professional-programs',['exports', 'common', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-event-aggregator', 'i18n', 'moment'], function (exports, _common, _aureliaFramework, _aureliaFetchClient, _aureliaEventAggregator, _i18n, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ProfessionalPrograms = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var ProfessionalPrograms = exports.ProfessionalPrograms = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaEventAggregator.EventAggregator, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
    function ProfessionalPrograms(fetchClient, ea, userDetails, referenceData, i18nMessages) {
      _classCallCheck(this, ProfessionalPrograms);

      this.filter = { includeFutureEvents: true, includePastEvents: false };
      this.results = [];

      this.fetchClient = fetchClient;
      this.ea = ea;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.referenceData = referenceData;
      this.i18n = function (key) {
        return i18nMessages.getMessage("organisations/professional-programs", key, userDetails.language);
      };
    }

    ProfessionalPrograms.prototype.created = function created() {
      this.filter.organisationId = this.userDetails.account.id;
      this.find();
    };

    ProfessionalPrograms.prototype.find = function find() {
      var _this = this;

      this.fetchClient.fetch((0, _common.getUri)("learnings/professional-programs", this.filter)).then(function (response) {
        return response.json();
      }).then(function (list) {
        return _this.results = list.map(function (x) {
          return { item: x, action: null };
        });
      });
    };

    ProfessionalPrograms.prototype.new = function _new() {
      if (this.results.length == 0 || this.results[0].action != 'new') {
        this.results.unshift({ item: {}, action: 'new' });
      }
    };

    ProfessionalPrograms.prototype.save = function save(model) {
      var _this2 = this;

      model.state = "saving";
      var afterSave = function afterSave(responseBody) {
        model.action = null;
        model.state = null;
        model.errors = null;
        if (responseBody) {
          model.item = responseBody;
        }
        _this2.ea.publish("referenceDataUpdate", { domain: "cities" });
      };

      if (model.action == 'new') {
        this.fetchClient.fetch("learnings/professional-programs", { method: "POST", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return response.json();
        }).then(function (x) {
          return afterSave(x);
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      } else {
        this.fetchClient.fetch("learnings/professional-programs/" + model.item.id, { method: "PUT", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return afterSave();
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      }
    };

    ProfessionalPrograms.prototype.delete = function _delete(model) {
      var _this3 = this;

      var afterDelete = function afterDelete() {
        _this3.results.splice(_this3.results.indexOf(model), 1);
        _this3.ea.publish("referenceDataUpdate", { domain: "cities" });
      };
      this.fetchClient.fetch("learnings/professional-programs/" + model.item.id, { method: "DELETE" }).then(function (response) {
        return afterDelete();
      });
    };

    ProfessionalPrograms.prototype.cancelAction = function cancelAction(obj) {
      if (obj.action == 'edit' || obj.action == 'delete') {
        obj.action = null;
        obj.state = null;
      } else if (obj.action == 'new') {
        this.results.splice(0, 1);
      }
    };

    return ProfessionalPrograms;
  }()) || _class);
});
define('views/organisations/profile/profile',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Profile = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Profile = exports.Profile = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
        function Profile(fetchClient, userDetails, referenceData, i18nMessages) {
            _classCallCheck(this, Profile);

            this.fetchClient = fetchClient;
            this.referenceData = referenceData;
            this.userDetails = userDetails;

            this.i18n = function (key) {
                return i18nMessages.getMessage("organisations/profile", key, userDetails.language);
            };
        }

        Profile.prototype.created = function created() {
            var _this = this;

            var uri = "organisations/" + this.userDetails.account.id;
            this.fetchClient.fetch(uri).then(function (x) {
                return x.json();
            }).then(function (x) {
                return _this.input = x;
            });
        };

        Profile.prototype.update = function update() {
            var _this2 = this;

            this.fetchClient.fetch("organisations/" + this.userDetails.account.id, { method: "put", body: (0, _aureliaFetchClient.json)(this.input) }).then(function (x) {
                _this2.outcome = "success", _this2.errors = null;
            }).catch(function (e) {
                return e.json().then(function (x) {
                    return _this2.errors = x;
                });
            });;
        };

        return Profile;
    }()) || _class);
});
define('views/organisations/teachings/teachings',['exports', 'common', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-event-aggregator', 'i18n', 'moment'], function (exports, _common, _aureliaFramework, _aureliaFetchClient, _aureliaEventAggregator, _i18n, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Teachings = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Teachings = exports.Teachings = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaEventAggregator.EventAggregator, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
    function Teachings(fetchClient, ea, userDetails, referenceData, i18nMessages) {
      _classCallCheck(this, Teachings);

      this.filter = { includeFutureEvents: true, includePastEvents: false };
      this.results = [];

      this.fetchClient = fetchClient;
      this.ea = ea;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.i18n = function (key) {
        return i18nMessages.getMessage("organisations/teachings", key, userDetails.language);
      };
      this.referenceData = referenceData;
    }

    Teachings.prototype.created = function created() {
      this.filter.organisationId = this.userDetails.account.id;
      this.find();
    };

    Teachings.prototype.find = function find() {
      var _this = this;

      this.fetchClient.fetch((0, _common.getUri)("teachings", this.filter)).then(function (response) {
        return response.json();
      }).then(function (results) {
        return _this.results = results.map(function (x) {
          return { item: x, action: null };
        });
      });
    };

    Teachings.prototype.new = function _new() {
      if (this.results.length == 0 || this.results[0].action != 'new') {
        this.results.unshift({ item: {}, action: 'new' });
      }
    };

    Teachings.prototype.save = function save(model) {
      var _this2 = this;

      model.state = "saving";
      var afterSave = function afterSave(responseBody) {
        model.action = null;
        model.state = null;
        model.errors = null;
        if (responseBody) {
          model.item = responseBody;
        }
        _this2.ea.publish("referenceDataUpdate", { domain: "cities" });
      };

      if (model.action == 'new') {
        this.fetchClient.fetch("teachings", { method: "POST", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return response.json();
        }).then(function (x) {
          return afterSave(x);
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      } else {
        this.fetchClient.fetch("teachings/" + model.item.id, { method: "PUT", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return afterSave();
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      }
    };

    Teachings.prototype.delete = function _delete(model) {
      var _this3 = this;

      this.fetchClient.fetch("teachings/" + model.item.id, { method: "DELETE" }).then(function () {
        return _this3.results.splice(_this3.results.indexOf(model), 1);
      });
    };

    Teachings.prototype.cancelAction = function cancelAction(obj) {
      if (obj.action == 'edit' || obj.action == 'delete') {
        obj.action = null;
        obj.state = null;
      } else if (obj.action == 'new') {
        this.results.splice(0, 1);
      }
    };

    return Teachings;
  }()) || _class);
});
define('views/organisations/workshops/workshops',['exports', 'common', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-event-aggregator', 'i18n', 'moment'], function (exports, _common, _aureliaFramework, _aureliaFetchClient, _aureliaEventAggregator, _i18n, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Workshops = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Workshops = exports.Workshops = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaEventAggregator.EventAggregator, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
    function Workshops(fetchClient, ea, userDetails, referenceData, i18nMessages) {
      _classCallCheck(this, Workshops);

      this.filter = { includeFutureEvents: true, includePastEvents: false };
      this.results = [];

      this.fetchClient = fetchClient;
      this.ea = ea;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.referenceData = referenceData;
      this.i18n = function (key) {
        return i18nMessages.getMessage("organisations/events", key, userDetails.language);
      };
    }

    Workshops.prototype.created = function created() {
      this.filter.organisationId = this.userDetails.account.id;
      this.find();
    };

    Workshops.prototype.find = function find() {
      var _this = this;

      this.fetchClient.fetch((0, _common.getUri)("workshops", this.filter)).then(function (response) {
        return response.json();
      }).then(function (list) {
        return _this.results = list.map(function (x) {
          return { item: x, action: null };
        });
      });
    };

    Workshops.prototype.new = function _new() {
      if (this.results.length == 0 || this.results[0].action != 'new') {
        this.results.unshift({ item: { audience: 'REFUGEE' }, action: 'new' });
      }
    };

    Workshops.prototype.save = function save(model) {
      var _this2 = this;

      model.state = "saving";
      var afterSave = function afterSave(responseBody) {
        model.action = null;
        model.state = null;
        if (responseBody) {
          model.item = responseBody;
        }
        _this2.ea.publish("referenceDataUpdate", { domain: "cities" });
      };

      if (model.action == 'new') {
        this.fetchClient.fetch("workshops", { method: "POST", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return response.json();
        }).then(function (x) {
          return afterSave(x);
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      } else {
        this.fetchClient.fetch('workshops/' + model.item.id, { method: "PUT", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
          return afterSave();
        }).catch(function (e) {
          return e.json().then(function (x) {
            return model.errors = x;
          });
        });
      }
    };

    Workshops.prototype.delete = function _delete(model) {
      var _this3 = this;

      var afterDelete = function afterDelete() {
        _this3.results.splice(_this3.results.indexOf(model), 1);
        _this3.ea.publish("referenceDataUpdate", { domain: "cities" });
      };
      this.fetchClient.fetch('workshops/' + model.item.id, { method: "DELETE" }).then(function (response) {
        return afterDelete();
      });
    };

    Workshops.prototype.cancelAction = function cancelAction(obj) {
      if (obj.action == 'edit' || obj.action == 'delete') {
        obj.action = null;
        obj.state = null;
      } else if (obj.action == 'new') {
        this.results.splice(0, 1);
      }
    };

    return Workshops;
  }()) || _class);
});
define('views/refugees/events/events',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Events = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Events = exports.Events = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaFramework.BindingEngine, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function Events(fetchClient, bindingEngine, userDetails, i18nMessages, referenceData) {
      var _this = this;

      _classCallCheck(this, Events);

      this.results = [];
      this.filter = { includePastEvents: false, includeFutureEvents: true, audience: "REFUGEE" };
      this.view = "list";

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/events", key, userDetails.language);
      };

      this.find();

      bindingEngine.propertyObserver(userDetails, 'language').subscribe(function (newValue, oldValue) {
        return _this.find(_this.view, newValue);
      });
    }

    Events.prototype.find = function find(view, language) {
      var _this2 = this;

      if (view) {
        this.view = view;
      }
      this.fetchClient.fetch((0, _common.getUri)("events", this.filter)).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json.map(function (x) {
          return { item: x, distance: (0, _common.getDistance)(x.address, _this2.userDetails.address) };
        }).sort(function (x, y) {
          return (0, _moment2.default)(x.item.startDate) - (0, _moment2.default)(y.item.startDate);
        });
      }).then(function (results) {
        return _this2.results = results;
      });
    };

    Events.prototype.sortByDistance = function sortByDistance() {
      var _this3 = this;

      if (this.userDetails.address) {
        this.results.forEach(function (x) {
          return x.distance = (0, _common.getDistance)(x.item.address, _this3.userDetails.address);
        });
        this.results = this.results.sort(function (x, y) {
          return x.distance - y.distance;
        });
      }
    };

    return Events;
  }()) || _class);
});
define('views/refugees/language-programs/language-programs',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LanguagePrograms = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var LanguagePrograms = exports.LanguagePrograms = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function LanguagePrograms(fetchClient, userDetails, i18nMessages, referenceData) {
      _classCallCheck(this, LanguagePrograms);

      this.filter = { includeClosedEvents: false };
      this.results = [];
      this.view = "list";

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/language-programs", key, userDetails.language);
      };

      this.find();
    }

    LanguagePrograms.prototype.find = function find(view) {
      var _this = this;

      if (view) {
        this.view = view;
      }

      this.fetchClient.fetch((0, _common.getUri)("learnings/language-programs", this.filter)).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json.map(function (x) {
          return { item: x, distance: (0, _common.getDistance)(x.address, _this.userDetails.address) };
        }).sort(function (x, y) {
          return (0, _moment2.default)(x.item.startDate) - (0, _moment2.default)(y.item.startDate);
        });
      }).then(function (results) {
        return _this.results = results;
      });
    };

    LanguagePrograms.prototype.sortByDistance = function sortByDistance() {
      var _this2 = this;

      if (this.userDetails.address) {
        this.results.forEach(function (x) {
          return x.distance = (0, _common.getDistance)(x.item.address, _this2.userDetails.address);
        });
        this.results = this.results.sort(function (x, y) {
          return x.distance - y.distance;
        });
      }
    };

    return LanguagePrograms;
  }()) || _class);
});
define('views/refugees/meeting-requests/meeting-requests',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MeetingRequests = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var MeetingRequests = exports.MeetingRequests = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaFramework.BindingEngine, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function MeetingRequests(fetchClient, bindingEngine, userDetails, i18nMessages, referenceData) {
      var _this = this;

      _classCallCheck(this, MeetingRequests);

      this.filter = { accepted: "false" };
      this.results = [];

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/meeting-requests", key, userDetails.language);
      };
      if (this.userDetails.account && this.userDetails.account.profile == "R") {
        this.initialize();
      } else {
        bindingEngine.propertyObserver(userDetails, 'account').subscribe(function (account) {
          if (account && account.profile == "R") {
            _this.initialize();
          }
        });
      }
    }

    MeetingRequests.prototype.initialize = function initialize() {
      var _this2 = this;

      this.fetchClient.fetch('refugees/' + this.userDetails.account.id).then(function (response) {
        return response.json();
      }).then(function (r) {
        return _this2.refugee = r;
      }).then(function () {
        return _this2.find();
      });
    };

    MeetingRequests.prototype.find = function find() {
      var _this3 = this;

      this.fetchClient.fetch((0, _common.getUri)('refugees/' + this.userDetails.account.id + '/meeting-requests', this.filter)).then(function (response) {
        return response.json();
      }).then(function (list) {
        return _this3.results = list.map(function (x) {
          return { item: x, action: null };
        });
      });
    };

    MeetingRequests.prototype.new = function _new() {
      if (this.results.length == 0 || this.results[0].action != 'new') {
        var newItem = {
          refugeeLocation: this.userDetails.address,
          refugee: {
            mailAddress: this.refugee.mailAddress,
            phoneNumber: this.refugee.phoneNumber
          }
        };

        this.results.unshift({ item: newItem, action: 'new' });
      }
    };

    MeetingRequests.prototype.save = function save(model) {
      model.state = "saving";
      this.fetchClient.fetch('refugees/' + this.userDetails.account.id + '/meeting-requests', { method: "POST", body: (0, _aureliaFetchClient.json)(model.item) }).then(function (response) {
        return response.json();
      }).then(function (x) {
        model.action = null;
        model.state = null;
        model.item = x;
      }).catch(function (e) {
        return e.json().then(function (x) {
          return model.errors = x;
        });
      });
    };

    MeetingRequests.prototype.cancelNew = function cancelNew() {
      this.results.splice(0, 1);
    };

    MeetingRequests.prototype.confirm = function confirm(listElement) {
      var uri = 'refugees/' + this.userDetails.account.id + '/meeting-requests/' + listElement.item.id + '?confirmed=true';
      this.fetchClient.fetch(uri, { method: "POST" }).then(function (resp) {
        return resp.json();
      }).then(function (mr) {
        listElement.item = mr;
        listElement.action = null;
      });
    };

    MeetingRequests.prototype.reSubmit = function reSubmit(listElement) {
      var uri = 'refugees/' + this.userDetails.account.id + '/meeting-requests/' + listElement.item.id + '?confirmed=false';
      this.fetchClient.fetch(uri, { method: "POST" }).then(function (resp) {
        return resp.json();
      }).then(function (mr) {
        listElement.item = mr;
        listElement.action = null;
      });
    };

    MeetingRequests.prototype.reportProblem = function reportProblem(listElement) {
      listElement.action = null;
    };

    return MeetingRequests;
  }()) || _class);
});
define('views/refugees/professional-programs/professional-programs',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ProfessionalPrograms = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var ProfessionalPrograms = exports.ProfessionalPrograms = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function ProfessionalPrograms(fetchClient, userDetails, i18nMessages, referenceData) {
      _classCallCheck(this, ProfessionalPrograms);

      this.filter = { includeClosedEvents: false };
      this.results = [];
      this.view = "list";

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/professional-programs", key, userDetails.language);
      };

      this.find();
    }

    ProfessionalPrograms.prototype.find = function find(view) {
      var _this = this;

      if (view) {
        this.view = view;
      }
      this.fetchClient.fetch((0, _common.getUri)("learnings/professional-programs", this.filter)).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json.map(function (x) {
          return { item: x, distance: (0, _common.getDistance)(x.address, _this.userDetails.address) };
        }).sort(function (x, y) {
          return (0, _moment2.default)(x.item.startDate) - (0, _moment2.default)(y.item.startDate);
        });
      }).then(function (results) {
        return _this.results = results;
      });
    };

    ProfessionalPrograms.prototype.sortByDistance = function sortByDistance() {
      var _this2 = this;

      if (this.userDetails.address) {
        this.results.forEach(function (x) {
          return x.distance = (0, _common.getDistance)(x.item.address, _this2.userDetails.address);
        });
        this.results = this.results.sort(function (x, y) {
          return x.distance - y.distance;
        });
      }
    };

    return ProfessionalPrograms;
  }()) || _class);
});
define('views/refugees/profile/profile',['exports', 'common', 'i18n', 'aurelia-framework'], function (exports, _common, _i18n, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Profile = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Profile = exports.Profile = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function Profile(userDetails, referenceData, i18nMessages) {
        _classCallCheck(this, Profile);

        this.referenceData = referenceData;
        this.userDetails = userDetails;
        this.i18n = function (key) {
            return i18nMessages.getMessage("refugees/profile", key, userDetails.language);
        };
    }) || _class);
});
define('views/refugees/self-teaching/self-teaching',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SelfTeachings = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var SelfTeachings = exports.SelfTeachings = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function SelfTeachings(fetchClient, userDetails, i18nMessages, referenceData) {
      _classCallCheck(this, SelfTeachings);

      this.filter = {};
      this.results = [];
      this.view = "list";

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/self-teachings", key, userDetails.language);
      };

      this.find();
    }

    SelfTeachings.prototype.find = function find(view) {
      var _this = this;

      if (view) {
        this.view = view;
      }
      this.fetchClient.fetch((0, _common.getUri)("libraries", this.filter)).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json.map(function (x) {
          return { item: x, distance: (0, _common.getDistance)(x.address, _this.userDetails.address) };
        });
      }).then(function (results) {
        return _this.results = results;
      });
    };

    SelfTeachings.prototype.sortByDistance = function sortByDistance() {
      var _this2 = this;

      if (this.userDetails.address) {
        this.results.forEach(function (x) {
          return x.distance = (0, _common.getDistance)(x.item.address, _this2.userDetails.address);
        });
        this.results = this.results.sort(function (x, y) {
          return x.distance - y.distance;
        });
      }
    };

    return SelfTeachings;
  }()) || _class);
});
define('views/refugees/teachings/teachings',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Teachings = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Teachings = exports.Teachings = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function Teachings(fetchClient, userDetails, i18nMessages, referenceData) {
      _classCallCheck(this, Teachings);

      this.filter = { openForRegistration: true };
      this.results = [];
      this.view = "list";

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/teachings", key, userDetails.language);
      };

      this.find();
    }

    Teachings.prototype.find = function find(view) {
      var _this = this;

      if (view) {
        this.view = view;
      }
      this.fetchClient.fetch((0, _common.getUri)("teachings", this.filter)).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json.map(function (x) {
          return { item: x, distance: (0, _common.getDistance)(x.address, _this.userDetails.address) };
        }).sort(function (x, y) {
          return (0, _moment2.default)(x.item.startDate) - (0, _moment2.default)(y.item.startDate);
        });
      }).then(function (results) {
        return _this.results = results;
      });
    };

    Teachings.prototype.sortByDistance = function sortByDistance() {
      var _this2 = this;

      if (this.userDetails.address) {
        this.results.forEach(function (x) {
          return x.distance = (0, _common.getDistance)(x.item.address, _this2.userDetails.address);
        });
        this.results = this.results.sort(function (x, y) {
          return x.distance - y.distance;
        });
      }
    };

    return Teachings;
  }()) || _class);
});
define('views/refugees/workshops/workshops',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Workshops = undefined;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _dec, _class;

  var Workshops = exports.Workshops = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaFramework.BindingEngine, _common.UserDetails, _i18n.I18n, _common.ReferenceData), _dec(_class = function () {
    function Workshops(fetchClient, bindingEngine, userDetails, i18nMessages, referenceData) {
      var _this = this;

      _classCallCheck(this, Workshops);

      this.filter = { openForRegistration: true, audience: "REFUGEE" };
      this.results = [];
      this.view = "list";

      this.fetchClient = fetchClient;
      this.userDetails = userDetails;
      this.moment = _moment2.default;
      this.viewLocation = _common.viewLocation;
      this.viewItinerary = _common.viewItinerary;
      this.referenceData = referenceData;

      this.i18n = function (key) {
        return i18nMessages.getMessage("refugees/workshops", key, userDetails.language);
      };

      this.find();

      bindingEngine.propertyObserver(userDetails, 'language').subscribe(function (newValue, oldValue) {
        return _this.find(_this.view, newValue);
      });
    }

    Workshops.prototype.find = function find(view) {
      var _this2 = this;

      if (view) {
        this.view = view;
      }
      this.fetchClient.fetch((0, _common.getUri)("workshops", this.filter)).then(function (response) {
        return response.json();
      }).then(function (json) {
        return json.map(function (x) {
          return { item: x, distance: (0, _common.getDistance)(x.address, _this2.userDetails.address) };
        }).sort(function (x, y) {
          return (0, _moment2.default)(x.item.startDate) - (0, _moment2.default)(y.item.startDate);
        });
      }).then(function (results) {
        return _this2.results = results;
      });
    };

    Workshops.prototype.sortByDistance = function sortByDistance() {
      var _this3 = this;

      if (this.userDetails.address) {
        this.results.forEach(function (x) {
          return x.distance = (0, _common.getDistance)(x.item.address, _this3.userDetails.address);
        });
        this.results = this.results.sort(function (x, y) {
          return x.distance - y.distance;
        });
      }
    };

    return Workshops;
  }()) || _class);
});
define('views/volunteers/availabilities/availabilities',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'aurelia-router'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _aureliaRouter) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Availabilities = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Availabilities = exports.Availabilities = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaFramework.CompositionTransaction, _aureliaRouter.Router, _common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function () {
        function Availabilities(fetchClient, compositionTransaction, router, userDetails, referenceData, i18nMessages) {
            _classCallCheck(this, Availabilities);

            this.input = { languages: [] };

            this.fetchClient = fetchClient;
            this.userDetails = userDetails;
            this.referenceData = referenceData;
            this.i18n = function (key) {
                return i18nMessages.getMessage("volunteers/availabilities", key, userDetails.language);
            };

            this.compositionTransactionNotifier = compositionTransaction.enlist();
            this.router = router;
        }

        Availabilities.prototype.created = function created() {
            var _this = this;

            var uri = "volunteers/" + this.userDetails.account.id;
            this.fetchClient.fetch(uri).then(function (x) {
                return x.json();
            }).then(function (x) {
                _this.input = x;
                _this.compositionTransactionNotifier.done();
            });
        };

        Availabilities.prototype.update = function update() {
            var _this2 = this;

            var uri = 'volunteers/' + this.userDetails.account.id;
            this.fetchClient.fetch(uri, { body: (0, _aureliaFetchClient.json)(this.input), method: "put" }).then(function (x) {
                if (_this2.userDetails.lastAction == 'sign-up') {
                    _this2.userDetails.lastAction = 'set-availabilities';
                }
                _this2.outcome = { status: "ok" };
            }).catch(function (e) {
                return e.json().then(function (x) {
                    return _this2.outcome = { status: "failure", errors: x };
                });
            });
        };

        return Availabilities;
    }()) || _class);
});
define('views/volunteers/events/events',['exports', 'aurelia-framework', 'moment', 'aurelia-fetch-client', 'common'], function (exports, _aureliaFramework, _moment, _aureliaFetchClient, _common) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Events = undefined;

    var _moment2 = _interopRequireDefault(_moment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Events = exports.Events = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaFramework.BindingEngine, _common.UserDetails, _common.ReferenceData), _dec(_class = function () {
        function Events(fetchClient, bindingEngine, userDetails, referenceData) {
            var _this = this;

            _classCallCheck(this, Events);

            this.results = [];
            this.filter = { includePastEvents: false, includeFutureEvents: true, audience: "VOLUNTEER" };
            this.view = "list";

            this.fetchClient = fetchClient;
            this.userDetails = userDetails;
            this.moment = _moment2.default;
            this.viewLocation = _common.viewLocation;
            this.viewItinerary = _common.viewItinerary;
            this.referenceData = referenceData;
            this.find();

            bindingEngine.propertyObserver(userDetails, 'language').subscribe(function (newValue, oldValue) {
                return _this.find(_this.view, newValue);
            });
        }

        Events.prototype.find = function find(view, language) {
            var _this2 = this;

            if (view) {
                this.view = view;
            }
            var userLanguage = language || this.userDetails.language;

            this.fetchClient.fetch((0, _common.getUri)("events", this.filter), { headers: { "Accept-Language": userLanguage } }).then(function (response) {
                return response.json();
            }).then(function (json) {
                return json.map(function (x) {
                    return { item: x, distance: (0, _common.getDistance)(x.address, _this2.userDetails.address) };
                }).sort(function (x, y) {
                    return (0, _moment2.default)(x.item.startDate) - (0, _moment2.default)(y.item.startDate);
                });
            }).then(function (results) {
                return _this2.results = results;
            });
        };

        Events.prototype.sortByDistance = function sortByDistance() {
            var _this3 = this;

            if (this.userDetails.address) {
                this.results.forEach(function (x) {
                    return x.distance = (0, _common.getDistance)(x.item.address, _this3.userDetails.address);
                });
                this.results = this.results.sort(function (x, y) {
                    return x.distance - y.distance;
                });
            }
        };

        return Events;
    }()) || _class);
});
define('views/volunteers/meeting-requests/meeting-requests',['exports', 'common', 'i18n', 'aurelia-framework', 'aurelia-fetch-client', 'moment'], function (exports, _common, _i18n, _aureliaFramework, _aureliaFetchClient, _moment) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MeetingRequests = undefined;

    var _moment2 = _interopRequireDefault(_moment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var MeetingRequests = exports.MeetingRequests = (_dec = (0, _aureliaFramework.inject)(_aureliaFetchClient.HttpClient, _aureliaFramework.BindingEngine, _common.UserDetails, _i18n.I18n), _dec(_class = function () {
        function MeetingRequests(fetchClient, bindingEngine, userDetails, i18nMessages) {
            _classCallCheck(this, MeetingRequests);

            this.filter = { accepted: "false" };

            this.fetchClient = fetchClient;
            this.userDetails = userDetails;
            this.bindingEngine = bindingEngine;

            this.i18n = function (key) {
                return i18nMessages.getMessage("volunteers/meeting-requests", key, userDetails.language);
            };
        }

        MeetingRequests.prototype.created = function created() {
            this.find();
        };

        MeetingRequests.prototype.find = function find() {
            var _this = this;

            this.fetchClient.fetch((0, _common.getUri)('volunteers/' + this.userDetails.account.id + '/meeting-requests', this.filter)).then(function (response) {
                return response.json();
            }).then(function (list) {
                return _this.results = list.map(function (x) {
                    return { item: x, action: null, showMessages: false, messages: null };
                });
            });
        };

        MeetingRequests.prototype.accept = function accept(listElement, firstContact) {
            var _this2 = this;

            var uri = 'volunteers/' + this.userDetails.account.id + '/meeting-requests/' + listElement.item.id + '?firstContact=' + firstContact;
            this.fetchClient.fetch(uri, { method: "POST" }).then(function () {
                _this2.results.splice(_this2.results.indexOf(listElement), 1);
            });
        };

        MeetingRequests.prototype.delete = function _delete(model) {
            var _this3 = this;

            this.fetchClient.fetch((0, _common.getUri)('volunteers/' + this.userDetails.account.id + '/meeting-requests/' + model.item.id), { method: 'delete' }).then(function () {
                _this3.results.splice(_this3.results.indexOf(model), 1);
            });
        };

        return MeetingRequests;
    }()) || _class);
});
define('views/volunteers/profile/profile',['exports', 'common', 'i18n', 'aurelia-framework'], function (exports, _common, _i18n, _aureliaFramework) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Profile = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var Profile = exports.Profile = (_dec = (0, _aureliaFramework.inject)(_common.UserDetails, _common.ReferenceData, _i18n.I18n), _dec(_class = function Profile(userDetails, referenceData, i18nMessages) {
        _classCallCheck(this, Profile);

        this.referenceData = referenceData;
        this.userDetails = userDetails;
        this.i18n = function (key) {
            return i18nMessages.getMessage("volunteers/profile", key, userDetails.language);
        };
    }) || _class);
});
define('aurelia-templating-resources/compose',['exports', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-templating', 'aurelia-pal'], function (exports, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaTemplating, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Compose = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3;

  var Compose = exports.Compose = (_dec = (0, _aureliaTemplating.customElement)('compose'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaDependencyInjection.Container, _aureliaTemplating.CompositionEngine, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaTaskQueue.TaskQueue), _dec(_class = (0, _aureliaTemplating.noView)(_class = _dec2(_class = (_class2 = function () {
    function Compose(element, container, compositionEngine, viewSlot, viewResources, taskQueue) {
      

      _initDefineProp(this, 'model', _descriptor, this);

      _initDefineProp(this, 'view', _descriptor2, this);

      _initDefineProp(this, 'viewModel', _descriptor3, this);

      this.element = element;
      this.container = container;
      this.compositionEngine = compositionEngine;
      this.viewSlot = viewSlot;
      this.viewResources = viewResources;
      this.taskQueue = taskQueue;
      this.currentController = null;
      this.currentViewModel = null;
    }

    Compose.prototype.created = function created(owningView) {
      this.owningView = owningView;
    };

    Compose.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      processInstruction(this, createInstruction(this, {
        view: this.view,
        viewModel: this.viewModel,
        model: this.model
      }));
    };

    Compose.prototype.unbind = function unbind(bindingContext, overrideContext) {
      this.bindingContext = null;
      this.overrideContext = null;
      var returnToCache = true;
      var skipAnimation = true;
      this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Compose.prototype.modelChanged = function modelChanged(newValue, oldValue) {
      var _this = this;

      if (this.currentInstruction) {
        this.currentInstruction.model = newValue;
        return;
      }

      this.taskQueue.queueMicroTask(function () {
        if (_this.currentInstruction) {
          _this.currentInstruction.model = newValue;
          return;
        }

        var vm = _this.currentViewModel;

        if (vm && typeof vm.activate === 'function') {
          vm.activate(newValue);
        }
      });
    };

    Compose.prototype.viewChanged = function viewChanged(newValue, oldValue) {
      var _this2 = this;

      var instruction = createInstruction(this, {
        view: newValue,
        viewModel: this.currentViewModel || this.viewModel,
        model: this.model
      });

      if (this.currentInstruction) {
        this.currentInstruction = instruction;
        return;
      }

      this.currentInstruction = instruction;
      this.taskQueue.queueMicroTask(function () {
        return processInstruction(_this2, _this2.currentInstruction);
      });
    };

    Compose.prototype.viewModelChanged = function viewModelChanged(newValue, oldValue) {
      var _this3 = this;

      var instruction = createInstruction(this, {
        viewModel: newValue,
        view: this.view,
        model: this.model
      });

      if (this.currentInstruction) {
        this.currentInstruction = instruction;
        return;
      }

      this.currentInstruction = instruction;
      this.taskQueue.queueMicroTask(function () {
        return processInstruction(_this3, _this3.currentInstruction);
      });
    };

    return Compose;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'model', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'view', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'viewModel', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);


  function createInstruction(composer, instruction) {
    return Object.assign(instruction, {
      bindingContext: composer.bindingContext,
      overrideContext: composer.overrideContext,
      owningView: composer.owningView,
      container: composer.container,
      viewSlot: composer.viewSlot,
      viewResources: composer.viewResources,
      currentController: composer.currentController,
      host: composer.element
    });
  }

  function processInstruction(composer, instruction) {
    composer.currentInstruction = null;
    composer.compositionEngine.compose(instruction).then(function (controller) {
      composer.currentController = controller;
      composer.currentViewModel = controller ? controller.viewModel : null;
    });
  }
});
define('aurelia-templating-resources/if',['exports', 'aurelia-templating', 'aurelia-dependency-injection'], function (exports, _aureliaTemplating, _aureliaDependencyInjection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.If = undefined;

  

  var _dec, _dec2, _class;

  var If = exports.If = (_dec = (0, _aureliaTemplating.customAttribute)('if'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function If(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.showing = false;
      this.view = null;
      this.bindingContext = null;
      this.overrideContext = null;
    }

    If.prototype.bind = function bind(bindingContext, overrideContext) {
      this.bindingContext = bindingContext;
      this.overrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    If.prototype.valueChanged = function valueChanged(newValue) {
      var _this = this;

      if (this.__queuedChanges) {
        this.__queuedChanges.push(newValue);
        return;
      }

      var maybePromise = this._runValueChanged(newValue);
      if (maybePromise instanceof Promise) {
        (function () {
          var queuedChanges = _this.__queuedChanges = [];

          var runQueuedChanges = function runQueuedChanges() {
            if (!queuedChanges.length) {
              _this.__queuedChanges = undefined;
              return;
            }

            var nextPromise = _this._runValueChanged(queuedChanges.shift()) || Promise.resolve();
            nextPromise.then(runQueuedChanges);
          };

          maybePromise.then(runQueuedChanges);
        })();
      }
    };

    If.prototype._runValueChanged = function _runValueChanged(newValue) {
      var _this2 = this;

      if (!newValue) {
        var viewOrPromise = void 0;
        if (this.view !== null && this.showing) {
          viewOrPromise = this.viewSlot.remove(this.view);
          if (viewOrPromise instanceof Promise) {
            viewOrPromise.then(function () {
              return _this2.view.unbind();
            });
          } else {
            this.view.unbind();
          }
        }

        this.showing = false;
        return viewOrPromise;
      }

      if (this.view === null) {
        this.view = this.viewFactory.create();
      }

      if (!this.view.isBound) {
        this.view.bind(this.bindingContext, this.overrideContext);
      }

      if (!this.showing) {
        this.showing = true;
        return this.viewSlot.add(this.view);
      }

      return undefined;
    };

    If.prototype.unbind = function unbind() {
      if (this.view === null) {
        return;
      }

      this.view.unbind();

      if (!this.viewFactory.isCaching) {
        return;
      }

      if (this.showing) {
        this.showing = false;
        this.viewSlot.remove(this.view, true, true);
      }
      this.view.returnToCache();
      this.view = null;
    };

    return If;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/with',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-binding'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.With = undefined;

  

  var _dec, _dec2, _class;

  var With = exports.With = (_dec = (0, _aureliaTemplating.customAttribute)('with'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function With(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.parentOverrideContext = null;
      this.view = null;
    }

    With.prototype.bind = function bind(bindingContext, overrideContext) {
      this.parentOverrideContext = overrideContext;
      this.valueChanged(this.value);
    };

    With.prototype.valueChanged = function valueChanged(newValue) {
      var overrideContext = (0, _aureliaBinding.createOverrideContext)(newValue, this.parentOverrideContext);
      if (!this.view) {
        this.view = this.viewFactory.create();
        this.view.bind(newValue, overrideContext);
        this.viewSlot.add(this.view);
      } else {
        this.view.bind(newValue, overrideContext);
      }
    };

    With.prototype.unbind = function unbind() {
      this.parentOverrideContext = null;

      if (this.view) {
        this.view.unbind();
      }
    };

    return With;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat',['exports', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-templating', './repeat-strategy-locator', './repeat-utilities', './analyze-view-factory', './abstract-repeater'], function (exports, _aureliaDependencyInjection, _aureliaBinding, _aureliaTemplating, _repeatStrategyLocator, _repeatUtilities, _analyzeViewFactory, _abstractRepeater) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Repeat = undefined;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;

  var Repeat = exports.Repeat = (_dec = (0, _aureliaTemplating.customAttribute)('repeat'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.TargetInstruction, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources, _aureliaBinding.ObserverLocator, _repeatStrategyLocator.RepeatStrategyLocator), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = (_class2 = function (_AbstractRepeater) {
    _inherits(Repeat, _AbstractRepeater);

    function Repeat(viewFactory, instruction, viewSlot, viewResources, observerLocator, strategyLocator) {
      

      var _this = _possibleConstructorReturn(this, _AbstractRepeater.call(this, {
        local: 'item',
        viewsRequireLifecycle: (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory)
      }));

      _initDefineProp(_this, 'items', _descriptor, _this);

      _initDefineProp(_this, 'local', _descriptor2, _this);

      _initDefineProp(_this, 'key', _descriptor3, _this);

      _initDefineProp(_this, 'value', _descriptor4, _this);

      _this.viewFactory = viewFactory;
      _this.instruction = instruction;
      _this.viewSlot = viewSlot;
      _this.lookupFunctions = viewResources.lookupFunctions;
      _this.observerLocator = observerLocator;
      _this.key = 'key';
      _this.value = 'value';
      _this.strategyLocator = strategyLocator;
      _this.ignoreMutation = false;
      _this.sourceExpression = (0, _repeatUtilities.getItemsSourceExpression)(_this.instruction, 'repeat.for');
      _this.isOneTime = (0, _repeatUtilities.isOneTime)(_this.sourceExpression);
      _this.viewsRequireLifecycle = (0, _analyzeViewFactory.viewsRequireLifecycle)(viewFactory);
      return _this;
    }

    Repeat.prototype.call = function call(context, changes) {
      this[context](this.items, changes);
    };

    Repeat.prototype.bind = function bind(bindingContext, overrideContext) {
      this.scope = { bindingContext: bindingContext, overrideContext: overrideContext };
      this.matcherBinding = this._captureAndRemoveMatcherBinding();
      this.itemsChanged();
    };

    Repeat.prototype.unbind = function unbind() {
      this.scope = null;
      this.items = null;
      this.matcherBinding = null;
      this.viewSlot.removeAll(true);
      this._unsubscribeCollection();
    };

    Repeat.prototype._unsubscribeCollection = function _unsubscribeCollection() {
      if (this.collectionObserver) {
        this.collectionObserver.unsubscribe(this.callContext, this);
        this.collectionObserver = null;
        this.callContext = null;
      }
    };

    Repeat.prototype.itemsChanged = function itemsChanged() {
      this._unsubscribeCollection();

      if (!this.scope) {
        return;
      }

      var items = this.items;
      this.strategy = this.strategyLocator.getStrategy(items);
      if (!this.strategy) {
        throw new Error('Value for \'' + this.sourceExpression + '\' is non-repeatable');
      }

      if (!this.isOneTime && !this._observeInnerCollection()) {
        this._observeCollection();
      }
      this.strategy.instanceChanged(this, items);
    };

    Repeat.prototype._getInnerCollection = function _getInnerCollection() {
      var expression = (0, _repeatUtilities.unwrapExpression)(this.sourceExpression);
      if (!expression) {
        return null;
      }
      return expression.evaluate(this.scope, null);
    };

    Repeat.prototype.handleCollectionMutated = function handleCollectionMutated(collection, changes) {
      if (!this.collectionObserver) {
        return;
      }
      this.strategy.instanceMutated(this, collection, changes);
    };

    Repeat.prototype.handleInnerCollectionMutated = function handleInnerCollectionMutated(collection, changes) {
      var _this2 = this;

      if (!this.collectionObserver) {
        return;
      }

      if (this.ignoreMutation) {
        return;
      }
      this.ignoreMutation = true;
      var newItems = this.sourceExpression.evaluate(this.scope, this.lookupFunctions);
      this.observerLocator.taskQueue.queueMicroTask(function () {
        return _this2.ignoreMutation = false;
      });

      if (newItems === this.items) {
        this.itemsChanged();
      } else {
        this.items = newItems;
      }
    };

    Repeat.prototype._observeInnerCollection = function _observeInnerCollection() {
      var items = this._getInnerCollection();
      var strategy = this.strategyLocator.getStrategy(items);
      if (!strategy) {
        return false;
      }
      this.collectionObserver = strategy.getCollectionObserver(this.observerLocator, items);
      if (!this.collectionObserver) {
        return false;
      }
      this.callContext = 'handleInnerCollectionMutated';
      this.collectionObserver.subscribe(this.callContext, this);
      return true;
    };

    Repeat.prototype._observeCollection = function _observeCollection() {
      var items = this.items;
      this.collectionObserver = this.strategy.getCollectionObserver(this.observerLocator, items);
      if (this.collectionObserver) {
        this.callContext = 'handleCollectionMutated';
        this.collectionObserver.subscribe(this.callContext, this);
      }
    };

    Repeat.prototype._captureAndRemoveMatcherBinding = function _captureAndRemoveMatcherBinding() {
      if (this.viewFactory.viewFactory) {
        var instructions = this.viewFactory.viewFactory.instructions;
        var instructionIds = Object.keys(instructions);
        for (var i = 0; i < instructionIds.length; i++) {
          var expressions = instructions[instructionIds[i]].expressions;
          if (expressions) {
            for (var ii = 0; i < expressions.length; i++) {
              if (expressions[ii].targetProperty === 'matcher') {
                var matcherBinding = expressions[ii];
                expressions.splice(ii, 1);
                return matcherBinding;
              }
            }
          }
        }
      }

      return undefined;
    };

    Repeat.prototype.viewCount = function viewCount() {
      return this.viewSlot.children.length;
    };

    Repeat.prototype.views = function views() {
      return this.viewSlot.children;
    };

    Repeat.prototype.view = function view(index) {
      return this.viewSlot.children[index];
    };

    Repeat.prototype.matcher = function matcher() {
      return this.matcherBinding ? this.matcherBinding.sourceExpression.evaluate(this.scope, this.matcherBinding.lookupFunctions) : null;
    };

    Repeat.prototype.addView = function addView(bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.add(view);
    };

    Repeat.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      var view = this.viewFactory.create();
      view.bind(bindingContext, overrideContext);
      this.viewSlot.insert(index, view);
    };

    Repeat.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      this.viewSlot.move(sourceIndex, targetIndex);
    };

    Repeat.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      return this.viewSlot.removeAll(returnToCache, skipAnimation);
    };

    Repeat.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
    };

    Repeat.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
    };

    Repeat.prototype.updateBindings = function updateBindings(view) {
      var j = view.bindings.length;
      while (j--) {
        (0, _repeatUtilities.updateOneTimeBinding)(view.bindings[j]);
      }
      j = view.controllers.length;
      while (j--) {
        var k = view.controllers[j].boundProperties.length;
        while (k--) {
          var binding = view.controllers[j].boundProperties[k].binding;
          (0, _repeatUtilities.updateOneTimeBinding)(binding);
        }
      }
    };

    return Repeat;
  }(_abstractRepeater.AbstractRepeater), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'items', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'local', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'key', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'value', [_aureliaTemplating.bindable], {
    enumerable: true,
    initializer: null
  })), _class2)) || _class) || _class) || _class);
});
define('aurelia-templating-resources/repeat-strategy-locator',['exports', './null-repeat-strategy', './array-repeat-strategy', './map-repeat-strategy', './set-repeat-strategy', './number-repeat-strategy'], function (exports, _nullRepeatStrategy, _arrayRepeatStrategy, _mapRepeatStrategy, _setRepeatStrategy, _numberRepeatStrategy) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RepeatStrategyLocator = undefined;

  

  var RepeatStrategyLocator = exports.RepeatStrategyLocator = function () {
    function RepeatStrategyLocator() {
      

      this.matchers = [];
      this.strategies = [];

      this.addStrategy(function (items) {
        return items === null || items === undefined;
      }, new _nullRepeatStrategy.NullRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Array;
      }, new _arrayRepeatStrategy.ArrayRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Map;
      }, new _mapRepeatStrategy.MapRepeatStrategy());
      this.addStrategy(function (items) {
        return items instanceof Set;
      }, new _setRepeatStrategy.SetRepeatStrategy());
      this.addStrategy(function (items) {
        return typeof items === 'number';
      }, new _numberRepeatStrategy.NumberRepeatStrategy());
    }

    RepeatStrategyLocator.prototype.addStrategy = function addStrategy(matcher, strategy) {
      this.matchers.push(matcher);
      this.strategies.push(strategy);
    };

    RepeatStrategyLocator.prototype.getStrategy = function getStrategy(items) {
      var matchers = this.matchers;

      for (var i = 0, ii = matchers.length; i < ii; ++i) {
        if (matchers[i](items)) {
          return this.strategies[i];
        }
      }

      return null;
    };

    return RepeatStrategyLocator;
  }();
});
define('aurelia-templating-resources/null-repeat-strategy',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var NullRepeatStrategy = exports.NullRepeatStrategy = function () {
    function NullRepeatStrategy() {
      
    }

    NullRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      repeat.removeAllViews(true);
    };

    NullRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {};

    return NullRepeatStrategy;
  }();
});
define('aurelia-templating-resources/array-repeat-strategy',['exports', './repeat-utilities', 'aurelia-binding'], function (exports, _repeatUtilities, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ArrayRepeatStrategy = undefined;

  

  var ArrayRepeatStrategy = exports.ArrayRepeatStrategy = function () {
    function ArrayRepeatStrategy() {
      
    }

    ArrayRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getArrayObserver(items);
    };

    ArrayRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var itemsLength = items.length;

      if (!items || itemsLength === 0) {
        repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        return;
      }

      var children = repeat.views();
      var viewsLength = children.length;

      if (viewsLength === 0) {
        this._standardProcessInstanceChanged(repeat, items);
        return;
      }

      if (repeat.viewsRequireLifecycle) {
        (function () {
          var childrenSnapshot = children.slice(0);
          var itemNameInBindingContext = repeat.local;
          var matcher = repeat.matcher();

          var itemsPreviouslyInViews = [];
          var viewsToRemove = [];

          for (var index = 0; index < viewsLength; index++) {
            var view = childrenSnapshot[index];
            var oldItem = view.bindingContext[itemNameInBindingContext];

            if ((0, _repeatUtilities.indexOf)(items, oldItem, matcher) === -1) {
              viewsToRemove.push(view);
            } else {
              itemsPreviouslyInViews.push(oldItem);
            }
          }

          var updateViews = void 0;
          var removePromise = void 0;

          if (itemsPreviouslyInViews.length > 0) {
            removePromise = repeat.removeViews(viewsToRemove, true, !repeat.viewsRequireLifecycle);
            updateViews = function updateViews() {
              for (var _index = 0; _index < itemsLength; _index++) {
                var item = items[_index];
                var indexOfView = (0, _repeatUtilities.indexOf)(itemsPreviouslyInViews, item, matcher, _index);
                var _view = void 0;

                if (indexOfView === -1) {
                  var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_index], _index, itemsLength);
                  repeat.insertView(_index, overrideContext.bindingContext, overrideContext);

                  itemsPreviouslyInViews.splice(_index, 0, undefined);
                } else if (indexOfView === _index) {
                  _view = children[indexOfView];
                  itemsPreviouslyInViews[indexOfView] = undefined;
                } else {
                  _view = children[indexOfView];
                  repeat.moveView(indexOfView, _index);
                  itemsPreviouslyInViews.splice(indexOfView, 1);
                  itemsPreviouslyInViews.splice(_index, 0, undefined);
                }

                if (_view) {
                  (0, _repeatUtilities.updateOverrideContext)(_view.overrideContext, _index, itemsLength);
                }
              }

              _this._inPlaceProcessItems(repeat, items);
            };
          } else {
            removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            updateViews = function updateViews() {
              return _this._standardProcessInstanceChanged(repeat, items);
            };
          }

          if (removePromise instanceof Promise) {
            removePromise.then(updateViews);
          } else {
            updateViews();
          }
        })();
      } else {
        this._inPlaceProcessItems(repeat, items);
      }
    };

    ArrayRepeatStrategy.prototype._standardProcessInstanceChanged = function _standardProcessInstanceChanged(repeat, items) {
      for (var i = 0, ii = items.length; i < ii; i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[i], i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype._inPlaceProcessItems = function _inPlaceProcessItems(repeat, items) {
      var itemsLength = items.length;
      var viewsLength = repeat.viewCount();

      while (viewsLength > itemsLength) {
        viewsLength--;
        repeat.removeView(viewsLength, true, !repeat.viewsRequireLifecycle);
      }

      var local = repeat.local;

      for (var i = 0; i < viewsLength; i++) {
        var view = repeat.view(i);
        var last = i === itemsLength - 1;
        var middle = i !== 0 && !last;

        if (view.bindingContext[local] === items[i] && view.overrideContext.$middle === middle && view.overrideContext.$last === last) {
          continue;
        }

        view.bindingContext[local] = items[i];
        view.overrideContext.$middle = middle;
        view.overrideContext.$last = last;
        repeat.updateBindings(view);
      }

      for (var _i = viewsLength; _i < itemsLength; _i++) {
        var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, items[_i], _i, itemsLength);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }
    };

    ArrayRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, array, splices) {
      var _this2 = this;

      if (repeat.__queuedSplices) {
        for (var i = 0, ii = splices.length; i < ii; ++i) {
          var _splices$i = splices[i],
              index = _splices$i.index,
              removed = _splices$i.removed,
              addedCount = _splices$i.addedCount;

          (0, _aureliaBinding.mergeSplice)(repeat.__queuedSplices, index, removed, addedCount);
        }

        repeat.__array = array.slice(0);
        return;
      }

      var maybePromise = this._runSplices(repeat, array.slice(0), splices);
      if (maybePromise instanceof Promise) {
        (function () {
          var queuedSplices = repeat.__queuedSplices = [];

          var runQueuedSplices = function runQueuedSplices() {
            if (!queuedSplices.length) {
              repeat.__queuedSplices = undefined;
              repeat.__array = undefined;
              return;
            }

            var nextPromise = _this2._runSplices(repeat, repeat.__array, queuedSplices) || Promise.resolve();
            queuedSplices = repeat.__queuedSplices = [];
            nextPromise.then(runQueuedSplices);
          };

          maybePromise.then(runQueuedSplices);
        })();
      }
    };

    ArrayRepeatStrategy.prototype._runSplices = function _runSplices(repeat, array, splices) {
      var _this3 = this;

      var removeDelta = 0;
      var rmPromises = [];

      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var removed = splice.removed;

        for (var j = 0, jj = removed.length; j < jj; ++j) {
          var viewOrPromise = repeat.removeView(splice.index + removeDelta + rmPromises.length, true);
          if (viewOrPromise instanceof Promise) {
            rmPromises.push(viewOrPromise);
          }
        }
        removeDelta -= splice.addedCount;
      }

      if (rmPromises.length > 0) {
        return Promise.all(rmPromises).then(function () {
          var spliceIndexLow = _this3._handleAddedSplices(repeat, array, splices);
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);
        });
      }

      var spliceIndexLow = this._handleAddedSplices(repeat, array, splices);
      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), spliceIndexLow);

      return undefined;
    };

    ArrayRepeatStrategy.prototype._handleAddedSplices = function _handleAddedSplices(repeat, array, splices) {
      var spliceIndex = void 0;
      var spliceIndexLow = void 0;
      var arrayLength = array.length;
      for (var i = 0, ii = splices.length; i < ii; ++i) {
        var splice = splices[i];
        var addIndex = spliceIndex = splice.index;
        var end = splice.index + splice.addedCount;

        if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
          spliceIndexLow = spliceIndex;
        }

        for (; addIndex < end; ++addIndex) {
          var overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, array[addIndex], addIndex, arrayLength);
          repeat.insertView(addIndex, overrideContext.bindingContext, overrideContext);
        }
      }

      return spliceIndexLow;
    };

    return ArrayRepeatStrategy;
  }();
});
define('aurelia-templating-resources/repeat-utilities',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.updateOverrideContexts = updateOverrideContexts;
  exports.createFullOverrideContext = createFullOverrideContext;
  exports.updateOverrideContext = updateOverrideContext;
  exports.getItemsSourceExpression = getItemsSourceExpression;
  exports.unwrapExpression = unwrapExpression;
  exports.isOneTime = isOneTime;
  exports.updateOneTimeBinding = updateOneTimeBinding;
  exports.indexOf = indexOf;


  var oneTime = _aureliaBinding.bindingMode.oneTime;

  function updateOverrideContexts(views, startIndex) {
    var length = views.length;

    if (startIndex > 0) {
      startIndex = startIndex - 1;
    }

    for (; startIndex < length; ++startIndex) {
      updateOverrideContext(views[startIndex].overrideContext, startIndex, length);
    }
  }

  function createFullOverrideContext(repeat, data, index, length, key) {
    var bindingContext = {};
    var overrideContext = (0, _aureliaBinding.createOverrideContext)(bindingContext, repeat.scope.overrideContext);

    if (typeof key !== 'undefined') {
      bindingContext[repeat.key] = key;
      bindingContext[repeat.value] = data;
    } else {
      bindingContext[repeat.local] = data;
    }
    updateOverrideContext(overrideContext, index, length);
    return overrideContext;
  }

  function updateOverrideContext(overrideContext, index, length) {
    var first = index === 0;
    var last = index === length - 1;
    var even = index % 2 === 0;

    overrideContext.$index = index;
    overrideContext.$first = first;
    overrideContext.$last = last;
    overrideContext.$middle = !(first || last);
    overrideContext.$odd = !even;
    overrideContext.$even = even;
  }

  function getItemsSourceExpression(instruction, attrName) {
    return instruction.behaviorInstructions.filter(function (bi) {
      return bi.originalAttrName === attrName;
    })[0].attributes.items.sourceExpression;
  }

  function unwrapExpression(expression) {
    var unwrapped = false;
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      expression = expression.expression;
    }
    while (expression instanceof _aureliaBinding.ValueConverter) {
      expression = expression.expression;
      unwrapped = true;
    }
    return unwrapped ? expression : null;
  }

  function isOneTime(expression) {
    while (expression instanceof _aureliaBinding.BindingBehavior) {
      if (expression.name === 'oneTime') {
        return true;
      }
      expression = expression.expression;
    }
    return false;
  }

  function updateOneTimeBinding(binding) {
    if (binding.call && binding.mode === oneTime) {
      binding.call(_aureliaBinding.sourceContext);
    } else if (binding.updateOneTimeBindings) {
      binding.updateOneTimeBindings();
    }
  }

  function indexOf(array, item, matcher, startIndex) {
    if (!matcher) {
      return array.indexOf(item);
    }
    var length = array.length;
    for (var index = startIndex || 0; index < length; index++) {
      if (matcher(array[index], item)) {
        return index;
      }
    }
    return -1;
  }
});
define('aurelia-templating-resources/map-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MapRepeatStrategy = undefined;

  

  var MapRepeatStrategy = exports.MapRepeatStrategy = function () {
    function MapRepeatStrategy() {
      
    }

    MapRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getMapObserver(items);
    };

    MapRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    MapRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value, key) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size, key);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    MapRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, map, records) {
      var key = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        key = record.key;
        switch (record.type) {
          case 'update':
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), removeIndex, map.size, key);
            repeat.insertView(removeIndex, overrideContext.bindingContext, overrideContext);
            break;
          case 'add':
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, map.get(key), map.size - 1, map.size, key);
            repeat.insertView(map.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            if (record.oldValue === undefined) {
              return;
            }
            removeIndex = this._getViewIndexByKey(repeat, key);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    MapRepeatStrategy.prototype._getViewIndexByKey = function _getViewIndexByKey(repeat, key) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.key] === key) {
          return i;
        }
      }

      return undefined;
    };

    return MapRepeatStrategy;
  }();
});
define('aurelia-templating-resources/set-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SetRepeatStrategy = undefined;

  

  var SetRepeatStrategy = exports.SetRepeatStrategy = function () {
    function SetRepeatStrategy() {
      
    }

    SetRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver(observerLocator, items) {
      return observerLocator.getSetObserver(items);
    };

    SetRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, items) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, items);
        });
        return;
      }
      this._standardProcessItems(repeat, items);
    };

    SetRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, items) {
      var index = 0;
      var overrideContext = void 0;

      items.forEach(function (value) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, index, items.size);
        repeat.addView(overrideContext.bindingContext, overrideContext);
        ++index;
      });
    };

    SetRepeatStrategy.prototype.instanceMutated = function instanceMutated(repeat, set, records) {
      var value = void 0;
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var removeIndex = void 0;
      var record = void 0;
      var rmPromises = [];
      var viewOrPromise = void 0;

      for (i = 0, ii = records.length; i < ii; ++i) {
        record = records[i];
        value = record.value;
        switch (record.type) {
          case 'add':
            overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, value, set.size - 1, set.size);
            repeat.insertView(set.size - 1, overrideContext.bindingContext, overrideContext);
            break;
          case 'delete':
            removeIndex = this._getViewIndexByValue(repeat, value);
            viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
            if (viewOrPromise instanceof Promise) {
              rmPromises.push(viewOrPromise);
            }
            break;
          case 'clear':
            repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
            break;
          default:
            continue;
        }
      }

      if (rmPromises.length > 0) {
        Promise.all(rmPromises).then(function () {
          (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
        });
      } else {
        (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
      }
    };

    SetRepeatStrategy.prototype._getViewIndexByValue = function _getViewIndexByValue(repeat, value) {
      var i = void 0;
      var ii = void 0;
      var child = void 0;

      for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
        child = repeat.view(i);
        if (child.bindingContext[repeat.local] === value) {
          return i;
        }
      }

      return undefined;
    };

    return SetRepeatStrategy;
  }();
});
define('aurelia-templating-resources/number-repeat-strategy',['exports', './repeat-utilities'], function (exports, _repeatUtilities) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.NumberRepeatStrategy = undefined;

  

  var NumberRepeatStrategy = exports.NumberRepeatStrategy = function () {
    function NumberRepeatStrategy() {
      
    }

    NumberRepeatStrategy.prototype.getCollectionObserver = function getCollectionObserver() {
      return null;
    };

    NumberRepeatStrategy.prototype.instanceChanged = function instanceChanged(repeat, value) {
      var _this = this;

      var removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
      if (removePromise instanceof Promise) {
        removePromise.then(function () {
          return _this._standardProcessItems(repeat, value);
        });
        return;
      }
      this._standardProcessItems(repeat, value);
    };

    NumberRepeatStrategy.prototype._standardProcessItems = function _standardProcessItems(repeat, value) {
      var childrenLength = repeat.viewCount();
      var i = void 0;
      var ii = void 0;
      var overrideContext = void 0;
      var viewsToRemove = void 0;

      value = Math.floor(value);
      viewsToRemove = childrenLength - value;

      if (viewsToRemove > 0) {
        if (viewsToRemove > childrenLength) {
          viewsToRemove = childrenLength;
        }

        for (i = 0, ii = viewsToRemove; i < ii; ++i) {
          repeat.removeView(childrenLength - (i + 1), true, !repeat.viewsRequireLifecycle);
        }

        return;
      }

      for (i = childrenLength, ii = value; i < ii; ++i) {
        overrideContext = (0, _repeatUtilities.createFullOverrideContext)(repeat, i, i, ii);
        repeat.addView(overrideContext.bindingContext, overrideContext);
      }

      (0, _repeatUtilities.updateOverrideContexts)(repeat.views(), 0);
    };

    return NumberRepeatStrategy;
  }();
});
define('aurelia-templating-resources/analyze-view-factory',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.viewsRequireLifecycle = viewsRequireLifecycle;
  var lifecycleOptionalBehaviors = exports.lifecycleOptionalBehaviors = ['focus', 'if', 'repeat', 'show', 'with'];

  function behaviorRequiresLifecycle(instruction) {
    var t = instruction.type;
    var name = t.elementName !== null ? t.elementName : t.attributeName;
    return lifecycleOptionalBehaviors.indexOf(name) === -1 && (t.handlesAttached || t.handlesBind || t.handlesCreated || t.handlesDetached || t.handlesUnbind) || t.viewFactory && viewsRequireLifecycle(t.viewFactory) || instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function targetRequiresLifecycle(instruction) {
    var behaviors = instruction.behaviorInstructions;
    if (behaviors) {
      var i = behaviors.length;
      while (i--) {
        if (behaviorRequiresLifecycle(behaviors[i])) {
          return true;
        }
      }
    }

    return instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
  }

  function viewsRequireLifecycle(viewFactory) {
    if ('_viewsRequireLifecycle' in viewFactory) {
      return viewFactory._viewsRequireLifecycle;
    }

    viewFactory._viewsRequireLifecycle = false;

    if (viewFactory.viewFactory) {
      viewFactory._viewsRequireLifecycle = viewsRequireLifecycle(viewFactory.viewFactory);
      return viewFactory._viewsRequireLifecycle;
    }

    if (viewFactory.template.querySelector('.au-animate')) {
      viewFactory._viewsRequireLifecycle = true;
      return true;
    }

    for (var id in viewFactory.instructions) {
      if (targetRequiresLifecycle(viewFactory.instructions[id])) {
        viewFactory._viewsRequireLifecycle = true;
        return true;
      }
    }

    viewFactory._viewsRequireLifecycle = false;
    return false;
  }
});
define('aurelia-templating-resources/abstract-repeater',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var AbstractRepeater = exports.AbstractRepeater = function () {
    function AbstractRepeater(options) {
      

      Object.assign(this, {
        local: 'items',
        viewsRequireLifecycle: true
      }, options);
    }

    AbstractRepeater.prototype.viewCount = function viewCount() {
      throw new Error('subclass must implement `viewCount`');
    };

    AbstractRepeater.prototype.views = function views() {
      throw new Error('subclass must implement `views`');
    };

    AbstractRepeater.prototype.view = function view(index) {
      throw new Error('subclass must implement `view`');
    };

    AbstractRepeater.prototype.matcher = function matcher() {
      throw new Error('subclass must implement `matcher`');
    };

    AbstractRepeater.prototype.addView = function addView(bindingContext, overrideContext) {
      throw new Error('subclass must implement `addView`');
    };

    AbstractRepeater.prototype.insertView = function insertView(index, bindingContext, overrideContext) {
      throw new Error('subclass must implement `insertView`');
    };

    AbstractRepeater.prototype.moveView = function moveView(sourceIndex, targetIndex) {
      throw new Error('subclass must implement `moveView`');
    };

    AbstractRepeater.prototype.removeAllViews = function removeAllViews(returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeAllViews`');
    };

    AbstractRepeater.prototype.removeViews = function removeViews(viewsToRemove, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.removeView = function removeView(index, returnToCache, skipAnimation) {
      throw new Error('subclass must implement `removeView`');
    };

    AbstractRepeater.prototype.updateBindings = function updateBindings(view) {
      throw new Error('subclass must implement `updateBindings`');
    };

    return AbstractRepeater;
  }();
});
define('aurelia-templating-resources/show',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Show = undefined;

  

  var _dec, _dec2, _class;

  var Show = exports.Show = (_dec = (0, _aureliaTemplating.customAttribute)('show'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Show(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Show.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Show.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Show.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Show;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/aurelia-hide-style',['exports', 'aurelia-pal'], function (exports, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.aureliaHideClassName = undefined;
  exports.injectAureliaHideStyleAtHead = injectAureliaHideStyleAtHead;
  exports.injectAureliaHideStyleAtBoundary = injectAureliaHideStyleAtBoundary;
  var aureliaHideClassName = exports.aureliaHideClassName = 'aurelia-hide';

  var aureliaHideClass = '.' + aureliaHideClassName + ' { display:none !important; }';

  function injectAureliaHideStyleAtHead() {
    _aureliaPal.DOM.injectStyles(aureliaHideClass);
  }

  function injectAureliaHideStyleAtBoundary(domBoundary) {
    if (_aureliaPal.FEATURE.shadowDOM && domBoundary && !domBoundary.hasAureliaHideStyle) {
      domBoundary.hasAureliaHideStyle = true;
      _aureliaPal.DOM.injectStyles(aureliaHideClass, domBoundary);
    }
  }
});
define('aurelia-templating-resources/hide',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-pal', './aurelia-hide-style'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaPal, _aureliaHideStyle) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Hide = undefined;

  

  var _dec, _dec2, _class;

  var Hide = exports.Hide = (_dec = (0, _aureliaTemplating.customAttribute)('hide'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTemplating.Animator, _aureliaDependencyInjection.Optional.of(_aureliaPal.DOM.boundary, true)), _dec(_class = _dec2(_class = function () {
    function Hide(element, animator, domBoundary) {
      

      this.element = element;
      this.animator = animator;
      this.domBoundary = domBoundary;
    }

    Hide.prototype.created = function created() {
      (0, _aureliaHideStyle.injectAureliaHideStyleAtBoundary)(this.domBoundary);
    };

    Hide.prototype.valueChanged = function valueChanged(newValue) {
      if (newValue) {
        this.animator.addClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      } else {
        this.animator.removeClass(this.element, _aureliaHideStyle.aureliaHideClassName);
      }
    };

    Hide.prototype.bind = function bind(bindingContext) {
      this.valueChanged(this.value);
    };

    return Hide;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/sanitize-html',['exports', 'aurelia-binding', 'aurelia-dependency-injection', './html-sanitizer'], function (exports, _aureliaBinding, _aureliaDependencyInjection, _htmlSanitizer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SanitizeHTMLValueConverter = undefined;

  

  var _dec, _dec2, _class;

  var SanitizeHTMLValueConverter = exports.SanitizeHTMLValueConverter = (_dec = (0, _aureliaBinding.valueConverter)('sanitizeHTML'), _dec2 = (0, _aureliaDependencyInjection.inject)(_htmlSanitizer.HTMLSanitizer), _dec(_class = _dec2(_class = function () {
    function SanitizeHTMLValueConverter(sanitizer) {
      

      this.sanitizer = sanitizer;
    }

    SanitizeHTMLValueConverter.prototype.toView = function toView(untrustedMarkup) {
      if (untrustedMarkup === null || untrustedMarkup === undefined) {
        return null;
      }

      return this.sanitizer.sanitize(untrustedMarkup);
    };

    return SanitizeHTMLValueConverter;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/html-sanitizer',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  

  var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  var HTMLSanitizer = exports.HTMLSanitizer = function () {
    function HTMLSanitizer() {
      
    }

    HTMLSanitizer.prototype.sanitize = function sanitize(input) {
      return input.replace(SCRIPT_REGEX, '');
    };

    return HTMLSanitizer;
  }();
});
define('aurelia-templating-resources/replaceable',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Replaceable = undefined;

  

  var _dec, _dec2, _class;

  var Replaceable = exports.Replaceable = (_dec = (0, _aureliaTemplating.customAttribute)('replaceable'), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot), _dec(_class = (0, _aureliaTemplating.templateController)(_class = _dec2(_class = function () {
    function Replaceable(viewFactory, viewSlot) {
      

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.view = null;
    }

    Replaceable.prototype.bind = function bind(bindingContext, overrideContext) {
      if (this.view === null) {
        this.view = this.viewFactory.create();
        this.viewSlot.add(this.view);
      }

      this.view.bind(bindingContext, overrideContext);
    };

    Replaceable.prototype.unbind = function unbind() {
      this.view.unbind();
    };

    return Replaceable;
  }()) || _class) || _class) || _class);
});
define('aurelia-templating-resources/focus',['exports', 'aurelia-templating', 'aurelia-binding', 'aurelia-dependency-injection', 'aurelia-task-queue', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaBinding, _aureliaDependencyInjection, _aureliaTaskQueue, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Focus = undefined;

  

  var _dec, _dec2, _class;

  var Focus = exports.Focus = (_dec = (0, _aureliaTemplating.customAttribute)('focus', _aureliaBinding.bindingMode.twoWay), _dec2 = (0, _aureliaDependencyInjection.inject)(_aureliaPal.DOM.Element, _aureliaTaskQueue.TaskQueue), _dec(_class = _dec2(_class = function () {
    function Focus(element, taskQueue) {
      var _this = this;

      

      this.element = element;
      this.taskQueue = taskQueue;
      this.isAttached = false;
      this.needsApply = false;

      this.focusListener = function (e) {
        _this.value = true;
      };
      this.blurListener = function (e) {
        if (_aureliaPal.DOM.activeElement !== _this.element) {
          _this.value = false;
        }
      };
    }

    Focus.prototype.valueChanged = function valueChanged(newValue) {
      if (this.isAttached) {
        this._apply();
      } else {
        this.needsApply = true;
      }
    };

    Focus.prototype._apply = function _apply() {
      var _this2 = this;

      if (this.value) {
        this.taskQueue.queueMicroTask(function () {
          if (_this2.value) {
            _this2.element.focus();
          }
        });
      } else {
        this.element.blur();
      }
    };

    Focus.prototype.attached = function attached() {
      this.isAttached = true;
      if (this.needsApply) {
        this.needsApply = false;
        this._apply();
      }
      this.element.addEventListener('focus', this.focusListener);
      this.element.addEventListener('blur', this.blurListener);
    };

    Focus.prototype.detached = function detached() {
      this.isAttached = false;
      this.element.removeEventListener('focus', this.focusListener);
      this.element.removeEventListener('blur', this.blurListener);
    };

    return Focus;
  }()) || _class) || _class);
});
define('aurelia-templating-resources/css-resource',['exports', 'aurelia-templating', 'aurelia-loader', 'aurelia-dependency-injection', 'aurelia-path', 'aurelia-pal'], function (exports, _aureliaTemplating, _aureliaLoader, _aureliaDependencyInjection, _aureliaPath, _aureliaPal) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createCSSResource = _createCSSResource;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  

  var cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;

  function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
      throw new Error('Failed loading required CSS file: ' + address);
    }
    return css.replace(cssUrlMatcher, function (match, p1) {
      var quote = p1.charAt(0);
      if (quote === '\'' || quote === '"') {
        p1 = p1.substr(1, p1.length - 2);
      }
      return 'url(\'' + (0, _aureliaPath.relativeToFile)(p1, address) + '\')';
    });
  }

  var CSSResource = function () {
    function CSSResource(address) {
      

      this.address = address;
      this._scoped = null;
      this._global = false;
      this._alreadyGloballyInjected = false;
    }

    CSSResource.prototype.initialize = function initialize(container, target) {
      this._scoped = new target(this);
    };

    CSSResource.prototype.register = function register(registry, name) {
      if (name === 'scoped') {
        registry.registerViewEngineHooks(this._scoped);
      } else {
        this._global = true;
      }
    };

    CSSResource.prototype.load = function load(container) {
      var _this = this;

      return container.get(_aureliaLoader.Loader).loadText(this.address).catch(function (err) {
        return null;
      }).then(function (text) {
        text = fixupCSSUrls(_this.address, text);
        _this._scoped.css = text;
        if (_this._global) {
          _this._alreadyGloballyInjected = true;
          _aureliaPal.DOM.injectStyles(text);
        }
      });
    };

    return CSSResource;
  }();

  var CSSViewEngineHooks = function () {
    function CSSViewEngineHooks(owner) {
      

      this.owner = owner;
      this.css = null;
    }

    CSSViewEngineHooks.prototype.beforeCompile = function beforeCompile(content, resources, instruction) {
      if (instruction.targetShadowDOM) {
        _aureliaPal.DOM.injectStyles(this.css, content, true);
      } else if (_aureliaPal.FEATURE.scopedCSS) {
        var styleNode = _aureliaPal.DOM.injectStyles(this.css, content, true);
        styleNode.setAttribute('scoped', 'scoped');
      } else if (!this.owner._alreadyGloballyInjected) {
        _aureliaPal.DOM.injectStyles(this.css);
        this.owner._alreadyGloballyInjected = true;
      }
    };

    return CSSViewEngineHooks;
  }();

  function _createCSSResource(address) {
    var _dec, _class;

    var ViewCSS = (_dec = (0, _aureliaTemplating.resource)(new CSSResource(address)), _dec(_class = function (_CSSViewEngineHooks) {
      _inherits(ViewCSS, _CSSViewEngineHooks);

      function ViewCSS() {
        

        return _possibleConstructorReturn(this, _CSSViewEngineHooks.apply(this, arguments));
      }

      return ViewCSS;
    }(CSSViewEngineHooks)) || _class);

    return ViewCSS;
  }
});
define('aurelia-templating-resources/attr-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AttrBindingBehavior = undefined;

  

  var AttrBindingBehavior = exports.AttrBindingBehavior = function () {
    function AttrBindingBehavior() {
      
    }

    AttrBindingBehavior.prototype.bind = function bind(binding, source) {
      binding.targetObserver = new _aureliaBinding.DataAttributeObserver(binding.target, binding.targetProperty);
    };

    AttrBindingBehavior.prototype.unbind = function unbind(binding, source) {};

    return AttrBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-mode-behaviors',['exports', 'aurelia-binding', 'aurelia-metadata'], function (exports, _aureliaBinding, _aureliaMetadata) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TwoWayBindingBehavior = exports.OneWayBindingBehavior = exports.OneTimeBindingBehavior = undefined;

  

  var _dec, _class, _dec2, _class2, _dec3, _class3;

  var modeBindingBehavior = {
    bind: function bind(binding, source, lookupFunctions) {
      binding.originalMode = binding.mode;
      binding.mode = this.mode;
    },
    unbind: function unbind(binding, source) {
      binding.mode = binding.originalMode;
      binding.originalMode = null;
    }
  };

  var OneTimeBindingBehavior = exports.OneTimeBindingBehavior = (_dec = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec(_class = function OneTimeBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneTime;
  }) || _class);
  var OneWayBindingBehavior = exports.OneWayBindingBehavior = (_dec2 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec2(_class2 = function OneWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.oneWay;
  }) || _class2);
  var TwoWayBindingBehavior = exports.TwoWayBindingBehavior = (_dec3 = (0, _aureliaMetadata.mixin)(modeBindingBehavior), _dec3(_class3 = function TwoWayBindingBehavior() {
    

    this.mode = _aureliaBinding.bindingMode.twoWay;
  }) || _class3);
});
define('aurelia-templating-resources/throttle-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ThrottleBindingBehavior = undefined;

  

  function throttle(newValue) {
    var _this = this;

    var state = this.throttleState;
    var elapsed = +new Date() - state.last;
    if (elapsed >= state.delay) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
      state.last = +new Date();
      this.throttledMethod(newValue);
      return;
    }
    state.newValue = newValue;
    if (state.timeoutId === null) {
      state.timeoutId = setTimeout(function () {
        state.timeoutId = null;
        state.last = +new Date();
        _this.throttledMethod(state.newValue);
      }, state.delay - elapsed);
    }
  }

  var ThrottleBindingBehavior = exports.ThrottleBindingBehavior = function () {
    function ThrottleBindingBehavior() {
      
    }

    ThrottleBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToThrottle = 'updateTarget';
      if (binding.callSource) {
        methodToThrottle = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToThrottle = 'updateSource';
      }

      binding.throttledMethod = binding[methodToThrottle];
      binding.throttledMethod.originalName = methodToThrottle;

      binding[methodToThrottle] = throttle;

      binding.throttleState = {
        delay: delay,
        last: 0,
        timeoutId: null
      };
    };

    ThrottleBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.throttledMethod.originalName;
      binding[methodToRestore] = binding.throttledMethod;
      binding.throttledMethod = null;
      clearTimeout(binding.throttleState.timeoutId);
      binding.throttleState = null;
    };

    return ThrottleBindingBehavior;
  }();
});
define('aurelia-templating-resources/debounce-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DebounceBindingBehavior = undefined;

  

  function debounce(newValue) {
    var _this = this;

    var state = this.debounceState;
    if (state.immediate) {
      state.immediate = false;
      this.debouncedMethod(newValue);
      return;
    }
    clearTimeout(state.timeoutId);
    state.timeoutId = setTimeout(function () {
      return _this.debouncedMethod(newValue);
    }, state.delay);
  }

  var DebounceBindingBehavior = exports.DebounceBindingBehavior = function () {
    function DebounceBindingBehavior() {
      
    }

    DebounceBindingBehavior.prototype.bind = function bind(binding, source) {
      var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;

      var methodToDebounce = 'updateTarget';
      if (binding.callSource) {
        methodToDebounce = 'callSource';
      } else if (binding.updateSource && binding.mode === _aureliaBinding.bindingMode.twoWay) {
        methodToDebounce = 'updateSource';
      }

      binding.debouncedMethod = binding[methodToDebounce];
      binding.debouncedMethod.originalName = methodToDebounce;

      binding[methodToDebounce] = debounce;

      binding.debounceState = {
        delay: delay,
        timeoutId: null,
        immediate: methodToDebounce === 'updateTarget' };
    };

    DebounceBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var methodToRestore = binding.debouncedMethod.originalName;
      binding[methodToRestore] = binding.debouncedMethod;
      binding.debouncedMethod = null;
      clearTimeout(binding.debounceState.timeoutId);
      binding.debounceState = null;
    };

    return DebounceBindingBehavior;
  }();
});
define('aurelia-templating-resources/signal-binding-behavior',['exports', './binding-signaler'], function (exports, _bindingSignaler) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.SignalBindingBehavior = undefined;

  

  var SignalBindingBehavior = exports.SignalBindingBehavior = function () {
    SignalBindingBehavior.inject = function inject() {
      return [_bindingSignaler.BindingSignaler];
    };

    function SignalBindingBehavior(bindingSignaler) {
      

      this.signals = bindingSignaler.signals;
    }

    SignalBindingBehavior.prototype.bind = function bind(binding, source) {
      if (!binding.updateTarget) {
        throw new Error('Only property bindings and string interpolation bindings can be signaled.  Trigger, delegate and call bindings cannot be signaled.');
      }
      if (arguments.length === 3) {
        var name = arguments[2];
        var bindings = this.signals[name] || (this.signals[name] = []);
        bindings.push(binding);
        binding.signalName = name;
      } else if (arguments.length > 3) {
        var names = Array.prototype.slice.call(arguments, 2);
        var i = names.length;
        while (i--) {
          var _name = names[i];
          var _bindings = this.signals[_name] || (this.signals[_name] = []);
          _bindings.push(binding);
        }
        binding.signalName = names;
      } else {
        throw new Error('Signal name is required.');
      }
    };

    SignalBindingBehavior.prototype.unbind = function unbind(binding, source) {
      var name = binding.signalName;
      binding.signalName = null;
      if (Array.isArray(name)) {
        var names = name;
        var i = names.length;
        while (i--) {
          var n = names[i];
          var bindings = this.signals[n];
          bindings.splice(bindings.indexOf(binding), 1);
        }
      } else {
        var _bindings2 = this.signals[name];
        _bindings2.splice(_bindings2.indexOf(binding), 1);
      }
    };

    return SignalBindingBehavior;
  }();
});
define('aurelia-templating-resources/binding-signaler',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.BindingSignaler = undefined;

  

  var BindingSignaler = exports.BindingSignaler = function () {
    function BindingSignaler() {
      

      this.signals = {};
    }

    BindingSignaler.prototype.signal = function signal(name) {
      var bindings = this.signals[name];
      if (!bindings) {
        return;
      }
      var i = bindings.length;
      while (i--) {
        bindings[i].call(_aureliaBinding.sourceContext);
      }
    };

    return BindingSignaler;
  }();
});
define('aurelia-templating-resources/update-trigger-binding-behavior',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.UpdateTriggerBindingBehavior = undefined;

  

  var _class, _temp;

  var eventNamesRequired = 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">';
  var notApplicableMessage = 'The updateTrigger binding behavior can only be applied to two-way bindings on input/select elements.';

  var UpdateTriggerBindingBehavior = exports.UpdateTriggerBindingBehavior = (_temp = _class = function () {
    function UpdateTriggerBindingBehavior(eventManager) {
      

      this.eventManager = eventManager;
    }

    UpdateTriggerBindingBehavior.prototype.bind = function bind(binding, source) {
      for (var _len = arguments.length, events = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        events[_key - 2] = arguments[_key];
      }

      if (events.length === 0) {
        throw new Error(eventNamesRequired);
      }
      if (binding.mode !== _aureliaBinding.bindingMode.twoWay) {
        throw new Error(notApplicableMessage);
      }

      var targetObserver = binding.observerLocator.getObserver(binding.target, binding.targetProperty);
      if (!targetObserver.handler) {
        throw new Error(notApplicableMessage);
      }
      binding.targetObserver = targetObserver;

      targetObserver.originalHandler = binding.targetObserver.handler;

      var handler = this.eventManager.createElementHandler(events);
      targetObserver.handler = handler;
    };

    UpdateTriggerBindingBehavior.prototype.unbind = function unbind(binding, source) {
      binding.targetObserver.handler = binding.targetObserver.originalHandler;
      binding.targetObserver.originalHandler = null;
    };

    return UpdateTriggerBindingBehavior;
  }(), _class.inject = [_aureliaBinding.EventManager], _temp);
});
define('aurelia-templating-resources/html-resource-plugin',['exports', 'aurelia-templating', './dynamic-element'], function (exports, _aureliaTemplating, _dynamicElement) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.getElementName = getElementName;
  exports.configure = configure;
  function getElementName(address) {
    return (/([^\/^\?]+)\.html/i.exec(address)[1].toLowerCase()
    );
  }

  function configure(config) {
    var viewEngine = config.container.get(_aureliaTemplating.ViewEngine);
    var loader = config.aurelia.loader;

    viewEngine.addResourcePlugin('.html', {
      'fetch': function fetch(address) {
        return loader.loadTemplate(address).then(function (registryEntry) {
          var _ref;

          var bindable = registryEntry.template.getAttribute('bindable');
          var elementName = getElementName(address);

          if (bindable) {
            bindable = bindable.split(',').map(function (x) {
              return x.trim();
            });
            registryEntry.template.removeAttribute('bindable');
          } else {
            bindable = [];
          }

          return _ref = {}, _ref[elementName] = (0, _dynamicElement._createDynamicElement)(elementName, address, bindable), _ref;
        });
      }
    });
  }
});
define('aurelia-templating-resources/dynamic-element',['exports', 'aurelia-templating'], function (exports, _aureliaTemplating) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._createDynamicElement = _createDynamicElement;

  

  function _createDynamicElement(name, viewUrl, bindableNames) {
    var _dec, _dec2, _class;

    var DynamicElement = (_dec = (0, _aureliaTemplating.customElement)(name), _dec2 = (0, _aureliaTemplating.useView)(viewUrl), _dec(_class = _dec2(_class = function () {
      function DynamicElement() {
        
      }

      DynamicElement.prototype.bind = function bind(bindingContext) {
        this.$parent = bindingContext;
      };

      return DynamicElement;
    }()) || _class) || _class);

    for (var i = 0, ii = bindableNames.length; i < ii; ++i) {
      (0, _aureliaTemplating.bindable)(bindableNames[i])(DynamicElement);
    }
    return DynamicElement;
  }
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"/assets/css/common/common.css\"></require>\n  <require from=\"/assets/css/common/common-modal-dialog.css\"></require>\n  <require from=\"/assets/css/common/common-form.css\"></require>\n  <require from=\"/assets/css/common/common-grid.css\"></require>\n  <require from=\"/assets/css/common/common-saif.css\"></require>\n  <require from=\"/assets/css/specific/app.css\"></require>\n\n  <require from=\"./views/_components/sign-in-form\"></require>\n  <require from=\"./views/_components/user-form\"></require>\n\n  <!-- sign-in-modal for refugees -->\n  <div if.bind=\"userDetails.profile=='R' && authzAction=='sign-in' && userDetails.account==null\" class=\"modal modal-visible\">\n    <div class=\"modal-dialog\">\n      <div class=\"modal-dialog-header\">\n        <div  rtl-right ltr-left> ${i18n(\"Sign in\")  & signal : 'language-change'} </div>\n        <div rtl-left ltr-right>\n          <a click.trigger=\"authzAction=null\" class=\"close\"></a>\n        </div>\n      </div>\n      <div class=\"modal-dialog-body\" style=\"height:200px\">\n        <sign-in-form></sign-in-form>\n      </div>\n      <div class=\"modal-dialog-footer\"></div>\n    </div>\n  </div>\n  <!-- end sign-in-modal for refugees-->\n\n  <!-- sign-up-modal for refugees -->\n  <div if.bind=\"userDetails.profile=='R' && authzAction=='sign-up'\" class=\"modal modal-visible\">\n    <div class=\"modal-dialog\" style=\"width:800px\">\n      <div class=\"modal-dialog-header\">\n        <div rtl-right ltr-left>${i18n(\"Sign up\")  & signal : 'language-change'}</div>\n        <div rtl-left ltr-right>\n          <a click.trigger=\"authzAction=null\" class=\"close\"></a>\n        </div>\n      </div>\n      <div class=\"modal-dialog-body\">\n        <user-form action=\"sign-up\" show-credentials=\"true\" show-identity=\"true\" show-details=\"true\"></user-form>\n      </div>\n      <div class=\"modal-dialog-footer\"></div>\n    </div>\n  </div>\n  <!-- end sign-in-modal-->\n\n  <!-- error modal -->\n  <div class=\"modal ${error ? 'modal-visible' : 'modal-hidden'}\">\n    <div class=\"modal-dialog\">\n      <div class=\"modal-dialog-header\">\n        <div>Une erreur s'est produite</div>\n        <div>\n          <a click.trigger=\"error=null\" class=\"close\"></a>\n        </div>\n      </div>\n      <div class=\"modal-dialog-body\">\n        Oops.\n      </div>\n      <div class=\"modal-dialog-footer\"></div>\n    </div>\n  </div>\n  <!-- end error modal -->\n\n  <!-- header -->\n\n  <header class=\"main-menu\">\n    <div class=\"languages\" ltr-left rtl-right>\n      <a class=\"circle ${userDetails.language=='fr' ? 'active' : ''}\" click.delegate=\"setUserLanguage('fr')\"> FR </a>\n      <a class=\"circle ${userDetails.language=='en' ? 'active' : ''}\" click.delegate=\"setUserLanguage('en')\"> EN </a>\n      <a class=\"circle ${userDetails.language=='ar' ? 'active' : ''}\" click.delegate=\"setUserLanguage('ar')\"> ع </a>\n      <a class=\"circle ${userDetails.language=='prs' ? 'active' : ''}\" click.delegate=\"setUserLanguage('prs')\"> درى </a>\n    </div>\n\n    <div class=\"logo\">\n      <a route-href=\"route: home\"> <img style=\"width:100px; height:80px;\" src=\"/assets/img/header/logo.svg\" alt=\"Logo\" title=\"Comprendre pour Apprendre\"\n        /> </a>\n    </div>\n\n    <div class=\"menu-items\" if.bind=\"userDetails.account!=null\"  ltr-right rtl-left>\n      <p>${userDetails.account.name} </p>\n      <a click.delegate=\"viewProfile()\">${i18n(\"My profile\")  & signal : 'language-change'}</a> \n      | \n      <a click.delegate=\"signOut()\">${i18n(\"Sign out\")  & signal : 'language-change'}</a>\n    </div>\n\n    <div class=\"menu-items\" if.bind=\"userDetails.account==null && userDetails.profile=='R'\" ltr-right rtl-left>\n      <button click.delegate=\"authzAction='sign-up'\">${i18n(\"Sign up\")  & signal : 'language-change'}</button>\n      <button click.delegate=\"authzAction='sign-in'\">${i18n(\"Sign in\")  & signal : 'language-change'}</button>\n    </div>\n  </header>\n\n  <router-view></router-view>\n\n  <div class=\"footer\" style=\"text-align:center\">\n    <a route-href=\"route:about\">${i18n(\"About\")  & signal : 'language-change'}</a>\n  </div>\n</template>"; });
define('text!views/about.html', ['module'], function(module) { module.exports = "<template>\n\n    <require from=\"/assets/css/specific/about.css\"></require>\n\n    <div class=\"about-container\">\n        <div class=\"about-block  bg-yellow\">\n            <div class=\"text-block\">\n                <h1> La situation</h1>\n                L’Etat ne propose pas des cours de français aux demandeurs d’asile. Les associations et les institutions n’ont pas suffisamment\n                de personnel formé ni de budget pour répondre aux besoins. De plus les programmes d’apprentissage de la langue\n                existants manquent de visibilité. Pour les réfugiés, les offres d’apprentissage de français interviennent\n                très tard (de six mois à un an après avoir obtenu la protection), n’excèdent pas un niveau basique et ne\n                sont pas adaptées aux besoins des réfugiés. Ainsi, les demandeurs d’asile ne peuvent être autonomes et sont\n                perçus comme un poids par la société. L’impossibilité de communiquer et le repli sur soi de certains d’entre\n                eux alimente l’incompréhension, les idées reçues et la xénophobie. Quand ils obtiennent la protection internationale,\n                ils ont d’énormes difficultés pour s’intégrer et accéder aux études supérieures, aux formations professionnelles\n                et au travail.\n\n            </div>\n            <div class=\"image-block\" rtl-left ltr-right>\n                <img src=\"/assets/img/about/situation.png\" />\n            </div>\n        </div>\n        <div class=\"about-block \" style=\"display:block\">\n            <h1>Notre Objectif </h1><br/>\n            <div style=\"display:flex;\">\n                <div class=\"text-block\" style=\"width:50%\">\n                    <b>Se coordonner entre institutions (universités, écoles de langue, écoles de formation professionnelle, bibliothèques), associations, réfugiés et Ministères (de l’Intérieur, de l’Emploi, de l’Education Nationale, de la Francophonie) ainsi que collectivités locales pour :</b><br/><br/>\n                    - Développer les offres et les initiatives innovantes. <br/><br/>\n                    - Promouvoir une politique linguistique pilotée par une « Agence Nationale de la Langue Française ».\n\n                </div>\n                <div class=\"text-block\" style=\"width:50%\">\n                    <b>Grâce à une plateforme internet :</b><br/><br/><br/>\n                    - Permettre aux demandeurs d’asile et aux réfugiés d’avoir accès aux différentes formations de français qui répondent à leurs besoins (communiquer, accéder aux formations universitaires ou professionnelles) <br/><br/>\n                    - Les mettre en relation avec des bénévoles de français, interprètes ou autres personnes pouvant les aider dans leur parcours de formation.\n                </div>\n            </div>\n        </div>\n        <div class=\"about-block bg-blue\">\n            <div class=\"text-block\">\n                <h1> Un Collectif </h1>\n                <b>Service Jésuite des réfugiés (JRS France) Fondateur</b><br/>\n                Bibliothèques Sans Frontières<br/>\n                Centre d’Action Sociale Protestante (CASP),<br/>\n                Service Réfugié du Pôle Asile Centre de Recherche et d’Action Sociale (CERAS)<br/>\n                Institut National des Langues et Civilisations Orientales (INALCO)<br/>\n                Kiron<br/>\n                Université Américaine de Paris<br/> //we wait for thier authuraisation\n                Sciences Po Paris<br/>\n                Singa<br/>\n                Wintegreat<br/>\n\n            </div>\n            <div class=\"image-block\"  rtl-left ltr-right>\n                <img src=\"/assets/img/about/moyens.JPG\" />\n            </div>\n        </div>\n        <div class=\"about-block bg-rose\">\n            <div class=\"image-block\">\n                <img src=\"/assets/img/about/rejoignez-nous.png\" />\n            </div>\n            <div class=\"text-block\">\n                <h1>Rejoignez-nous </h1>\n                Institutions, bénévoles, professionnels, fonctionnaires, chacun a son rôle à jouer pour accueillir autrement.<br/>          <!--Inscrivez vous sur le portail : XXXX<br/>-->\n                <br/> Contact : <a href=\"mailto:comprendrepourapprendre@gmail.com\"> comprendrepourapprendre@gmail.com</a><br/>                Plus d’informations sur notre page\n                <a href=\"https://www.facebook.com/search/top/?q=comprendre%20pour%20apprendre\">Facebook</a>\n            </div>\n        </div>\n\n    </div>\n\n\n    <br><br>\n    <!--   test !-->\n\n</template>"; });
define('text!views/home.html', ['module'], function(module) { module.exports = "<template>\n\n    <require from=\"/assets/css/specific/home.css\"></require>\n    <require from=\"views/_components/user-form\"></require>\n    <require from=\"views/_components/sign-in-form\"></require>\n\n\n    <!-- old model\n    <div class=\"horizontal\" style=\"height:700px\">\n       \n        <div class=\"home-menu\" style=\"margin-right:auto;background-color:#0FCFBC;\" if.bind=\"userDetails.profile=='V' || userDetails.profile==null\">\n            <p style=\"text-align:center\">\n                <a route-href=\"route:volunteers\"><img src=\"/assets/img/home/profile-volunteer.png\" /></a>\n            </p>\n            <ul ltr-left rtl-right>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'fr')\">Je suis b&eacute;n&eacute;vole</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'ar')\">أنا متطوع</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'en')\">I'm a Volunteer</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'prs')\">من یک داوطلب هستم</a></li>\n            </ul>\n        </div>\n\n        <div class=\"home-welcome-panel home-welcome-volunteer-panel\" if.bind=\"userDetails.profile=='V'\">\n            <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:50px;height:50px; right:100%; bottom:25%;\">\n            <div if.bind=\"action==null\">\n                <div style=\"text-align:right\">\n                    <a click.delegate=\"setUserDetails(null)\" class=\"close\"></a>\n                </div>\n                <p>\n                    Je peux donner un peu de mon temps selon mes disponibilités pour :\n                    <ul>\n                        <li>aider dans l’apprentissage de français.</li>\n                        <li>le soutien pour certaines formations.</li>\n                        <li>l’interprétariat</li>\n                    </ul>\n                </p>\n                <div class=\"horizontal\" style=\"text-align:center\">\n                    <div style=\"flex-grow:1\">\n                        <img src=\"/assets/img/home/icon-video.svg\" class=\"icon\"> Je regarde la vidéo<br/> de présentation\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-in'\">\n                            <img src=\"/assets/img/home/icon-signin.svg\" class=\"icon\"> Je me connecte\n                        </a>\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-up'\">\n                            <img src=\"/assets/img/home/icon-signup.svg\" class=\"icon\"> Je m'inscris\n                        </a>\n                    </div>\n                </div>\n            </div>\n            <div if.bind=\"action=='sign-in'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < Retour</a>\n                </div>\n                <div style=\"margin-top:50px\">\n                    <sign-in-form success-route=\"/volunteers\"></sign-in-form>\n                </div>\n            </div>\n            <div if.bind=\"action=='sign-up'\">\n                <div>\n                    <a click.delegate=\"action=null\">\n                        < Retour</a>\n                </div>\n                <div style=\"margin-top:50px\">\n                    <user-form show-credentials=\"true\" show-identity=\"true\" show-details=\"false\" action=\"sign-up\" success-route=\"/volunteers/availabilities\"></user-form>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"home-menu\" style=\"background-color:#F45652;\" if.bind=\"userDetails.profile==null\">\n            \n            <ul ltr-left rtl-right>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'fr')\">${i18n(\"Refugee or asylum seeker\",\"fr\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'ar')\">${i18n(\"Refugee or asylum seeker\", \"ar\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'en')\">${i18n(\"Refugee or asylum seeker\", \"en\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'prs')\">${i18n(\"Refugee or asylum seeker\", \"prs\")}</a></li>\n            </ul>\n            <p style=\"text-align:center\">\n                <a route-href=\"route:refugees\"><img src=\"/assets/img/home/profile-refugee.png\" /></a>\n            </p>\n        </div>\n        \n\n        <div class=\"home-welcome-panel home-welcome-organisation-panel\" if.bind=\"userDetails.profile=='O'\">\n            <img src=\"/assets/img/common/arrow-left-saif.svg\" style=\"position:absolute; width:50px;height:50px; left:100%; bottom:25%;\">\n            <div if.bind=\"action==null\">\n                <div style=\"text-align:right\">\n                    <a click.delegate=\"setUserDetails(null)\" class=\"close\"></a>\n                </div>\n                <p>\n                    Je peux présenter mes offres de formation pour les réfugiés afin qu’ils retrouvent celles qui sont les plus adaptées à leurs\n                    besoins.\n                </p>\n                <div class=\"horizontal\" style=\"text-align:center\">\n                    <div style=\"flex-grow:1\">\n                        <img src=\"/assets/img/home/icon-video.svg\" class=\"icon\"> Je regarde la vidéo<br/> de présentation\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-in'\">\n                            <img src=\"/assets/img/home/icon-signin.svg\" class=\"icon\"> Je me connecte\n                        </a>\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-up'\">\n                            <img src=\"/assets/img/home/icon-signup.svg\" class=\"icon\"> Je m'inscris\n                        </a>\n                    </div>\n                </div>\n            </div>\n            <div if.bind=\"action=='sign-in'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < Retour</a>\n                </div>\n                <div style=\"margin-top:50px\">\n                    <sign-in-form success-route=\"/organisations\"></sign-in-form>\n                </div>\n            </div>\n            <div if.bind=\"action=='sign-up'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < Retour</a>\n                </div>\n                Explication de la procédure d'inscription\n            </div>\n        </div>\n        \n        <div class=\"home-menu\" style=\"background-color:#F7CF52;margin-left: auto;\" if.bind=\"userDetails.profile=='O' || userDetails.profile==null\">\n            <p style=\"text-align:center\">\n                <img src=\"/assets/img/home/profile-organisation.png\" />\n            </p>\n            <ul ltr-left rtl-right>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'fr')\">Je repr&eacute;sente une institution</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'ar')\">أنا أمثّل منظمة</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'en')\">I represent an institution</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'prs')\">من نماینده یک موسسه</a></li>\n            </ul>\n        </div>\n        \n    </div> -->\n\n    <div class=\"horizontal\" style=\"height:700px\">\n        <div class=\"vertical _home-menu\" style=\"margin-right:auto;background-color:#0FCFBC;\" if.bind=\"userDetails.profile=='V' || userDetails.profile==null\">\n            <div style=\"height:50%;overflow:hidden;\">\n                <img style=\"width:100%\" src=\"/assets/img/home/voulnteer.jpg\" />\n            </div>\n            <div style=\"height:50%;\">  <ul>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'fr')\">${i18n(\"I'm a Volunteer\",\"fr\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'ar')\">${i18n(\"I'm a Volunteer\",\"ar\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'en')\">${i18n(\"I'm a Volunteer\",\"en\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('V', 'prs')\">${i18n(\"I'm a Volunteer\",\"prs\")}</a></li>\n            </ul></div>\n        </div>\n\n        <div class=\"home-welcome-panel home-welcome-volunteer-panel\" if.bind=\"userDetails.profile=='V'\">\n            <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:50px;height:50px; right:100%; bottom:25%;\">\n            <div if.bind=\"action==null\">\n                <div style=\"text-align:right\">\n                    <a click.delegate=\"setUserDetails(null)\" class=\"close\"></a>\n                </div>\n                <p>\n                     ${i18n('I can help according to my availability in ')  & signal : 'language-change'} :\n                    <ul>\n                        <li> ${i18n('Learning French language')  & signal : 'language-change'}.</li>\n                        <li> ${i18n('Support in certain hight study formations')  & signal : 'language-change'}.</li>\n                        <li> ${i18n('Interpreting')  & signal : 'language-change'}.</li>\n                    </ul>\n                </p>\n                <div class=\"horizontal\" style=\"text-align:center\">\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='watch-video'\">\n                            <img src=\"/assets/img/home/icon-video.svg\" class=\"icon\"> ${i18n('Watch video')  & signal : 'language-change'}\n                        </a>\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-in'\">\n                            <img src=\"/assets/img/home/icon-signin.svg\" class=\"icon\"> ${i18n('Sign in')  & signal : 'language-change'}\n                        </a>\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-up'\">\n                            <img src=\"/assets/img/home/icon-signup.svg\" class=\"icon\"> ${i18n('Sign up')  & signal : 'language-change'}\n                        </a>\n                    </div>\n                </div>\n            </div>\n            <div if.bind=\"action=='watch-video'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < ${i18n('Back')  & signal : 'language-change'}</a>\n                </div>\n                <div style=\"margin-top:15px\">\n                    \n                </div>\n            </div>\n            <div if.bind=\"action=='sign-in'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < ${i18n('Back')  & signal : 'language-change'}</a>\n                </div>\n                <div style=\"margin-top:50px\">\n                    <sign-in-form success-route=\"/volunteers\"></sign-in-form>\n                </div>\n            </div>            \n            <div if.bind=\"action=='sign-up'\">\n                <div>\n                    <a click.delegate=\"action=null\">\n                        < ${i18n('Back')  & signal : 'language-change'}</a>\n                </div>\n                <div style=\"margin-top:50px\">\n                    <user-form show-credentials=\"true\" show-identity=\"true\" show-details=\"false\" action=\"sign-up\" success-route=\"/volunteers/availabilities\"></user-form>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"vertical _home-menu\" style=\"background-color:#F45652;\" if.bind=\"userDetails.profile==null\">\n            <div style=\"height:50%;\"> <ul>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'fr')\">${i18n(\"Refugee or asylum seeker\",\"fr\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'ar')\">${i18n(\"Refugee or asylum seeker\", \"ar\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'en')\">${i18n(\"Refugee or asylum seeker\", \"en\")}</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('R', 'prs')\">${i18n(\"Refugee or asylum seeker\", \"prs\")}</a></li>\n            </ul></div>\n               <div style=\"height:50%;overflow:hidden;position: relative;\">\n                <img style=\"width:100%;position: absolute;bottom: 0px;left: 0px;\" src=\"/assets/img/home/refugees.jpg\" />\n            </div>\n\n        </div>\n\n        <div class=\"home-welcome-panel home-welcome-organisation-panel\" if.bind=\"userDetails.profile=='O'\">\n            <img src=\"/assets/img/common/arrow-left-saif.svg\" style=\"position:absolute; width:50px;height:50px; left:100%; bottom:25%;\">\n            <div if.bind=\"action==null\">\n                <div style=\"text-align:right\">\n                    <a click.delegate=\"setUserDetails(null)\" class=\"close\"></a>\n                </div>\n                <p>\n                    ${i18n('I can present my offers for the refugees so they can find the ones that are most adapted to their needs')  & signal : 'language-change'}.\n                </p>\n                <div class=\"horizontal\" style=\"text-align:center\">\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='watch-video'\">\n                            <img src=\"/assets/img/home/icon-video.svg\" class=\"icon\"> ${i18n('Watch video')  & signal : 'language-change'}\n                        </a>\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-in'\">\n                            <img src=\"/assets/img/home/icon-signin.svg\" class=\"icon\"> ${i18n('Sign in')  & signal : 'language-change'}\n                        </a>\n                    </div>\n                    <div style=\"flex-grow:1\">\n                        <a click.delegate=\"action='sign-up'\">\n                            <img src=\"/assets/img/home/icon-signup.svg\" class=\"icon\"> ${i18n('Sign up')  & signal : 'language-change'}\n                        </a>\n                    </div>\n                </div>\n            </div>\n            <div if.bind=\"action=='watch-video'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < ${i18n('Back')  & signal : 'language-change'}</a>\n                </div>\n                <div style=\"text-align:center;margin-top:15px\">\n                    \n                    <video controls if.bind=\"userDetails.language=='fr'\">\n                        <source src=\"http://assets.cpafrance.fr.s3-website-eu-west-1.amazonaws.com/video-organisation.480.fr.mp4\"/>\n                        <source src=\"http://assets.cpafrance.fr.s3-website-eu-west-1.amazonaws.com/video-organisation.480.fr.webm\"/>\n                    </video>\n                    <video controls if.bind=\"userDetails.language!='fr'\">\n                        <source src=\"http://assets.cpafrance.fr.s3-website-eu-west-1.amazonaws.com/video-organisation.480.en.mp4\"/>\n                        <source src=\"http://assets.cpafrance.fr.s3-website-eu-west-1.amazonaws.com/video-organisation.480.en.webm\"/>\n                    </video>                    \n                </div>\n                \n            </div>\n            <div if.bind=\"action=='sign-in'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < ${i18n('Back')  & signal : 'language-change'}</a>\n                </div>\n                <div style=\"margin-top:50px\">\n                    <sign-in-form success-route=\"/organisations\"></sign-in-form>\n                </div>\n            </div>\n            <div if.bind=\"action=='sign-up'\">\n                <div style=\"text-align:left\">\n                    <a click.delegate=\"action=null\">\n                        < ${i18n('Back')  & signal : 'language-change'}</a>\n                </div>\n                Explication de la procédure d'inscription\n            </div>\n        </div>\n\n        <div class=\"vertical _home-menu\" style=\"background-color:#F7CF52;\" if.bind=\"userDetails.profile=='O' || userDetails.profile==null\">\n            <div style=\"height:50%; overflow:hidden;\" >\n                <img style=\"width:100%\" src=\"/assets/img/home/organistion.jpg\" />\n            </div>\n            <div style=\"height:50%;\"> <ul>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'fr')\">Je repr&eacute;sente une institution</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'ar')\">أنا أمثّل منظمة</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'en')\">I represent an institution</a></li>\n                <li style=\"height:80px\"><a click.delegate=\"setUserDetails('O', 'prs')\">من نماینده یک موسسه</a></li>\n            </ul></div>\n        </div>\n    </div>\n    <div if.bind=\"userDetails.language!=null\">\n        <compose view=\"./about.html\"></compose>\n    </div>\n</template>"; });
define('text!resources/elements/date-time-input.html', ['module'], function(module) { module.exports = "<template>\n    <input type=\"date\" value.bind=\"date & updateTrigger:'blur'\"/>\n    <input type=\"text\" value.bind=\"time & updateTrigger:'blur'\" style=\"width:5em\" placeholder=\"hh:mm\"/>\n</template>"; });
define('text!resources/elements/gmap.html', ['module'], function(module) { module.exports = "<template>\n    <div class=\"map\"></div>\n</template>"; });
define('text!resources/elements/multiple-select.html', ['module'], function(module) { module.exports = "<template bindable=\"placholder\">\n    <input type=\"text\" placeholder.bind=\"placeholder || ''\" style=\"width:100%\"/>\n    <ul class=\"multiple-select-items\">\n        <li repeat.for=\"x of source\" class=\"${x.selected===true ? 'selected':'not-selected'}\" click.delegate=\"click(x)\">\n            ${x.item.name}\n        </li>\n    </ul>\n</template>"; });
define('text!views/_components/sign-in-form.html', ['module'], function(module) { module.exports = "<template>\n    <div if.bind=\"action=='sign-in'\">\n        <form class=\"split-lg-30-70 label-right\" submit.delegate=\"processSignIn()\" if.bind=\"outcome.status!='ok'\">\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.mailAddress ? 'error':''}\">${i18n(\"Mail address\")  & signal : 'language-change'}</label>\n                <input type=\"email\" value.bind=\"input.mailAddress\" autofocus  change.delegate=\"outcome=null\" />\n            </div>\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.password ? 'error':''}\">${i18n(\"Password\")  & signal : 'language-change'}</label>\n                <input type=\"password\" value.bind=\"input.password\" change.delegate=\"outcome=null\" />\n            </div>\n            <div class=\"horizontal\" style=\"align-items:baseline\">\n                <input class=\"offset-lg-30\" type=\"checkbox\" checked.bind=\"userDetails.rememberMe\" /> ${i18n(\"remember me\")  & signal : 'language-change'}\n            </div>\n            <div>\n                <button class=\"offset-lg-30\">${i18n(\"Sign in\")  & signal : 'language-change'}</button>\n                <span if.bind=\"outcome.status=='unauthorized'\" class=\"red-alert\" style=\"font-size:smaller;margin:0px 10px\">\n                    ${i18n(\"Invalid mail address or password\") & signal : 'language-change'} \n                </span>\n                \n                <br/>\n                \n                <a class=\"offset-lg-30\" click.delegate=\"startPasswordRecoveryRequest()\" style=\"font-size:smaller;margin-top:15px;display:block\">\n                    ${i18n(\"Reset my password\") & signal : 'language-change'}\n                </a>\n\n            </div>\n        </form>\n    </div>\n\n    <div if.bind=\"action=='recover-password'\">\n        <div if.bind=\"outcome==null\">\n            <form class=\"split-lg-30-70 label-right\" submit.delegate=\"processPasswordRecoveryRequest()\" if.bind=\"outcome==null\">\n                <div class=\"horizontal\">\n                    <label>${i18n(\"Mail address\")  & signal : 'language-change'}</label>\n                    <input type=\"text\" value.bind=\"input.mailAddress\" />\n                </div>\n                <div class=\"horizontal  offset-lg-30\">\n                    <button>${i18n(\"Reset my password\") & signal : 'language-change'}</button>\n                </div>\n            </form>\n        </div>\n        <div if.bind=\"outcome.status=='accepted'\" style=\"text-align:center\">\n            <p>${i18n('Recover password confirmation') & signal : 'language-change'}</p>\n        </div>\n    </div>\n</template>"; });
define('text!views/_components/user-form.html', ['module'], function(module) { module.exports = "<template>\n\n    <form if.bind=\"outcome.status!='ok'\" class=\"split-lg-30-70 label-right\" submit.delegate=\"action=='sign-up' ? signUp() : updateProfile()\">\n        <div if.bind=\"showIdentity\">\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.firstName ? 'error':''}\">${i18n(\"First name\")  & signal : 'language-change'}</label>\n                <input type=\"text\" value.bind=\"input.firstName\" autofocus />\n            </div>\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.lastName ? 'error':''}\">${i18n(\"Last name\")  & signal : 'language-change'}</label>\n                <input type=\"text\" value.bind=\"input.lastName\" />\n            </div>\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.address ? 'error':''}\">${i18n(\"City or postal code\")  & signal : 'language-change'}</label>\n                <input type=\"text\" placeholder=\"\" place-autocomplete=\"target.bind : input; restrictions:regions\" /><br/>\n            </div>\n        </div>\n        <div if.bind=\"showCredentials\">\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.mailAddress ? 'error':''}\">${i18n(\"Mail address\")  & signal : 'language-change'}</label>\n                <input type=\"email\" value.bind=\"input.mailAddress\" change.delegate=\"outcome=null\" />\n            </div>\n            <div class=\"horizontal\">\n                <label class=\"${outcome.errors.password ? 'error':''}\">${i18n(\"Password\")  & signal : 'language-change'}</label>\n                <input type=\"password\" value.bind=\"input.password\" />\n            </div>\n        </div>\n        <div if.bind=\"showDetails\">\n            <div class=\"horizontal\">\n                <label>${i18n(\"Phone\")  & signal : 'language-change'}</label>\n                <input type=\"tel\" value.bind=\"input.phoneNumber\" placeholder=\"\" />\n            </div>  \n            <div class=\"horizontal\" if.bind=\"userDetails.profile=='R'\">\n                <label>Etudes</label>\n                <select value.bind=\"input.fieldOfStudy\">\n                    <option></option>\n                    <option repeat.for=\"x of referenceData.fieldOfStudy.all\">${x.name}</option>\n                </select>\n            </div>                        \n            <div class=\"horizontal\" if.bind=\"userDetails.profile=='R'\">\n                <label>${i18n(\"Mastered languages\")  & signal : 'language-change'}</label>\n                <multiple-select style=\"width:70%\" source.bind=\"referenceData.language.all\" selection.bind=\"input.languages\"></multiple-select>\n            </div>\n            \n        </div>\n        <div class=\"horizontal\" if.bind=\"state==null\">\n            <button class=\"offset-lg-30\" style=\"margin-bottom:50px\">\n                ${action==\"sign-up\" ?  i18n(\"Sign up\") : i18n(\"Update profile\")  & signal : 'language-change'}</button>\n            <span if.bind=\"outcome.status=='conflict'\" class=\"red-alert\" style=\"margin:0px 10px\">\n                ${i18n('Another acccout is linked to this address') & signal : 'language-change'}\n            </span>\n        </div>\n        <div class=\"offset-lg-30\" if.bind=\"state=='saving'\">\n            Enregistrement en cours...\n        </div>\n    </form>\n    <div if.bind=\"outcome.status=='ok'\" style=\"text-align:center\">\n        <div style=\"text-align:center;margin-bottom:20px;font-weight:bold\">\n            <img src=\"/assets/img/common/icon-checked.svg\" style=\"width:80px;margin-bottom:20px\"><br/>\n            ${action=='sign-up' ? \"Merci pour votre inscription, vous êtes désormais connecté\" : \"Merci, votre profil a été mis à jour.\"}\n        </div>        \n    </div>\n</template>"; });
define('text!views/organisations/index.html', ['module'], function(module) { module.exports = "<template>\n\n  <require from=\"/assets/css/specific/index.css\"></require>\n\n  <div id=\"menu\" class=\"menu\">\n    <figure id=\"menu-item-language-programs\" class=\"${router.currentInstruction.config.name=='organisations/language-programs' ? 'active' : ''}\">\n      <a route-href=\"route: organisations/language-programs\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-language-program.svg\" />\n      </a>\n      <figcaption>${i18n(\"French courses\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-teachings\" class=\"${router.currentInstruction.config.name=='organisations/teachings' ? 'active' : ''}\">\n      <a route-href=\"route: organisations/teachings\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-teaching.svg\" />\n      </a>\n      <figcaption>${i18n(\"University studies\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-professional-programs\" class=\"${router.currentInstruction.config.name=='organisations/professional-programs' ? 'active' : ''}\">\n      <a route-href=\"route: organisations/professional-programs\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-professional-program.svg\" />\n      </a>\n      <figcaption> ${i18n(\"Professional training\") & signal : 'language-change'} </figcaption>\n    </figure>\n    <figure id=\"menu-item-workshops\" class=\"${router.currentInstruction.config.name=='organisations/workshops' ? 'active' : ''}\">\n      <a route-href=\"route: organisations/workshops\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-workshop.svg\" />\n      </a>\n      <figcaption>${i18n(\"Workshops\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-events\" class=\"${router.currentInstruction.config.name=='organisations/events' ? 'active' : ''}\">\n      <a route-href=\"route: organisations/events\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-event.svg\" />\n      </a>\n      <figcaption>${i18n(\"Events\") & signal : 'language-change'}</figcaption>\n    </figure>\n\n  </div>\n<!--\n  <div class=\"separator\"> </div>\n-->\n  <router-view></router-view>\n\n\n</template>"; });
define('text!views/organisations/welcome.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"/assets/css/common/common-introduction.css\"></require>\n\n  <hr style=\"margin:0px 25px\"/>\n  \n  <div class=\"introduction\">\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #F74D2B;\" src=\"/assets/img/menu/icon-language-program.svg\" />\n      </div>\n      <div class=\"text-block\">\n         ${i18n(\"French courses adapted to your needs (higher education, professional French, French for daily life)\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #1B1464;\" src=\"/assets/img/menu/icon-teaching.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Higher education offers with linguistic support\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #8CC63F;\" src=\"/assets/img/menu/icon-professional-program.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Professional trainings with linguistic support\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #9E005D;\" src=\"/assets/img/menu/icon-workshop.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Workshops to develop communication skills for daily life\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #29ABE2;\" src=\"/assets/img/menu/icon-event.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Cultural, sport or recreational activities to improve your French\")  & signal : 'language-change'}\n      </div>\n    </div>\n  </div>\n</template>"; });
define('text!views/refugees/index.html', ['module'], function(module) { module.exports = "<template>\n\n  <require from=\"/assets/css/specific/index.css\"></require>\n\n  <div id=\"menu\" class=\"menu\">\n    <figure id=\"menu-item-language-programs\" class=\"${router.currentInstruction.config.name=='refugees/language-programs' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/language-programs\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-language-program.svg\" />\n      </a>\n      <figcaption>${i18n(\"French courses\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-teachings\" class=\"${router.currentInstruction.config.name=='refugees/teachings' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/teachings\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-teaching.svg\" />\n      </a>\n      <figcaption>${i18n(\"University studies\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-professional-programs\" class=\"${router.currentInstruction.config.name=='refugees/professional-programs' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/professional-programs\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-professional-program.svg\" />\n      </a>\n      <figcaption>${i18n(\"Professional training\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-workshops\" class=\"${router.currentInstruction.config.name=='refugees/workshops' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/workshops\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-workshop.svg\" />\n      </a>\n      <figcaption>${i18n(\"Workshops\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-events\" class=\"${router.currentInstruction.config.name=='refugees/events' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/events\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-event.svg\" />\n      </a>\n      <figcaption>${i18n(\"Events\") & signal : 'language-change'}</figcaption>\n    </figure>\n    <figure id=\"menu-item-libraries\" class=\"${router.currentInstruction.config.name=='refugees/self-teaching' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/self-teaching\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-library.svg\" />\n      </a>\n      <figcaption><figcaption>${i18n(\"Self learning\") & signal : 'language-change'}</figcaption></figcaption>\n    </figure>    \n    <figure id=\"menu-item-volunteers\" class=\"${router.currentInstruction.config.name=='refugees/meeting-requests' ? 'active' : ''}\">\n      <a route-href=\"route: refugees/meeting-requests\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-meeting-request.svg\" />\n      </a>\n      <figcaption><figcaption>${i18n(\"Meet a volunteer\") & signal : 'language-change'}</figcaption></figcaption>\n    </figure>\n  </div>\n\n  <router-view></router-view>\n\n  \n\n\n</template>"; });
define('text!views/refugees/welcome.html', ['module'], function(module) { module.exports = "<template>\n  <require from=\"/assets/css/common/common-introduction.css\"></require>\n\n  <hr style=\"margin:0px 25px\"/>\n\n  <div class=\"introduction\">\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #F74D2B;\" src=\"/assets/img/menu/icon-language-program.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"French courses adapted to your needs (higher education, professional French, French for daily life)\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #1B1464;\" src=\"/assets/img/menu/icon-teaching.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Higher education offers with linguistic support\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #8CC63F;\" src=\"/assets/img/menu/icon-professional-program.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Professional trainings with linguistic support\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #9E005D;\" src=\"/assets/img/menu/icon-workshop.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Workshops to develop communication skills for daily life\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #29ABE2;\" src=\"/assets/img/menu/icon-event.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Cultural, sport or recreational activities to improve your French\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #D4145A;\" src=\"/assets/img/menu/icon-library.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Directory of all the libraries offering self-learning methods\")  & signal : 'language-change'}\n      </div>\n    </div>\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #F4B821;\" src=\"/assets/img/menu/icon-meeting-request.svg\" />\n      </div>\n      <div class=\"text-block\">\n        ${i18n(\"Get in touch with a volunteer for support in learning French, interpreting or other trainings\")  & signal : 'language-change'}\n      </div>\n    </div>\n  </div>\n</template>"; });
define('text!views/volunteers/index.html', ['module'], function(module) { module.exports = "<template>\n\n  <require from=\"/assets/css/specific/index.css\"></require>\n\n  <div id=\"menu\" class=\"menu\" if.bind=\"userDetails.lastAction!='sign-up'\">\n\n    <figure id=\"menu-item-events\" class=\"${router.currentInstruction.config.name=='volunteers/availabilities' ? 'active' : ''}\">\n      <a route-href=\"route: volunteers/availabilities\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-availability.svg\" />\n      </a>\n      <figcaption>Disponibilités</figcaption>\n    </figure>\n    <figure id=\"menu-item-events\" class=\"${router.currentInstruction.config.name=='volunteers/events' ? 'active' : ''}\">\n      <a route-href=\"route: volunteers/events\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-event.svg\" />\n      </a>\n      <figcaption>Evenements pour les bénévoles</figcaption>\n    </figure>\n    <figure id=\"menu-item-libraries\">\n      <a>\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-library.svg\" />\n      </a>\n      <figcaption>Méthodes pour enseigner</figcaption>\n    </figure>\n    <figure id=\"menu-item-meeting-requests\" class=\"${router.currentInstruction.config.name=='volunteers/meeting-requests' ? 'active' : ''}\">\n      <a route-href=\"route: volunteers/meeting-requests\">\n        <img class=\"size-150-lg size-100-md\" src=\"/assets/img/menu/icon-meeting-request.svg\" />\n      </a>\n      <figcaption>Demande de rendez vous</figcaption>\n    </figure>\n\n  </div>\n\n  <router-view></router-view>\n\n\n\n\n</template>"; });
define('text!views/volunteers/welcome.html', ['module'], function(module) { module.exports = "<template>\n\n  <require from=\"/assets/css/common/common-introduction.css\"></require>\n  <require from=\"views/_components/user-form\"></require>\n\n  <div class=\"introduction\">\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #f4b821;\" src=\"/assets/img/menu/icon-availability.svg\" />\n      </div>\n      <div class=\"text-block\">\n        J'indique mes disponibilités pour m'engager dans un calendrier\n      </div>\n    </div>\n\n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #29abe2;\" src=\"/assets/img/menu/icon-event.svg\" />\n      </div>\n      <div class=\"text-block\">\n        Je peux trouver des événements qui m'aident dans mon engagement\n      </div>\n    </div>\n    \n    <div class=\"introduction-entry\">\n      <div class=\"images-block\" ltr-right rtl-left>\n        <img style=\"background-color: #f4b821;\" src=\"/assets/img/menu/icon-meeting-request.svg\" />\n      </div>\n      <div class=\"text-block\">\n        Une alerte m'indique les demandes de rendez-vous des réfugiés\n      </div>\n    </div>\n\n</template>"; });
define('text!views/organisations/events/events.html', ['module'], function(module) { module.exports = "<template>\n\n  <div class=\"_results\">\n\n    <div class=\"horizontal \" style=\"font-family:SegoeUiSlim\">\n      <form class=\"width-lg-70\" style=\"text-align:left\" ltr-left rtl-right>\n        <input type=\"checkbox\" checked.bind=\"filter.includeFutureEvents\" change.trigger=\"find()\" />\n        ${i18n(\"Include\") & signal : 'language-change'} ${filter.stereotype=='WORKSHOP' ? 'workshop' : 'events'} ${i18n(\"future\") & signal : 'language-change'}\n        <input type=\"checkbox\" checked.bind=\"filter.includePastEvents\" change.trigger=\"find()\" /> \n        ${i18n(\"Include\") & signal : 'language-change'} ${filter.stereotype=='WORKSHOP' ? 'workshop' : 'events'}  ${i18n(\"past\") & signal : 'language-change'}\n      </form>\n\n      <div class=\"width-lg-30\" style=\"text-align:right\" ltr-right rtl-left>\n        <a style=\"font-weight:bold\" click.delegate=\"new()\">\n          ${i18n(\"Create a new\") & signal : 'language-change'} ${filter.stereotype=='WORKSHOP' ? 'workshop' : 'event'}\n        </a>\n      </div>\n\n    </div>\n\n    <hr style=\"margin:30px 0px\" />\n\n    <div class=\"_result horizontal\" repeat.for=\"r of results\" style=\"margin-bottom:70px\">\n\n      <!--\n      <div class=\"width-lg-15\" style=\"font-size:25px;font-style:italic;text-align:center\">\n        <img src=\"/assets/img/common/icon-date.svg\" style=\"width:40px\"><br/> ${r.item.startDate | myDateFormat:'DD MMM'}\n      </div>\n      -->\n      <div class=\"width-lg-100 vertical\">\n        <div class=\"_result-header horizontal\" if.bind=\"r.action!='new'\">\n          <div class=\"width-lg-80\" style=\"text-align:left\">\n              <img src=\"/assets/img/common/icon-date.svg\" style=\"width:40px;margin-right:30px;vertical-align:middle\">\n              ${r.item.startDate | myDateFormat:'DD MMMM'} - ${r.item.subject}\n               \n          </div>\n          <div class=\"width-lg-20\" style=\"text-align:right\" if.bind=\"r.distance\">\n            <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            ${r.distance} km\n          </a>\n          </div>\n        </div>\n\n        <div class=\"_result-body horizontal\" if.bind=\"r.action!='new'\">\n\n          <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n            <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n              Ouverture des inscriptions le ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n            </div>\n            <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n              Cloture des inscriptions le ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n            </div>\n\n          </div>\n\n          <div class=\"vertical _infos-container\">\n\n            <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <img src=\"/assets/img/common/icon-date.svg\" /> Heure\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                De ${r.item.startDate | myDateFormat:'HH:mm'} à ${r.item.endDate | myDateFormat:'HH:mm'}\n              </div>\n            </div>\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <img src=\"/assets/img/common/icon-contact.svg\" /> Contact\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n                <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n              </div>\n            </div>\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> Adresse </a>\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                ${r.item.address.street1}<br/> ${r.item.address.street2}\n                <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              </div>\n            </div>\n\n          </div>\n        </div>\n        <div class=\"_result-body horizontal\" if.bind=\"r.action!='new'\">\n          <div style=\"background-color:#e7e9e8;padding:5px\" class=\"width-lg-100\">\n            <div style=\"font-family:SegoeUiSlim;text-align:justify;padding:10px\">\n              <p>${r.item.description}\n              </p>\n              <p style=\"text-align:right;font-weight:bold\" if.bind=\"r.item.link\">\n                <a href=\"${r.item.link}\" target=\"_blank\">En savoir plus...</a>\n              </p>\n            </div>\n          </div>\n        </div>\n        <div class=\"_result-footer\" style=\"text-align: right\" if.bind=\"r.item.id\">\n          <div if.bind=\"r.action==null\">\n            <button click.delegate=\"r.action='edit'\" onclick=\"doScroll(this, '_result')\">Modifier</button>\n            <button click.delegate=\"r.action='delete'\">Supprimer</button>\n          </div>\n          <div if.bind=\"r.action=='delete'\">\n            Etes vous sûr de vouloir supprimer cet ${filter.stereotype=='WORKSHOP' ? 'atelier' : 'évenement'} ?\n            <button click.delegate=\"delete(r)\">Oui</button>\n            <button click.delegate=\"cancelAction(r)\">Non</button>\n          </div>\n        </div>\n        <div class=\"_edit-container  ${r.action=='edit' || r.action=='new' ? '_edit-container-visible' : '_edit-container-hidden' }\">\n          <div style=\"text-align:right;padding-right:10px;padding-top:10px\">\n            <a click.delegate=\"cancelAction(r)\" class=\"close\"></a>\n          </div>\n\n          <form class=\"vertical\">\n            <div class=\"horizontal\">\n              <fieldset class=\"width-lg-50\">\n                <legend>Informations principales</legend>\n                <div class=\"horizontal no-margin\">\n                  <label class=\"width-lg-20 ${r.errors.startDate ? 'error' : ''}\"> Début </label>\n                  <div class=\"width-lg-80\">\n                    <date-time-input target.bind=\"r.item\" target-property=\"startDate\"></date-time-input>\n                  </div>\n                </div>\n                <div class=\"horizontal no-margin\">\n                  <label class=\"width-lg-20 ${r.errors.endDate ? 'error' : ''}\"> Fin </label>\n                  <date-time-input target.bind=\"r.item\" target-property=\"endDate\"></date-time-input>\n                </div>\n                <div class=\"horizontal no-margin\" if.bind=\"filter.stereotype!='WORKSHOP'\">\n                  <label class=\"width-lg-20 ${r.errors.audience ? 'error' : ''}\">Public </label>\n                  <select class=\"width-lg-80\" type=\"text\" value.bind=\"r.item.audience\">\n                    <option if.bind=\"r.action=='new'\"></option>\n                    <option value=\"REFUGEE\">Réfugié</option>\n                    <option value=\"VOLUNTEER\">Bénévole</option>\n                  </select>\n                </div>\n              </fieldset>\n              <fieldset class=\"width-lg-50\">\n                <legend>Inscription</legend>\n                <div class=\"horizontal no-margin\">\n                  <label class=\"width-lg-20 ${r.errors.registrationOpeningDate ? 'error' : ''}\">Début</label>\n                  <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationOpeningDate\" />\n                </div>\n                <div class=\"horizontal no-margin\">\n                  <label class=\"width-lg-20 ${r.errors.registrationClosingDate ? 'error' : ''}\">Fin</label>\n                  <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationClosingDate\" />\n                </div>\n                <!--\n                <button class=\"offset-lg-20\" if.bind=\"r.action!='new'\">Cloturer maintenant</button>\n                -->\n              </fieldset>\n\n            </div>\n            <div class=\"horizontal\">\n              <fieldset class=\"width-lg-50\">\n                <legend class=\"${r.errors.address ? 'error' : ''}\">Adresse</legend>\n                <input class=\"width-lg-100\" type=\"text\" placeholder=\"Adresse\" value.bind=\"r.item.address.street1\" place-autocomplete=\"target.bind: r.item ; user-selection-binding.bind:'street1'\"\n                />\n                <input class=\"width-lg-100\" type=\"text\" placeholder=\"complement d'adresse\" value.bind=\"r.item.address.street2\" />\n                <input class=\"width-lg-45\" type=\"text\" value.bind=\"r.item.address.postalCode\" /><input class=\"width-lg-45 offset-lg-10\"\n                  type=\"text\" value.bind=\"r.item.address.locality\" />\n              </fieldset>\n\n              <fieldset class=\"width-lg-50\">\n                <legend class=\"${r.errors.contact ? 'error' : ''}\">Contact</legend>\n                <input class=\"width-lg-100\" type=\"text\" placeholder=\"Nom\" value.bind=\"r.item.contact.name\" />\n                <input class=\"width-lg-100\" type=\"tel\" name=\"telephone\" id=\"telephone\" placeholder=\"telephone\" value.bind=\"r.item.contact.phoneNumber\"/>\n                <input class=\"width-lg-100\" type=\"email\" name=\"mailaddress\" id=\"mailaddress\" placeholder=\"Mail Adresse\" value.bind=\"r.item.contact.mailAddress\"/>\n              </fieldset>\n            </div>\n            <div class=\"horizontal\">\n              <fieldset class=\"width-lg-100\">\n                <legend>Sujet et description</legend>\n                <div class=\"horizontal\">\n                  <label class=\"width-lg-10 ${r.errors.subject ? 'error' : ''}\">Sujet</label>\n                  <input class=\"width-lg-90\" type=\"text\" value.bind=\"r.item.subject\" />\n                </div>\n                <div class=\"horizontal\">\n                  <label class=\"width-lg-10 ${r.errors.description ? 'error' : ''}\">Description</label>\n                  <textarea class=\"width-lg-90\" value.bind=\"r.item.description\"></textarea>\n                </div>\n                <div class=\"horizontal\">\n                  <label class=\"width-lg-10\">Lien</label>\n                  <input type=\"url\" class=\"width-lg-90\" value.bind=\"r.item.link\"/>\n                </div>\n              </fieldset>\n            </div>\n\n          </form>\n\n\n          <div style=\"text-align:center;padding:20px 0px\">\n            <button click.delegate=\"cancelAction(r)\">Annuler</button>\n            <button class=\"btn-orange\" click.delegate=\"save(r)\">Enregistrer</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n</template>"; });
define('text!views/organisations/language-programs/language-programs.html', ['module'], function(module) { module.exports = "<template>\n\n  <div class=\"_results\">\n    <div class=\"horizontal \" style=\"font-family:SegoeUiSlim\">\n      <form class=\"width-lg-70\" style=\"text-align:left\" ltr-left rtl-right >\n        <input type=\"checkbox\" checked.bind=\"filter.includeFutureEvents\" change.trigger=\"find()\" />${i18n(\"Include future courses\") & signal : 'language-change'}\n        <input type=\"checkbox\" checked.bind=\"filter.includePastEvents\" change.trigger=\"find()\" />${i18n(\"Include past courses\") & signal : 'language-change'}\n      </form>\n\n      <div class=\"width-lg-30\" style=\"text-align:right\" ltr-right rtl-left>\n        <a style=\"font-weight:bold\" click.delegate=\"new()\">${i18n(\"Create a new French course\") & signal : 'language-change'}</a>\n      </div>\n    </div>\n\n    <hr style=\"margin:30px 0px\" />\n\n    <div class=\"_result\" repeat.for=\"r of results\" id=\"result-${r.item.id}\">\n\n      <div class=\"_result-header\" if.bind=\"r.action!='new'\">\n      </div>\n      <div class=\"_result-body horizontal\" if.bind=\"r.action!='new'\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n          <div class=\"fit-to-content\">${r.item.type}</div>\n          <br/>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n            ${i18n(\"Registration opening\") & signal : 'language-change'} ${r.item.registrationOpeningDate | myDateFormat:'DD/MM/YYYY'}\n          </div>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n            ${i18n(\"Registration closing\") & signal : 'language-change'} ${r.item.registrationClosingDate | myDateFormat:'DD/MM/YYYY'}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\">\n           ${i18n(\"Required level\") & signal : 'language-change'} : ${r.item.level}\n          </div>\n        </div>\n\n        <div class=\"vertical _infos-container\">\n\n          <a class=\"link link-top\" style=\"right:5%\" href=\"#\"> <img src=\"/assets/img/common/icon-external-link.svg\" /></a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-date.svg\" />  ${i18n(\"Date\") & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              Du ${r.item.startDate | myDateFormat:'DD/MM/YYYY'}<br/> Au ${r.item.endDate | myDateFormat:'DD/MM/YYYY'}\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\") & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.item.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Address\") & signal : 'language-change'} </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              <br/>\n            </div>\n          </div>\n\n        </div>\n      </div>\n\n      <div class=\"_result-footer\" style=\"text-align: right\" if.bind=\"r.action!='new'\">\n        <div if.bind=\"r.action==null\">\n          <button click.delegate=\"r.action='edit'\" onclick=\"doScroll(this, '_result')\">${i18n(\"Modify\") & signal : 'language-change'}</button>\n          <button click.delegate=\"r.action='delete'\">${i18n(\"Delete\") & signal : 'language-change'}</button>\n        </div>\n        <div if.bind=\"r.action=='delete'\">\n          ${i18n(\"Are you sure you want to delete this offer?\") & signal : 'language-change'}\n          <button click.delegate=\"delete(r)\">${i18n(\"yes\") & signal : 'language-change'}</button>\n          <button click.delegate=\"cancelAction(r)\">${i18n(\"no\") & signal : 'language-change'}</button>\n        </div>\n      </div>\n\n      <div class=\"_edit-container  ${r.action=='edit' || r.action=='new' ? '_edit-container-visible' : '_edit-container-hidden' }\">\n        <div style=\"text-align:right;padding-right:10px;padding-top:10px\">\n          <a click.delegate=\"cancelAction(r)\" class=\"close\"></a>\n        </div>\n\n        <form class=\"vertical\">\n          <div class=\"horizontal\">\n            <fieldset class=\"width-lg-50\">\n              <legend>${i18n(\"Main Information\") & signal : 'language-change'}</legend>\n\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.startDate || r.errors.endDate  ? 'error' : ''}\"> ${i18n(\"Date\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-35\" type=\"date\" value.bind=\"r.item.startDate\" />\n                <input class=\"width-lg-35 offset-lg-10\" type=\"date\" value.bind=\"r.item.endDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.type ? 'error' : ''}\"> ${i18n(\"Type\") & signal : 'language-change'} </label>\n                <select class=\"width-lg-80\" value.bind=\"r.item.type\">\n                    <option if.bind=\"r.action=='new'\"></option>\n                    <option repeat.for=\"x of referenceData.languageLearningProgramType.all\" value.bind=\"x.name\">${x.name}</option>\n                </select>\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.level ? 'error' : ''}\"> ${i18n(\"Required level\") & signal : 'language-change'} </label>\n                <select class=\"width-lg-80\" value.bind=\"r.item.level\">\n                    <option if.bind=\"r.action=='new'\"></option>\n                    <option repeat.for=\"x of referenceData.level.all\" value.bind=\"x.name\">${x.name}</option>\n                </select>\n              </div>\n\n            </fieldset>\n            <fieldset class=\"width-lg-50\">\n              <legend>${i18n(\"Registration\") & signal : 'language-change'}</legend>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.registrationOpeningDate ? 'error' : ''}\"> ${i18n(\"From\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationOpeningDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.registrationClosingDate ? 'error' : ''}\"> ${i18n(\"To\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationClosingDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20\">${i18n(\"Link\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-80\" type=\"url\" value.bind=\"r.item.link\" placeholder=\"http://\" />\n              </div>              \n              <!--\n              <button class=\"offset-lg-20\" if.bind=\"r.action!='new'\">Cloturer maintenant</button>\n              -->\n            </fieldset>\n\n          </div>\n          <div class=\"horizontal\">\n            <fieldset class=\"width-lg-50\">\n              <legend class=\"${r.errors.address ? 'error' : ''}\">${i18n(\"Address\") & signal : 'language-change'}</legend>\n              <input class=\"width-lg-100\" type=\"text\" placeholder=\"Adresse\" value.bind=\"r.item.address.street1\" place-autocomplete=\"target.bind: r.item ; user-selection-binding.bind:'street1'\"/>\n              <input class=\"width-lg-100\" type=\"text\" placeholder=\"complement d'adresse\" value.bind=\"r.item.address.street2\" />\n              <input class=\"width-lg-45\" type=\"text\" value.bind=\"r.item.address.postalCode\" /><input class=\"width-lg-45 offset-lg-10\" type=\"text\" value.bind=\"r.item.address.locality\" />\n            </fieldset>\n\n            <fieldset class=\"width-lg-50\">\n              <legend class=\"${r.errors.contact ? 'error' : ''}\">${i18n(\"Contact\") & signal : 'language-change'}</legend>\n              <input class=\"width-lg-100\" type=\"text\" value.bind=\"r.item.contact.name\" placeholder=\"nom du contact\" />\n              <input class=\"width-lg-100\" type=\"tel\" value.bind=\"r.item.contact.phoneNumber\" placeholder=\"telephone\" />\n              <input class=\"width-lg-100\" type=\"email\" value.bind=\"r.item.contact.mailAddress\" placeholder=\"adresse email\" />\n            </fieldset>\n          </div>\n\n        </form>\n\n\n        <div style=\"text-align:center;padding:20px 0px\">\n          <button click.delegate=\"cancelAction(r)\">${i18n(\"Cancel\") & signal : 'language-change'}</button>\n          <button class=\"btn-orange\" click.delegate=\"save(r)\">${i18n(\"Save\") & signal : 'language-change'}</button>\n        </div>\n      </div>\n    </div>\n  </div>\n\n\n</template>"; });
define('text!views/organisations/professional-programs/professional-programs.html', ['module'], function(module) { module.exports = "<template>\n\n  <div class=\"_results\">\n    <div class=\"horizontal \" style=\"font-family:SegoeUiSlim\">\n      <form class=\"width-lg-65\" style=\"text-align:left\" ltr-left rtl-right>\n        <input type=\"checkbox\" checked.bind=\"filter.includeFutureEvents\" change.trigger=\"find()\" />${i18n(\"Include future trainings\") & signal : 'language-change'}\n        <input type=\"checkbox\" checked.bind=\"filter.includePastEvents\" change.trigger=\"find()\" />${i18n(\"Include past trainings\") & signal : 'language-change'}\n      </form>\n\n      <div class=\"width-lg-35\" style=\"text-align:right\" ltr-right rtl-left>\n        <a style=\"font-weight:bold\" click.delegate=\"new()\">${i18n(\"Create new professional training\") & signal : 'language-change'}</a>\n      </div>\n    </div>\n    <hr style=\"margin:30px 0px\" />\n\n    <div class=\"_result\" repeat.for=\"r of results\" id=\"result-${r.item.id}\">\n\n      <div class=\"_result-header\" if.bind=\"r.action!='new'\">\n      </div>\n      <div class=\"_result-body horizontal\" if.bind=\"r.action!='new'\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n          <div class=\"fit-to-content\">${r.item.domain}</div>\n          <br/>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n            Ouverture des inscriptions le ${r.item.registrationOpeningDate | myDateFormat:'DD/MM/YYYY'}\n          </div>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n            Cloture des inscriptions le ${r.item.registrationClosingDate | myDateFormat:'DD/MM/YYYY'}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\">\n            Niveau : ${r.item.level}\n          </div>\n        </div>\n\n        <div class=\"vertical _infos-container\">\n\n          <a class=\"link link-top\" style=\"right:5%\" href=\"#\"> <img src=\"/assets/img/common/icon-external-link.svg\" /></a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-date.svg\" /> Date\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              Du ${r.item.startDate | myDateFormat:'DD/MM/YYYY'}<br/> Au ${r.item.endDate | myDateFormat:'DD/MM/YYYY'}\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> Contact\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.item.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> Adresse </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              <br/>\n            </div>\n          </div>\n\n        </div>\n      </div>\n\n      <div class=\"_result-footer\" style=\"text-align: right\" if.bind=\"r.action!='new'\">\n        <div if.bind=\"r.action==null\">\n          <button click.delegate=\"r.action='edit'\" onclick=\"doScroll(this, '_result')\">Modifier</button>\n          <button click.delegate=\"r.action='delete'\">Supprimer</button>\n        </div>\n        <div if.bind=\"r.action=='delete'\">\n          Etes vous sûr de vouloir supprimer cette formation ?\n          <button click.delegate=\"delete(r)\">Oui</button>\n          <button click.delegate=\"cancelAction(r)\">Non</button>\n        </div>\n      </div>\n\n      <div class=\"_edit-container  ${r.action=='edit' || r.action=='new' ? '_edit-container-visible' : '_edit-container-hidden' }\">\n        <div style=\"text-align:right;padding-right:10px;padding-top:10px\">\n          <a click.delegate=\"cancelAction(r)\" class=\"close\"></a>\n        </div>\n\n        <form class=\"vertical\">\n          <div class=\"horizontal\">\n            <fieldset class=\"width-lg-50\">\n              <legend>Informations principales</legend>\n\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.startDate || r.errors.endDate  ? 'error' : ''}\"> Date </label>\n                <input class=\"width-lg-35\" type=\"date\" value.bind=\"r.item.startDate\" />\n                <input class=\"width-lg-35 offset-lg-10\" type=\"date\" value.bind=\"r.item.endDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.domain  ? 'error' : ''}\"> Domaine </label>\n                <select class=\"width-lg-80\" value.bind=\"r.item.domain\">\n                    <option if.bind=\"r.action=='new'\"></option>\n                    <option repeat.for=\"x of referenceData.professionalLearningProgramDomain.all\" value.bind=\"x.name\">${x.name}</option>\n                </select>\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.level  ? 'error' : ''}\"> Niveau </label>\n                <select class=\"width-lg-80\" value.bind=\"r.item.level\">\n                    <option if.bind=\"r.action=='new'\"></option>\n                    <option repeat.for=\"x of referenceData.level.all\" value.bind=\"x.name\">${x.name}</option>\n                </select>\n              </div>\n\n            </fieldset>\n            <fieldset class=\"width-lg-50\">\n              <legend>Inscription</legend>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.registrationOpeningDate  ? 'error' : ''}\"> Début </label>\n                <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationOpeningDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.registrationClosingDate  ? 'error' : ''}\"> Fin </label>\n                <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationClosingDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20\">Lien </label>\n                <input class=\"width-lg-80\" type=\"url\" value.bind=\"r.item.link\" placeholder=\"http://\" />\n              </div>\n              <!--\n              <button class=\"offset-lg-20\" if.bind=\"r.action!='new'\">Cloturer maintenant</button>\n              --></fieldset>\n\n          </div>\n          <div class=\"horizontal\">\n            <fieldset class=\"width-lg-50\">\n              <legend class=\"${r.errors.address  ? 'error' : ''}\">Adresse</legend>\n              <input class=\"width-lg-100\" type=\"text\" placeholder=\"Adresse\" value.bind=\"r.item.address.street1\" place-autocomplete=\"target.bind: r.item ; user-selection-binding.bind:'street1'\"\n              />\n              <input class=\"width-lg-100\" type=\"text\" placeholder=\"complement d'adresse\" value.bind=\"r.item.address.street2\" />\n              <input class=\"width-lg-45\" type=\"text\" value.bind=\"r.item.address.postalCode\" /><input class=\"width-lg-45 offset-lg-10\"\n                type=\"text\" value.bind=\"r.item.address.locality\" />\n            </fieldset>\n\n            <fieldset class=\"width-lg-50\">\n              <legend class=\"${r.errors.contact  ? 'error' : ''}\">Contact</legend>\n              <input class=\"width-lg-100\" type=\"text\" value.bind=\"r.item.contact.name\" placeholder=\"nom du contact\" />\n              <input class=\"width-lg-100\" type=\"tel\" value.bind=\"r.item.contact.phoneNumber\" placeholder=\"telephone\" />\n              <input class=\"width-lg-100\" type=\"email\" value.bind=\"r.item.contact.mailAddress\" placeholder=\"adresse email\" />\n            </fieldset>\n          </div>\n\n        </form>\n\n\n        <div style=\"text-align:center;padding:20px 0px\">\n          <button click.delegate=\"cancelAction(r)\">Annuler</button>\n          <button class=\"btn-orange\" click.delegate=\"save(r)\">Enregistrer</button>\n        </div>\n      </div>\n    </div>\n  </div>\n\n\n</template>"; });
define('text!views/organisations/profile/profile.html', ['module'], function(module) { module.exports = "<template>\n\n    <form class=\"width-lg-60 split-lg-30-70 label-right\" style=\"margin:auto\" submit.delegate=\"update()\" if.bind=\"outcome==null\">\n\n        <div class=\"horizontal\">\n            <label class=\"${errors.name ? 'error' : ''}\">${i18n(\"Name\")}</label>\n            <input type=\"text\" value.bind=\"input.name\" autofocus />\n        </div>\n\n        <div class=\"horizontal\">\n            <label class=\"${errors.address ? 'error' : ''}\">${i18n(\"Address\")  & signal : 'language-change'}</label>\n            <div class=\"width-lg-70 width-md-70  inputs-container\">\n                <input type=\"text\" value.bind=\"input.address.street1\" placeholder=\"\"  /><br/>\n                <input type=\"text\" value.bind=\"input.address.street2\" placeholder=\"Complément d'adresse'\"/><br/>\n                <input type=\"text\" value.bind=\"input.address.postalCode\" />\n                <input type=\"text\" value.bind=\"input.address.locality\" />\n            </div>\n        </div>\n        <div class=\"horizontal\">\n            <label class=\"${errors.contact ? 'error' : ''}\">${i18n(\"Contact\")  & signal : 'language-change'}</label>\n            <div class=\"width-lg-70 width-md-70 inputs-container\">\n                <input type=\"text\" value.bind=\"input.contact.name\" placeholder=\"\" /><br/>\n                <input type=\"text\" value.bind=\"input.contact.mailAddress\" placeholder=\"\" /><br/>\n                <input type=\"text\" value.bind=\"input.contact.phoneNumber\" /><br/>\n            </div>\n        </div>\n        <div class=\"horizontal\" repeat.for=\"i of input.additionalInformations | objectKeys\">\n            <label>${i}</label>\n            <input type=\"text\" value.bind=\"input.additionalInformations[i]\" />\n        </div>\n        <div class=\"horizontal\">\n            <label class=\"${errors.mailAddress ? 'error' : ''}\">${i18n(\"Mail address for login\")  & signal : 'language-change'}</label>\n            <input type=\"email\" value.bind=\"input.mailAddress\" />\n        </div>\n        <div class=\"horizontal\">\n            <label>${i18n(\"Password\")  & signal : 'language-change'}</label>\n            <input type=\"password\" value.bind=\"input.password\" />\n        </div>\n\n        <div class=\"horizontal\">\n            <button class=\"offset-lg-30\" style=\"margin-bottom:50px\">Mettre à jour mon profil</button>\n        </div>\n    </form>\n    <div if.bind=\"outcome=='success'\" style=\"text-align:center\">\n        <div style=\"text-align:center;margin-bottom:20px;font-weight:bold\">\n            <img src=\"/assets/img/common/icon-checked.svg\" style=\"width:80px;margin-bottom:20px\"><br/> Merci, votre profil\n            a été mis à jour.\n        </div>\n    </div>\n</template>"; });
define('text!views/organisations/teachings/teachings.html', ['module'], function(module) { module.exports = "<template>\n\n  <div class=\"_results\">\n    <div style=\"font-family:SegoeUiSlim;text-align:right\"  ltr-right rtl-left>\n      <a style=\"font-weight:bold\" click.delegate=\"new()\">\n        ${i18n(\"Create a new teaching\") & signal : 'language-change'}\n      </a>\n    </div>\n\n    <hr style=\"margin:30px 0px\" />\n\n    <div class=\"_result ${r.state=='saving' ? '_result-active' : ''}\" repeat.for=\"r of results\">\n\n      <div class=\"_result-header\" if.bind=\"r.action!='new'\">\n        ${r.item.fieldOfStudy}\n      </div>\n      <div class=\"_result-body horizontal\" if.bind=\"r.action!='new'\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n             ${i18n(\"Registration opening\") & signal : 'language-change'} ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n          </div>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n             ${i18n(\"Registration closing\") & signal : 'language-change'} ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\" if.bind=\"r.item.languageLevelRequired\">\n             ${i18n(\"Required level\") & signal : 'language-change'} : ${r.item.languageLevelRequired || \"Aucun\"}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\">\n            Master : ${r.item.master ? \"Oui\" : \"Non\"}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\">\n            licence : ${r.item.licence ? \"Oui\" : \"Non\"}\n          </div>\n        </div>\n\n        <div class=\"vertical _infos-container\">\n          <a class=\"link link-top\" style=\"right:5%\" href=\"${r.item.link}\" target=\"_blank\" if.bind=\"r.item.link\">\n            <img src=\"/assets/img/common/icon-external-link.svg\" />\n          </a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\") & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.item.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" />  ${i18n(\"Address\") & signal : 'language-change'} </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              <br/>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"_result-footer\" style=\"text-align: right\" if.bind=\"r.action!='new'\">\n        <div if.bind=\"r.action==null\">\n          <button click.delegate=\"r.action='edit'\" onclick=\"doScroll(this, '_result')\">${i18n(\"Modify\") & signal : 'language-change'}</button>\n          <button click.delegate=\"r.action='delete'\">${i18n(\"Delete\") & signal : 'language-change'}</button>\n        </div>\n        <div if.bind=\"r.action=='delete'\">\n          ${i18n(\"Are you sure you want to delete this offer?\") & signal : 'language-change'}\n          <button click.delegate=\"delete(r)\">${i18n(\"yes\") & signal : 'language-change'}</button>\n          <button click.delegate=\"cancelAction(r)\">${i18n(\"no\") & signal : 'language-change'}</button>\n        </div>\n      </div>\n\n      <div class=\"_edit-container  ${r.action=='edit' || r.action=='new' ? '_edit-container-visible' : '_edit-container-hidden' }\">\n        <div style=\"text-align:right;padding-right:10px;padding-top:10px\">\n          <a click.delegate=\"cancelAction(r)\" class=\"close\"></a>\n        </div>\n\n        <form class=\"vertical\">\n\n          <div class=\"horizontal\">\n            <fieldset class=\"width-lg-50\">\n              <legend>${i18n(\"Main Information\") & signal : 'language-change'}</legend>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.languageLevelRequired ? 'error' : ''}\"> ${i18n(\"Required level\") & signal : 'language-change'} </label>\n                <select class=\"width-lg-80\" value.bind=\"r.item.languageLevelRequired\">\n                  <option if.bind=\"r.action=='new'\"></option>\n                  <option repeat.for=\"l of referenceData.level.all\">${l.name}</option>\n                </select>\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.fieldOfStudy ? 'error' : ''}\"> ${i18n(\"Field of study\") & signal : 'language-change'} </label>\n                <select class=\"width-lg-80\" value.bind=\"r.item.fieldOfStudy\">\n                  <option if.bind=\"r.action=='new'\"></option>\n                  <option repeat.for=\"l of referenceData.fieldOfStudy.all\">${l.name}</option>\n                </select>\n              </div>\n              <div class=\"horizontal\">\n                <label class=\"width-lg-20\"> Cursus </label>\n                <div class=\"horizontal no-margin width-lg-40\" style=\"align-items: baseline;\">\n                  <input class=\" no-margin\" type=\"checkbox\" checked.bind=\"r.item.master\" />\n                  <label class=\"width-lg-35 offset-lg-5\">Master</label>\n                </div>\n                <div class=\"horizontal no-margin width-lg-40\" style=\"align-items: baseline;\">\n                  <input class=\"no-margin\" type=\"checkbox\" checked.bind=\"r.item.licence\" />\n                  <label class=\"width-lg-35 offset-lg-5\">Licence</label>\n                </div>\n              </div>\n            </fieldset>\n            <fieldset class=\"width-lg-50\">\n              <legend>${i18n(\"Registration\") & signal : 'language-change'}</legend>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.registrationOpeningDate ? 'error' : ''}\"> ${i18n(\"From\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationOpeningDate\" />\n              </div>\n              <div class=\"horizontal no-margin\">\n                <label class=\"width-lg-20 ${r.errors.registrationClosingDate ? 'error' : ''}\"> ${i18n(\"To\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-80\" type=\"date\" value.bind=\"r.item.registrationClosingDate\" />\n              </div>\n              <div class=\"horizontal\">\n                <label class=\"width-lg-20\">${i18n(\"Link\") & signal : 'language-change'} </label>\n                <input class=\"width-lg-80\" type=\"url\" value.bind=\"r.item.link\" placeholder=\"http://\" />\n              </div>\n            </fieldset>\n\n          </div>\n          <div class=\"horizontal\">\n            <fieldset class=\"width-lg-50 ${r.errors.contact ? 'error' : ''}\">\n              <legend class=\"${r.errors.contact ? 'error' : ''}\">${i18n(\"Contact\") & signal : 'language-change'}</legend>\n              <input class=\"width-lg-100\" type=\"text\" placeholder=\"Nom\" value.bind=\"r.item.contact.name\" />\n              <input class=\"width-lg-100\" type=\"tel\" name=\"telephone\" id=\"telephone\" placeholder=\"telephone\" value.bind=\"r.item.contact.phoneNumber\"\n              />\n              <input class=\"width-lg-100\" type=\"email\" name=\"mailaddress\" id=\"mailaddress\" placeholder=\"Mail Adresse\" value.bind=\"r.item.contact.mailAddress\"\n              />\n            </fieldset>\n\n          </div>\n\n        </form>\n\n\n        <div style=\"text-align:center;padding:20px 0px\">\n          <button click.delegate=\"cancelAction(r)\">${i18n(\"Cancel\") & signal : 'language-change'}</button>\n          <button class=\"btn-orange\" click.delegate=\"save(r)\">${i18n(\"Save\") & signal : 'language-change'}</button>\n        </div>\n      </div>\n    </div>\n  </div>\n</template>"; });
define('text!views/organisations/workshops/workshops.html', ['module'], function(module) { module.exports = "<template>\n  <compose view=\"../events/events.html\"></compose>\n</template>"; });
define('text!views/refugees/events/events-nour.html', ['module'], function(module) { module.exports = "<template>\n\n\n  \n\n\n  <form class=\"search-inline-form\" fixed-if-on-top submit.delegate=\"find()\">\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">Ville</option>\n      <option>Paris</option>\n      <option>Lyon</option>\n      <option>Marseille</option>\n    </select>\n\n    <select value.bind=\"filter.levelId\">\n      <option value=\"\">Sujet</option>\n    </select>\n\n    <button class=\"btn-orange\">Rechercher</button>\n  </form>\n\n\n  <div style=\"width:1000px;margin:auto;text-align:right\">\n    <form submit.delegate=\"sortByDistance()\">\n      <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n      <button>Classer par proximité</button>\n    </form>\n  </div>\n\n\n\n  <div class=\"results\" style=\"width:700px;\" if.bind=\"results.length>0\">\n    <div class=\"_result vertical\" repeat.for=\"r of results\">\n\n      <div class=\"_event-image-container\" style=\"background:url('/assets/img/unsorted/sorbonne.jpg') no-repeat center;background-size:cover;\">\n        <a class=\"link-big link-top\" style=\"right:10%\" href=\"#\"> <img src=\"/assets/img/common/icon-external-link.svg\" /></a>\n        <div class=\"fit-to-content\">\n          Organisé par : ${r.item.organisedBy}\n        </div>\n        <br/>\n        <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationStartDate).diff()>0\">\n          Ouverture des inscriptions : ${r.item.registrationStartDate | myDateFormat:'DD/MM/YYYY'}\n        </div>\n      </div>\n      <div class=\"_event-infos-container\">\n        <h2> ${r.item.subject} </h2>\n        <p style=\"text-align:justifyfont-size: 15px;line-height: 20px;font-family: segoeui;\">\n          ${r.item.description}\n        </p>\n        <div class=\"horizontal\">\n          <div>\n            <a click.delegate=\"viewLocation(r.item.address)\"> <img class=\"icon\" src=\"/assets/img/common/icon-address.svg\" />Adresse :</a>\n            ${r.item.address.street1} ${r.item.address.street2} ${r.item.address.postalCode} ${r.item.address.locality}\n          </div>\n          <div style=\"position:absolute; right:0%; transform: translateX(-100%);\" if.bind=\"r.distance\">\n            <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            ${r.distance} km\n          </a>\n          </div>\n        </div>\n        <p>\n          <img class=\"icon\" src=\"/assets/img/common/icon-contact.svg\" /> Contact : ${r.item.contact.name} (<a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>,\n          téléphone : ${r.item.contact.phoneNumber})\n        </p>\n        <p>\n          <img class=\"icon\" src=\"/assets/img/common/icon-date.svg\" />Début : ${r.item.startDate | myDateFormat:'DD/MM/YYYY'} - Fin\n          : ${r.item.endDate | myDateFormat:'DD/MM/YYYY'}\n        </p>\n      </div>\n      <div class=\"_event-result-footer\" style=\"background-color:black;\">c</div>\n    </div>\n  </div>\n</template>"; });
define('text!views/refugees/events/events.html', ['module'], function(module) { module.exports = "<template>\n\n  <form class=\"search-inline-form\" always-visible>\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">${i18n(\"City\") & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.city.event\" if.bind=\"stereotype==null\">${x}</option>\n      <option repeat.for=\"x of referenceData.city.workshop\" if.bind=\"stereotype=='WORKSHOP'\">${x}</option>\n    </select>\n\n    <button class=\"btn-orange\" click.trigger=\"find('list')\" class=\"${view=='list' ? 'button-active' : ''}\">${i18n(\"view list\") & signal : 'language-change'}</button>\n    <button class=\"btn-orange\" click.trigger=\"find('map')\" class=\"${view=='map' ? 'button-active' : ''}\">${i18n(\"view map\") & signal : 'language-change'}</button>\n  </form>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='map'\">\n    <gmap center.bind=\"userDetails.address\" places.bind=\"results\" placesFor.bind=\"events\"></gmap>\n  </div>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='list'\">\n    <div style=\"text-align:right;margin-bottom:25px\">\n      <form submit.delegate=\"sortByDistance()\">\n        <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n        <button>${i18n(\"Sort by distance\") & signal : 'language-change'}</button>\n      </form>\n    </div>\n\n    <div class=\"_result\" repeat.for=\"r of results\" style=\"margin-bottom:70px\">\n\n      <!--\n      <div class=\"width-lg-15\" style=\"font-size:25px;font-style:italic;text-align:center\">\n        <img src=\"/assets/img/common/icon-date.svg\" style=\"width:40px\"><br/> ${r.item.startDate | myDateFormat:'DD MMM'}\n      </div>\n      -->\n      <div class=\"width-lg-100 vertical\">\n        <div class=\"_result-header horizontal\">\n          <div class=\"width-lg-80 width-md-80\" style=\"text-align:left\" rtl-right ltr-left>\n            <img src=\"/assets/img/common/icon-date.svg\" style=\"width:40px;margin-right:30px;vertical-align:middle\">\n            ${r.item.startDate | myDateFormat:'DD MMMM'} - ${r.item.subject}\n          </div>\n          <div class=\"width-lg-20 width-md-20\" style=\"text-align:right\" if.bind=\"r.distance\" rtl-left ltr-right >\n            <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            <img src=\"/assets/img/common/icon-compass.svg\" style=\"width:30px;vertical-align:middle\"> ${r.distance} km\n          </a>\n          </div>\n        </div>\n\n        <div class=\"_result-body horizontal\">\n\n          <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n            <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n              ${i18n(\"Registration opening\") & signal : 'language-change'} : ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n            </div>\n            <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n              ${i18n(\"Registration closing\") & signal : 'language-change'} : ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n            </div>\n\n          </div>\n\n          <div class=\"vertical _infos-container\">\n\n            <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <img src=\"/assets/img/common/icon-time.svg\" /> ${i18n(\"Hour\") & signal : 'language-change'}\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                De ${r.item.startDate | myDateFormat:'HH:mm'} à ${r.item.endDate | myDateFormat:'HH:mm'}\n              </div>\n            </div>\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\" left-or-right>\n                <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\") & signal : 'language-change'}\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n                <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n              </div>\n            </div>\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\" left-or-right>\n                <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Address\") & signal : 'language-change'} </a>\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                ${r.item.address.street1}<br/> ${r.item.address.street2}\n                <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              </div>\n            </div>\n\n          </div>\n        </div>\n        <div class=\"_result-body\">\n          <div style=\"background-color:#e7e9e8;padding:5px;box-sizing: border-box;\" class=\"width-lg-100\">\n            ${i18n(\"Organised by\") & signal : 'language-change'} par ${r.item.organisedBy}\n\n            <div style=\"font-family:SegoeUiSlim;text-align:justify;padding:10px;\">\n              \n              <p>${r.item.description}</p>\n\n              <p style=\"text-align:right;font-weight:bold\" if.bind=\"r.item.link\">\n                <a href=\"${r.item.link}\" if.bind=\"r.item.link\" target=\"_blank\">${i18n(\"More\") & signal : 'language-change'}...</a>\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n     <br/>\n  \n</template>"; });
define('text!views/refugees/language-programs/language-programs.html', ['module'], function(module) { module.exports = "<template>  \n  \n  <form class=\"search-inline-form\" always-visible>\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">${i18n(\"City\")  & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.city.languageLearningProgram\">${x}</option>\n    </select>\n\n    <select value.bind=\"filter.levelId\">\n      <option value=\"\">${i18n(\"Required level\")  & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.level.languageLearningProgram\" value.bind=\"x.id\">${x.name}</option>\n    </select>\n\n    <button class=\"btn-orange\" click.trigger=\"find('list')\" class=\"${view=='list' ? 'button-active' : ''}\">${i18n(\"view list\")  & signal : 'language-change'}</button>\n    <button class=\"btn-orange\" click.trigger=\"find('map')\" class=\"${view=='map' ? 'button-active' : ''}\">${i18n(\"view map\")  & signal : 'language-change'}</button>\n  </form>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='map'\">\n    <gmap center.bind=\"userDetails.address\" places.bind=\"results\" placesFor.bind=\"languageProgram\"></gmap>\n  </div>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='list'\">\n    <div style=\"text-align:right;margin-bottom:25px\">\n      <form submit.delegate=\"sortByDistance()\">\n        <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n        <button>${i18n(\"Sort by distance\")  & signal : 'language-change'}</button>\n      </form>\n    </div>\n\n    <div class=\"_result\" repeat.for=\"r of results\">\n      <div class=\"_result-header horizontal\">\n        <div style=\"text-align:left\" class=\"width-lg-80 width-md-80\" rtl-right ltr-left>\n          ${r.item.organisation}\n        </div>\n        <div style=\"text-align:right\" class=\"width-lg-20 width-md-20\" if.bind=\"r.distance\" rtl-left ltr-right>\n          <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            <img src=\"/assets/img/common/icon-compass.svg\" style=\"width:30px;vertical-align:middle\"> ${r.distance} km\n          </a>\n        </div>\n      </div>\n      <div class=\"_result-body horizontal\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n          <div class=\"fit-to-content\">${r.item.type}</div><br/>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n            ${i18n(\"Registration opening\")  & signal : 'language-change'} : ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n          </div>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n            ${i18n(\"Registration closing\")  & signal : 'language-change'} : ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\"> ${i18n(\"Required level\")  & signal : 'language-change'} : ${r.item.level}\n          </div>\n\n        </div>\n\n        <div class=\"vertical _infos-container\">\n          <a class=\"link-big link-bottom\" style=\"right:5%;\" href=\"${r.item.link}\" target=\"_blank\" if.bind=\"r.item.link\">\n            <img src=\"/assets/img/common/icon-external-link.svg\" />\n          </a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-date.svg\" /> ${i18n(\"Date\")  & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              Du ${r.item.startDate | myDateFormat:'DD/MM/YYYY'}<br/> Au ${r.item.endDate | myDateFormat:'DD/MM/YYYY'}\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\")  & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Address\")  & signal : 'language-change'} </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n            </div>\n          </div>\n\n        </div>\n      </div>\n\n\n      <div class=\"_result-footer\">\n\n      </div>\n\n\n    </div>\n     <br/>\n\n</template>"; });
define('text!views/refugees/meeting-requests/meeting-requests.html', ['module'], function(module) { module.exports = "<template>\n\n    <div class=\"_results\" if.bind=\"userDetails.account.profile!='R'\" style=\"text-align:center\">\n        <p>${i18n(\"No access, please sign up or sign in\")  & signal : 'language-change'}</p>\n    </div>\n    <div class=\"_results\" if.bind=\"userDetails.account && userDetails.account.profile=='R'\">\n\n\n\t\t<div class=\"horizontal \" style=\"font-family:SegoeUiSlim;margin-bottom:15px\" >\n\t\t\t<form class=\"width-lg-70\" style=\"text-align:left\" ltr-left rtl-right>\n\t\t\t\t<input type=\"radio\" name=\"accepted\" checked.bind=\"filter.accepted\" value=\"true\" change.trigger=\"find()\" />  ${i18n(\"Accepted requests\")  & signal : 'language-change'}\n\t\t\t\t<input type=\"radio\" name=\"accepted\" checked.bind=\"filter.accepted\" value=\"false\" change.trigger=\"find()\" />  ${i18n(\"On Wating requests\")  & signal : 'language-change'}\n\t\t\t</form>\n            <div class=\"width-lg-30\" style=\"font-family:SegoeUiSlim;text-align:right\" ltr-right rtl-left>\n                <a style=\"font-weight:bold\" click.delegate=\"new()\"> ${i18n(\"New appointment request\")  & signal : 'language-change'}</a>\n            </div>            \n\t\t</div>\n\n        <hr style=\"margin:30px 0px\" />\n\n        <!-- results block -->\n\n        <div class=\"_result\" repeat.for=\"r of results\" style=\"margin-bottom:70px\">\n\n            <!-- new block -->\n\n            <div class=\"_edit-container\" if.bind=\"r.action=='new'\">\n                <div style=\"text-align:right;padding-right:10px;padding-top:10px\">\n                    <a click.delegate=\"cancelNew()\" class=\"close\"></a>\n                </div>\n\n                <form class=\"split-lg-30-70 label-right\" submit.delegate=\"save(r)\" if.bind=\"r.action=='new'\">\n                    <fieldset>\n                        <legend>${i18n(\"My request\")  & signal : 'language-change'}</legend>\n                        <div class=\"horizontal\">\n                            <label class=\"${r.errors.reason ? 'error' : ''}\">${i18n(\"Request type\")  & signal : 'language-change'} *</label>\n                            <div class=\"horizontal  width-lg-70\">\n                                <div style=\"flex:1;margin-top:7px\">\n                                    <input type=\"radio\" name=\"reason\" checked.bind=\"r.item.reason\" value=\"INTERPRETING\">${i18n(\"Interpreting\")  & signal : 'language-change'}\n                                    <br/> (${refugee.languages.join(', ')})\n                                </div>\n                                <div style=\"flex:1;margin-top:7px\">\n                                    <input type=\"radio\" name=\"reason\" checked.bind=\"r.item.reason\" value=\"SUPPORT_IN_STUDIES\">${i18n(\"Support in studies\")  & signal : 'language-change'}\n                                    <br/> (${refugee.fieldOfStudy})\n                                </div>\n                                <div style=\"flex:1;margin-top:7px\">\n                                    <input type=\"radio\" name=\"reason\" checked.bind=\"r.item.reason\" value.bind=\"CONVERSATION\">${i18n(\"French lessons\")  & signal : 'language-change'}\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"horizontal\">\n                            <label>${i18n(\"Additional information\")  & signal : 'language-change'} <i>(${i18n(\"optional\")  & signal : 'language-change'})</i></label>\n                            <input type=\"text\" value.bind=\"r.item.additionalInformations\"  />\n                        </div>\n                        <div class=\"horizontal\">\n                            <label>${i18n(\"Date\")  & signal : 'language-change'} <i>(${i18n(\"optional\")  & signal : 'language-change'})</i></label>\n                            <input type=\"text\" value.bind=\"r.item.dateConstraint\" />\n                        </div>\n                        <div class=\"horizontal\">\n                            <label class=\"${r.errors.refugeeLocation ? 'error' : ''}\">${i18n(\"City or postal code\")  & signal : 'language-change'} *</label>\n                            <input type=\"text\" placeholder=\"\" place-autocomplete=\"target.bind : r.item;target-property.bind:'refugeeLocation'\" /><br/>\n                        </div>\n\n                    </fieldset>\n                    <fieldset>\n                        <legend>${i18n(\"To contact you\")  & signal : 'language-change'}</legend>\n                        <div class=\"horizontal\">\n                            <label>${i18n(\"Telephone\")  & signal : 'language-change'} <i>(${i18n(\"optional\")  & signal : 'language-change'})</i></label>\n                            <input type=\"tel\" value.bind=\"r.item.refugee.phoneNumber\" /><br/>\n                        </div>\n                        <div class=\"horizontal\">\n                            <label>${i18n(\"Mail address\")  & signal : 'language-change'}</label>\n                            <input type=\"tel\" value.bind=\"r.item.refugee.mailAddress\" /><br/>\n                        </div>\n                        <div class=\"horizontal\">\n                            <button class=\"offset-lg-30\">${i18n(\"Send my request\")  & signal : 'language-change'}</button>\n                        </div>\n                    </fieldset>\n                </form>\n            </div>\n            <!--new block -->\n\n\n\n            <!-- result block -->\n            <div class=\"width-lg-100 vertical\" if.bind=\"r.action!='new'\">\n                 \n                <div class=\"_result-header horizontal\" if.bind=\"r.item.volunteer\" rtl-right ltr-left> <!-- the meeting request has been accepted -->\n                    <div class=\"width-lg-70\" ltr-left rtl-right>\n                        <img src=\"/assets/img/common/icon-checked.svg\" style=\"width:30px;height:30px;vertical-align:middle;\">\n                        <span style=\"padding-left:15px;padding-right:15px\">\n                            ${i18n(\"Accepted by\")  & signal : 'language-change'} : ${r.item.volunteer.name} le ${r.item.acceptationDate | myDateFormat:'DD MMMM'}\n                        </span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"width-lg-30\" ltr-right rtl-left if.bind=\"r.action==null && r.item.confirmationDate==null\">\n\t\t\t\t\t\t<button click.delegate=\"r.action='confirm'\">Confirmer</button>\n\t\t\t\t\t\t<button click.delegate=\"r.action='reSubmit'\">Resoumettre</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"width-lg-30\" ltr-right rtl-left if.bind=\"r.action==null && r.item.confirmationDate!=null\">\n\t\t\t\t\t\t<button click.delegate=\"r.action='report-problem'\">Signaler un problème</button>\n\t\t\t\t\t</div>                    \n                </div>\n\n                <div class=\"_result-header horizontal\" if.bind=\"!r.item.volunteer\" rtl-right ltr-left> <!-- the meeting request has been not been accepted yet -->\n                     ${i18n(\"Posted the\")  & signal : 'language-change'} ${r.item.postDate | myDateFormat:'DD MMMM'}\n                </div>     \n\n                <!-- confirm or cancel -->\n\t\t\t\t<div class=\"_result-body\" style=\"padding:5px\" if.bind=\"r.action=='confirm' || r.action=='reSubmit'\">\n\t\t\t\t\t ${r.item.volunteer.name} a accepté votre demande de RDV. Vous pouvez : <br/>\n\t\t\t\t\t<p class=\"offset-lg-5\" style=\"font-family:SegoeUI;line-height:35px\">\n\t\t\t\t\t\t<input type=\"radio\" name=\"action\" checked.bind=\"r.action\" value=\"confirm\">\n\t\t\t\t\t\tConfirmer, après avoir été en contact avec le bénévole par mail ou par téléphone, que la rencontre va bien avoir lieu.\n                        <br/>\n\t\t\t\t\t\t<input type=\"radio\" name=\"action\" checked.bind=\"r.action\" value=\"reSubmit\">\n\t\t\t\t\t\tResoumettre la demande à d'autre bénévole, si vous n'avez pas été en contact avec le bénévole ou si celui-ci ne peut finalement pas accepter la demande\n\t\t\t\t\t</p>\n\t\t\t\t\t<p class=\"offset-lg-5\">\n                        <button if.bind=\"r.action=='confirm'\" click.delegate=\"confirm(r)\">Confirmer</button>\n\t\t\t\t\t\t<button if.bind=\"r.action=='reSubmit'\" click.delegate=\"reSubmit(r)\">Resoumettre</button>\n                        <button click.delegate=\"r.action=null\">Annuler</button>\n\t\t\t\t\t</p>\n\t\t\t\t</div>\n\n                <!-- report problem -->\n\t\t\t\t<div class=\"_result-body\" style=\"padding:5px\" if.bind=\"r.action=='report-problem'\">\n\t\t\t\t\t <textarea class=\"width-lg-100\" style=\"height:10em\" autofocus></textarea><br/>\n                     <button click.delegate=\"reportProblem(r)\">Envoyer</button>\n                     <button click.delegate=\"r.action=null\">Annuler</button>\n\n\t\t\t\t</div>\n\n                <div class=\"_result-body horizontal\">\n\n                    <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n                        <div if.bind=\"r.item.reason == 'INTERPRETING'\">\n                            <div class=\"fit-to-content\">\n                                 ${i18n(\"For\")  & signal : 'language-change'} :  ${i18n(\"Interpreting\")  & signal : 'language-change'} (${r.item.languages.join(' ou ')})\n                            </div>\n                        </div>\n                        <div if.bind=\"r.item.reason == 'SUPPORT_IN_STUDIES'\">\n                            <div class=\"fit-to-content\">\n                                 ${i18n(\"For\")  & signal : 'language-change'} :  ${i18n(\"Support in studies\")  & signal : 'language-change'} (${r.item.fieldOfStudy})\n                            </div>\n                        </div>\n                        <div if.bind=\"r.item.reason == 'CONVERSATION'\">\n                            <div class=\"fit-to-content\">\n                                 ${i18n(\"For\")  & signal : 'language-change'} :  ${i18n(\"French lessons\")  & signal : 'language-change'}\n                            </div>                            \n                        </div>\n                    </div>\n\n                    <div class=\"vertical _infos-container\">\n\n                        <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n                        <div class=\"horizontal\">\n                            <div class=\"width-lg-40 info-title\" left-or-right>\n                                <img src=\"/assets/img/common/icon-date.svg\" /> ${i18n(\"Date\")  & signal : 'language-change'} :\n                            </div>\n                            <div class=\"width-lg-60 info-text\">\n                                ${r.item.dateConstraint}\n                            </div>\n                        </div>\n                        <div class=\"horizontal\">\n                            <div class=\"width-lg-40 info-title\" left-or-right>\n                                <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Region\")  & signal : 'language-change'} :\n                            </div>\n                            <div class=\"width-lg-60 info-text\">\n                                ${r.item.refugeeLocation.postalCode} ${r.item.refugeeLocation.locality}\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"_result-body\">\n                    <div style=\"background-color:#e7e9e8;padding:5px;box-sizing: border-box;\" class=\"width-lg-100\">\n                        ${i18n(\"Additional information\")  & signal : 'language-change'} : ${r.item.additionalInformations}\n                    </div>\n                </div>\n            </div>\n\n        </div>\n    </div>\n     <br/>\n</template>"; });
define('text!views/refugees/professional-programs/professional-programs.html', ['module'], function(module) { module.exports = "<template>\n\n  <form class=\"search-inline-form\" always-visible>\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">${i18n(\"City\")  & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.city.professionalLearningProgram\">${x}</option>\n    </select>\n\n    <select value.bind=\"filter.levelId\">\n      <option value=\"\">${i18n(\"Required level\")  & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.level.professionalLearningProgram\" value.bind=\"x.id\">${x.name}</option>\n    </select>\n\n    <select value.bind=\"filter.domainId\">\n      <option value=\"\">${i18n(\"Domain\")  & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.professionalLearningProgramDomain.professionalLearningProgram\" value.bind=\"x.id\">${x.name}</option>\n    </select>    \n\n    <button class=\"btn-orange\" click.trigger=\"find('list')\" class=\"${view=='list' ? 'button-active' : ''}\">${i18n(\"view list\")  & signal : 'language-change'}</button>\n    <button class=\"btn-orange\" click.trigger=\"find('map')\" class=\"${view=='map' ? 'button-active' : ''}\">${i18n(\"view map\")  & signal : 'language-change'}</button>\n  </form>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='map'\">\n    <gmap center.bind=\"userDetails.address\" places.bind=\"results\" placesFor.bind=\"professional-programs\"></gmap>\n  </div>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='list'\">\n    <div style=\"text-align:right;margin-bottom:25px\">\n      <form submit.delegate=\"sortByDistance()\">\n        <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n        <button>${i18n(\"Sort by distance\")  & signal : 'language-change'}</button>\n      </form>\n    </div>\n\n    <div class=\"_result\" repeat.for=\"r of results\">\n      <div class=\"_result-header horizontal\">\n        <div class=\"width-lg-80 width-md-80\"  ltr-left rtl-right>\n          ${r.item.organisation}\n        </div>\n        <div class=\"width-lg-20 width-md-20\" if.bind=\"r.distance\" ltr-right rtl-left>\n          <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            <img src=\"/assets/img/common/icon-compass.svg\" style=\"width:30px;vertical-align:middle\"> ${r.distance} km\n          </a>\n        </div>\n      </div>\n      <div class=\"_result-body horizontal\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n          <div class=\"fit-to-content\">${r.item.domain}</div>\n          <br/>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n            ${i18n(\"Registration opening\")  & signal : 'language-change'} : ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n          </div>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n            ${i18n(\"Registration closing\")  & signal : 'language-change'} : ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\"> ${i18n(\"Required level\")  & signal : 'language-change'} : ${r.item.level}\n          </div>\n\n        </div>\n\n        <div class=\"vertical _infos-container\">\n          <a class=\"link-big link-bottom\" style=\"right:5%;\" href=\"${r.item.link}\" target=\"_blank\" if.bind=\"r.item.link\">\n            <img src=\"/assets/img/common/icon-external-link.svg\" />\n          </a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-date.svg\" /> ${i18n(\"Date\")  & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              Du ${r.item.startDate | myDateFormat:'DD/MM/YYYY'}<br/> Au ${r.item.endDate | myDateFormat:'DD/MM/YYYY'}\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\")  & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Address\")  & signal : 'language-change'} </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              <br/>\n            </div>\n          </div>\n\n        </div>\n      </div>\n\n\n      <div class=\"_result-footer\">\n\n      </div>\n\n\n    </div>\n     <br/>\n\n\n</template>"; });
define('text!views/refugees/profile/profile.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"views/_components/user-form\"></require>\n    <div class=\"width-lg-60\" style=\"margin:auto\">\n        <user-form show-credentials.bind=\"true\" show-identity.bind=\"true\" show-details=\"true\" action=\"update-profile\"></user-form>\n    </div>\n</template>"; });
define('text!views/refugees/self-teaching/self-teaching.html', ['module'], function(module) { module.exports = "<template>\n\n  <form class=\"search-inline-form\" always-visible>\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">${i18n(\"City\") & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.city.languageLearningProgram\">${x}</option>\n    </select>\n\n    <button class=\"btn-orange\" click.trigger=\"find('list')\" class=\"${view=='list' ? 'button-active' : ''}\">${i18n(\"view list\") & signal : 'language-change'}</button>\n    <button class=\"btn-orange\" click.trigger=\"find('map')\" class=\"${view=='map' ? 'button-active' : ''}\">${i18n(\"view map\") & signal : 'language-change'}</button>\n  </form>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='map'\">\n    <gmap center.bind=\"userDetails.address\" places.bind=\"results\" placesFor.bind=\"teachings\"></gmap>\n  </div>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='list'\">\n    <div style=\"text-align:right;margin-bottom:25px\">\n      <form class=\"inline-form\" submit.delegate=\"sortByDistance()\">\n        <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n        <button>${i18n(\"Sort by distance\") & signal : 'language-change'}</button>\n      </form>\n    </div>\n\n    <div class=\"_result\" repeat.for=\"r of results\">\n      <div class=\"_result-header horizontal\">\n        <div class=\"width-lg-80 width-md-80\" style=\"text-align:left\" rtl-right ltr-left>\n          ${r.item.name} - ${r.item.address.locality}\n        </div>\n        <div class=\"width-lg-20 width-md-20\" style=\"text-align:right\" if.bind=\"r.distance\" rtl-left ltr-right>\n          <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            <img src=\"/assets/img/common/icon-compass.svg\" style=\"width:30px;vertical-align:middle\"> ${r.distance} km\n          </a>\n        </div>\n      </div>\n      <div class=\"_result-body horizontal\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n        </div>\n\n        <div class=\"vertical _infos-container\">\n          <a class=\"link-big link-bottom\" style=\"right:5%;\" href=\"${r.item.link}\" target=\"_blank\" if.bind=\"r.item.link\">\n            <img src=\"/assets/img/common/icon-external-link.svg\" />\n          </a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\") & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> \n              ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>      \n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\">\n                <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Address\") & signal : 'language-change'}\n              </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              <br/>\n            </div>\n          </div>\n\n        </div>\n      </div>\n       <div class=\"_result-body\">\n         <div repeat.for=\"i of r.item.additionalInformations | objectKeys\">\n            ${i} : ${r.item.additionalInformations[i]}\n        </div>\n       </div>\n\n\n      <div class=\"_result-footer\">\n\n      </div>\n\n\n    </div>\n     <br/>\n\n\n</template>"; });
define('text!views/refugees/teachings/teachings.html', ['module'], function(module) { module.exports = "<template>\n\n  <form class=\"search-inline-form\" always-visible>\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">${i18n(\"City\") & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.city.languageLearningProgram\">${x}</option>\n    </select>\n\n    <select value.bind=\"filter.levelId\">\n      <option value=\"\">${i18n(\"Required level\")  & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.level.professionalLearningProgram\" value.bind=\"x.id\">${x.name}</option>\n    </select>\n\n    <select value.bind=\"filter.fieldOfStudyId\">\n      <option value=\"\">${i18n(\"Field of study\") & signal : 'language-change'}</option>\n      <option repeat.for=\"x of referenceData.fieldOfStudy.teaching\" value.bind=\"x.id\">${x.name}</option>\n    </select>\n\n    <button class=\"btn-orange\" click.trigger=\"find('list')\" class=\"${view=='list' ? 'button-active' : ''}\">${i18n(\"view list\") & signal : 'language-change'}</button>\n    <button class=\"btn-orange\" click.trigger=\"find('map')\" class=\"${view=='map' ? 'button-active' : ''}\">${i18n(\"view map\") & signal : 'language-change'}</button>\n  </form>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='map'\">\n    <gmap center.bind=\"userDetails.address\" places.bind=\"results\" placesFor.bind=\"teachings\"></gmap>\n  </div>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='list'\">\n    <div style=\"text-align:right;margin-bottom:25px\">\n      <form class=\"inline-form\" submit.delegate=\"sortByDistance()\">\n        <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n        <button>${i18n(\"Sort by distance\") & signal : 'language-change'}</button>\n      </form>\n    </div>\n\n    <div class=\"_result\" repeat.for=\"r of results\">\n      <div class=\"_result-header horizontal\">\n        <div class=\"width-lg-80 width-md-80\" style=\"text-align:left\" rtl-right ltr-left>\n          ${r.item.fieldOfStudy} (${r.item.organisation})\n        </div>\n        <div class=\"width-lg-20 width-md-20\" style=\"text-align:right\" if.bind=\"r.distance\" rtl-left ltr-right>\n          <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            <img src=\"/assets/img/common/icon-compass.svg\" style=\"width:30px;vertical-align:middle\"> ${r.distance} km\n          </a>\n        </div>\n      </div>\n      <div class=\"_result-body horizontal\">\n\n        <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n            ${i18n(\"Registration opening\") & signal : 'language-change'} : ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n          </div>\n          <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n            ${i18n(\"Registration closing\") & signal : 'language-change'} : ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n          </div>\n          <br/>\n          <div class=\"fit-to-content\" if.bind=\"r.item.languageLevelRequired\"> ${i18n(\"Required level\")} : ${r.item.languageLevelRequired || i18n(\"None\")}</div>\n          <br/>\n          <div class=\"fit-to-content\"> Master : ${r.item.master ? i18n(\"yes\") : i18n(\"no\")}</div>\n          <br/>\n          <div class=\"fit-to-content\">\n            Licence : ${r.item.licence ? i18n(\"yes\") : i18n(\"no\")}\n          </div>\n          <!-- if.bind -->\n        </div>\n\n        <div class=\"vertical _infos-container\">\n          <a class=\"link-big link-bottom\" style=\"right:5%;\" href=\"${r.item.link}\" target=\"_blank\" if.bind=\"r.item.link\">\n            <img src=\"/assets/img/common/icon-external-link.svg\" />\n          </a>\n\n          <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <img src=\"/assets/img/common/icon-contact.svg\" /> ${i18n(\"Contact\") & signal : 'language-change'}\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n              <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n            </div>\n          </div>\n          <div class=\"horizontal\">\n            <div class=\"width-lg-40 info-title\">\n              <a click.delegate=\"viewLocation(r.item.address)\">\n                <img src=\"/assets/img/common/icon-address.svg\" /> ${i18n(\"Address\") & signal : 'language-change'}\n              </a>\n            </div>\n            <div class=\"width-lg-60 info-text\">\n              ${r.item.address.street1}<br/> ${r.item.address.street2}\n              <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              <br/>\n            </div>\n          </div>\n\n        </div>\n      </div>\n\n\n      <div class=\"_result-footer\">\n\n      </div>\n\n\n    </div>\n     <br/>\n   \n\n</template>"; });
define('text!views/refugees/workshops/workshops.html', ['module'], function(module) { module.exports = "<template>\n  <compose view=\"../events/events.html\"></compose>\n</template>"; });
define('text!views/volunteers/availabilities/availabilities.html', ['module'], function(module) { module.exports = "<template>\n\n    <div if.bind=\"outcome==null\" class=\"width-lg-50\" style=\"margin:auto;padding:5px;text-align:justify\">\n        <div style=\"margin-bottom:40px;margin-top: 25px;\" if.bind=\"userDetails.lastAction=='sign-up'\">\n            <div style=\"text-align:center;margin-bottom:20px;font-weight:bold\">\n                <img src=\"/assets/img/common/icon-checked.svg\" style=\"width:80px;margin-bottom:20px\"><br/> \n                ${i18n(\"Thanks for your registration\") & signal : 'language-change'} !\n            </div>\n            <div style=\"text-align:center;font-weight:bold\">\n                ${i18n(\"Could you complete your profile by telling us how you wish to help the refugees ?\") & signal : 'language-change'}\n            </div>\n        </div>\n\n        <form class=\"vertical offset-lg-5 split-lg-30-70 label-right\">\n            <div style=\"padding-bottom:30px;padding-top:30px;border-bottom:1px black solid\">\n                <b>${i18n(\"French lessons\") & signal : 'language-change'}</b> : ${i18n(\"Explanations-french-lessons\") & signal : 'language-change'}\n                <div class=\"horizontal\" style=\"margin-top:20px\">\n                    <div class=\"width-lg-100\">\n                        <button class=\"${input.availableForConversation ? 'btn-orange' : ''}\" click.delegate=\"input.availableForConversation=true\">${i18n('yes')  & signal : 'language-change'}</button>\n                        <button class=\"${input.availableForConversation ? '' : 'btn-orange'}\" click.delegate=\"input.availableForConversation=false\">${i18n('no')  & signal : 'language-change'}</button>\n                    </div>        \n                </div>\n            </div>\n\n            <div style=\"padding-bottom:30px;padding-top:30px;border-bottom:1px black solid\">\n                <b>${i18n(\"Interpreting\") & signal : 'language-change'} </b> : ${i18n(\"Explanations-interpreting\") & signal : 'language-change'} \n                <div class=\"horizontal\" style=\"margin-top:20px\">\n                    <div class=\"width-lg-20\">\n                        <button class=\"${input.availableForInterpreting ? 'btn-orange' : ''}\" click.delegate=\"input.availableForInterpreting=true\">${i18n('yes')  & signal : 'language-change'}</button>\n                        <button class=\"${input.availableForInterpreting ? '' : 'btn-orange'}\" click.delegate=\"input.availableForInterpreting=false\">${i18n('no')  & signal : 'language-change'}</button>\n                    </div>\n                    <div class=\"width-lg-80\" if.bind=\"input.availableForInterpreting\">\n                        <multiple-select source.bind=\"referenceData.language.all\" placeholder=\"les langues que vous maitrisez...\" selection.bind=\"input.languages\"></multiple-select>\n                    </div>\n                </div>\n            </div>\n\n            <div style=\"padding-bottom:30px;padding-top:30px;border-bottom:1px black solid\">\n                <b>${i18n(\"Support in studies\") & signal : 'language-change'}</b> : ${i18n(\"Explanations-support-in-studies\") & signal : 'language-change'} \n                <div class=\"horizontal\" style=\"margin-top:20px\">\n                    <div class=\"width-lg-20\">\n                        <button class=\"${input.availableForSupportInStudies ? 'btn-orange' : ''}\" click.delegate=\"input.availableForSupportInStudies=true\">${i18n('yes')  & signal : 'language-change'}</button>\n                        <button class=\"${input.availableForSupportInStudies ? '' : 'btn-orange'}\" click.delegate=\"input.availableForSupportInStudies=false\">${i18n('no')  & signal : 'language-change'}</button>\n                    </div>\n                    <div class=\"width-lg-80\" if.bind=\"input.availableForSupportInStudies\">\n                        <multiple-select source.bind=\"referenceData.fieldOfStudy.all\" selection.bind=\"input.fieldsOfStudy\"></multiple-select>\n                    </div>\n                </div>\n            </div>\n            <div style=\"padding-bottom:30px;padding-top:30px\">\n                <b>${i18n(\"Cultural or sport activities\") & signal : 'language-change'} </b> : ${i18n(\"Explanations-activities\") & signal : 'language-change'} \n                <div class=\"horizontal\" style=\"margin-top:20px\">\n                    <div class=\"width-lg-20\">\n                        <button class=\"${input.availableForActivities ? 'btn-orange' : ''}\" click.delegate=\"input.availableForActivities=true\">${i18n('yes')  & signal : 'language-change'}</button>\n                        <button class=\"${input.availableForActivities ? '' : 'btn-orange'}\" click.delegate=\"input.availableForActivities=false\">${i18n('no')  & signal : 'language-change'}</button>\n                    </div>\n                    <div class=\"width-lg-80\" if.bind=\"input.availableForActivities\">\n                        <input type=\"text\" placeholder=\"Theater, sports...\" value.bind=\"input.activities\" style=\"width:100%\" />\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"horizontal\">\n                <button class=\"offset-lg-40 btn-orange\" style=\"margin-bottom:50px\" click.delegate=\"update()\">${i18n(\"Update availabilities\")  & signal : 'language-change'}</button>\n            </div>            \n        </form>\n    </div>\n    <div if.bind=\"outcome.status=='ok'\" style=\"text-align:center\">\n        <div style=\"text-align:center;margin-bottom:20px\">\n            <img src=\"/assets/img/common/icon-checked.svg\" style=\"width:80px;margin-bottom:20px\"><br/>\n            Merci, vos disponibilités ont été mises à jour.\n        </div>        \n        <div if.bind=\"userDetails.lastAction=='set-availabilities'\" style=\"text-align:center\">\n            Nous vous proposons de consulter les dernières demande d'aide correspondant et ce que vous proposez :<br/><br/>\n            <a route-href=\"route: volunteers/meeting-requests\" style=\"font-weight:bold\">Voir les demandes d'aide</a>\n        </div>\n    </div>\n    <div if.bind=\"outcome.status=='failure'\" style=\"text-align:center\">\n        Problème...     \n    </div>    \n</template>"; });
define('text!views/volunteers/events/events.html', ['module'], function(module) { module.exports = "<template>\n\n  <form class=\"search-inline-form\" fixed-if-on-top>\n\n    <select value.bind=\"filter.city\">\n      <option value=\"\">Ville</option>\n      <option repeat.for=\"x of referenceData.city.event\" if.bind=\"filter.stereotype==null\">${x}</option>\n      <option repeat.for=\"x of referenceData.city.workshop\" if.bind=\"filter.stereotype=='WORKSHOP'\">${x}</option>\n    </select>\n\n    <button class=\"btn-orange\" click.trigger=\"find('list')\" class=\"${view=='list' ? 'button-active' : ''}\">Voir liste</button>\n    <button class=\"btn-orange\" click.trigger=\"find('map')\" class=\"${view=='map' ? 'button-active' : ''}\">Voir carte</button>\n  </form>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='map'\">\n    <gmap center.bind=\"userDetails.address\" places.bind=\"results\" placesFor.bind=\"events\"></gmap>\n  </div>\n\n  <div class=\"_results\" if.bind=\"results.length>0 && view=='list'\">\n    <div style=\"text-align:right;margin-bottom:25px\">\n      <form submit.delegate=\"sortByDistance()\">\n        <input type=\"text\" placeholder=\"Votre adresse\" place-autocomplete=\"target.bind: userDetails\" />\n        <button>Classer par proximité</button>\n      </form>\n    </div>\n\n    <div class=\"_result\" repeat.for=\"r of results\" style=\"margin-bottom:70px\">\n\n      <!--\n      <div class=\"width-lg-15\" style=\"font-size:25px;font-style:italic;text-align:center\">\n        <img src=\"/assets/img/common/icon-date.svg\" style=\"width:40px\"><br/> ${r.item.startDate | myDateFormat:'DD MMM'}\n      </div>\n      -->\n      <div class=\"width-lg-100 vertical\">\n        <div class=\"_result-header horizontal\">\n          <div class=\"width-lg-80\" style=\"text-align:left\">\n            <img src=\"/assets/img/common/icon-date.svg\" style=\"width:40px;margin-right:30px;vertical-align:middle\">\n            ${r.item.startDate | myDateFormat:'DD MMMM'} - ${r.item.subject}\n          </div>\n          <div class=\"width-lg-20\" style=\"text-align:right\" if.bind=\"r.distance\">\n            <a if.bind=\"userDetails.address\" click.delegate=\"viewItinerary(userDetails.address, r.item.address)\">\n            <img src=\"/assets/img/common/icon-compass.svg\" style=\"width:30px;vertical-align:middle\"> ${r.distance} km\n          </a>\n          </div>\n        </div>\n\n        <div class=\"_result-body horizontal\">\n\n          <div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\n            <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()>0\">\n              Ouverture des inscriptions le ${r.item.registrationOpeningDate | myDateFormat:'DD/MM'}\n            </div>\n            <div class=\"fit-to-content\" if.bind=\"moment(r.item.registrationOpeningDate).diff()<0\">\n              Cloture des inscriptions le ${r.item.registrationClosingDate | myDateFormat:'DD/MM'}\n            </div>\n\n          </div>\n\n          <div class=\"vertical _infos-container\">\n\n            <img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <img src=\"/assets/img/common/icon-time.svg\" /> Heure\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                De ${r.item.startDate | myDateFormat:'HH:mm'} à ${r.item.endDate | myDateFormat:'HH:mm'}\n              </div>\n            </div>\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <img src=\"/assets/img/common/icon-contact.svg\" /> Contact\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                ${r.item.contact.name} <br/> ${r.item.contact.phoneNumber} <br/>\n                <a href=\"mailto:${r.contact.mailAddress}\">${r.item.contact.mailAddress}</a>\n              </div>\n            </div>\n            <div class=\"horizontal\">\n              <div class=\"width-lg-40 info-title\">\n                <a click.delegate=\"viewLocation(r.item.address)\"> <img src=\"/assets/img/common/icon-address.svg\" /> Adresse </a>\n              </div>\n              <div class=\"width-lg-60 info-text\">\n                ${r.item.address.street1}<br/> ${r.item.address.street2}\n                <br if.bind=\"r.item.address.street2 != null \" /> ${r.item.address.postalCode} ${r.item.address.locality}\n              </div>\n            </div>\n\n          </div>\n        </div>\n        <div class=\"_result-body\">\n          <div style=\"background-color:#e7e9e8;padding:5px\" class=\"width-lg-100\">\n            Organisé par ${r.item.organisedBy}\n\n            <div style=\"font-family:SegoeUiSlim;text-align:justify;padding:10px\">\n              \n              <p>${r.item.description}</p>\n\n              <p style=\"text-align:right;font-weight:bold\" if.bind=\"r.item.link\">\n                <a href=\"${r.item.link}\" if.bind=\"r.item.link\" target=\"_blank\">En savoir plus...</a>\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</template>"; });
define('text!views/volunteers/meeting-requests/meeting-requests.html', ['module'], function(module) { module.exports = "<template>\n\n\t<div class=\"_results\">\n\n\t\t<div class=\"horizontal \" style=\"font-family:SegoeUiSlim;margin-bottom:15px\" ltr-right rtl-left>\n\t\t\t<form class=\"width-lg-70\" style=\"text-align:left\">\n\t\t\t\t<input type=\"radio\" name=\"accepted\" checked.bind=\"filter.accepted\" value=\"true\" change.trigger=\"find()\" /> Demandes acceptées\n\t\t\t\t<input type=\"radio\" name=\"accepted\" checked.bind=\"filter.accepted\" value=\"false\" change.trigger=\"find()\" /> Demandes\n\t\t\t\ten attente\n\t\t\t</form>\n\n\t\t</div>\n\n\t\t<div class=\"_result\" repeat.for=\"r of results\" style=\"margin-bottom:70px\">\n\n\t\t\t<div class=\"width-lg-100 vertical\">\n\t\t\t\t<div class=\"_result-header horizontal\" rtl-right ltr-left style=\"height:40px\">\n\t\t\t\t\t<div class=\"width-lg-70\" ltr-left rtl-right>\n\t\t\t\t\t\tDemandé par : ${r.item.refugee.name}\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"width-lg-30\" ltr-right rtl-left if.bind=\"r.item.volunteer==null\">\n\t\t\t\t\t\t<button click.delegate=\"r.action='accept'\">Accepter</button>\n\t\t\t\t\t\t<button click.delegate=\"delete(r)\">Refuser</button>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"width-lg-30\" ltr-right rtl-left if.bind=\"r.item.volunteer!=null\">\n\t\t\t\t\t\t<button click.delegate=\"cancel(r)\">Annuler</button>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"_result-body\" style=\"padding:5px\" if.bind=\"r.action=='accept'\">\n\t\t\t\t\tPréférez vous contacter le/la réfugié(e), ou souhaitez vous qu'il/elle vous contacte ?<br/>\n\t\t\t\t\t<p class=\"offset-lg-5\" style=\"font-family:SegoeUI;line-height:35px\">\n\t\t\t\t\t\t<input type=\"radio\" name=\"firstContact\" checked.bind=\"firstContact\" value=\"VOLUNTEER_TO_REFUGEE\">\n\t\t\t\t\t\tJe préfère le/la contacter, mon adresse mail et mon numéro de lui seront pas divuglés\n\t\t\t\t\t\t<br/>\n\t\t\t\t\t\t<input type=\"radio\" name=\"firstContact\" checked.bind=\"firstContact\" value=\"REFUGEE_TO_VOLUNTEER\">\n\t\t\t\t\t\tJe préfère qu'il/elle me contacte et accepte que mon adresse mail et mon numéro de téléphone lui soit transmis(e)\n\t\t\t\t\t</p>\n\t\t\t\t\t<p class=\"offset-lg-5\">\n\t\t\t\t\t\t<button click.delegate=\"accept(r, firstContact)\">Valider</button> \n\t\t\t\t\t\t<button click.delegate=\"r.action=null\">Annuler</button>\n\t\t\t\t\t</p>\n\t\t\t\t\t\n\t\t\t\t</div>\n\n\t\t\t\t<div class=\"_result-body horizontal\">\n\n\t\t\t\t\t<div class=\"_image-container\" style=\"background-image:url('/assets/img/saif/teaching.svg')\">\n\t\t\t\t\t\t<div if.bind=\"r.item.reason == 'INTERPRETING'\">\n\t\t\t\t\t\t\t<div class=\"fit-to-content\">\n\t\t\t\t\t\t\t\tPour : Interprétariat (${r.item.languages.join(' ou ')})\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div if.bind=\"r.item.reason == 'SUPPORT_IN_STUDIES'\">\n\t\t\t\t\t\t\t<div class=\"fit-to-content\">\n\t\t\t\t\t\t\t\tPour : Soutien (${r.item.fieldOfStudy})\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div if.bind=\"r.item.reason == 'CONVERSATION'\">\n\t\t\t\t\t\t\t<div class=\"fit-to-content\">\n\t\t\t\t\t\t\t\tPour : Leçons de français\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div class=\"fit-to-content\">\n\t\t\t\t\t\t\t\tPostée le ${r.item.post | myDateFormat:'DD/MM'}\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class=\"vertical _infos-container\">\n\n\t\t\t\t\t\t<img src=\"/assets/img/common/arrow-right-saif.svg\" style=\"position:absolute; width:30px;height:30px; right:100%; bottom:25%;\">\n\t\t\t\t\t\t<div class=\"horizontal\">\n\t\t\t\t\t\t\t<div class=\"width-lg-40 info-title\" left-or-right>\n\t\t\t\t\t\t\t\t<img src=\"/assets/img/common/icon-contact.svg\" /> Contact :\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"width-lg-60 info-text\">\n\t\t\t\t\t\t\t\t${r.item.refugee.name}<br/> ${r.item.refugee.phoneNumber} <br/> ${r.item.refugee.mailAddress}\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"horizontal\">\n\t\t\t\t\t\t\t<div class=\"width-lg-40 info-title\" left-or-right>\n\t\t\t\t\t\t\t\t<img src=\"/assets/img/common/icon-address.svg\" /> Région :\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class=\"width-lg-60 info-text\">\n\t\t\t\t\t\t\t\t${r.item.refugeeLocation.postalCode} ${r.item.refugeeLocation.locality}\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"_result-body\">\n\t\t\t\t\t<div style=\"background-color:#e7e9e8;padding:10px;box-sizing: border-box;\" class=\"width-lg-100\">\n\t\t\t\t\t\tInformations complémentaires : ${r.item.additionalInformations}<br/><br/> Contraintes de date : ${r.item.dateConstraint}\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<!--\n\t\t\t\t<div class=\"_result-footer\" style=\"text-align: right\">\n\t\t\t\t\t<button click.delegate=\"viewMessages(r)\" if.bind=\"r.messages == null\">${i18n(\"View messages\")}</button>\n                    <button click.delegate=\"startAccept(r)\" if.bind=\"r.messages == null\">${i18n(\"I can answer to this request\")}</button>\n                    <button click.delegate=\"delete(r)\" if.bind=\"r.messages == null\">${i18n(\"I cannot answer to this request\")}</button>\n\t\t\t\t</div>\n\n\t\t\t\t<div class=\"conversations\" style=\"background-color:#e7e9e8;\" if.bind=\"r.messages\">\n\t\t\t\t\t<div style=\"text-align:right;padding-right:10px;padding-top:10px\">\n\t\t\t\t\t\t<a click.delegate=\"hideMessages(r)\" class=\"close\"></a>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div style=\"padding:10px;font-family:SegoeUi;\">\n\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t<div style=\"padding:5px;display:inline-block;\"><b>Alaric</b> : Lorem ipsum \n                            </div> \n                            <br/>\n\t\t\t\t\t\t\t<div ltr-right rtl-left>19/07/2016 21H30</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<hr/>\n\t\t\t\t\t\t<div class=\"offset-lg-10\">\n\t\t\t\t\t\t\t<div style=\"padding:5px;display:inline-block;\"><b>Nour</b> : Lorem ipsum dolor sit amet, consectetur.\n                            </div>\n                            <br/>\n\t\t\t\t\t\t\t<div ltr-right rtl-left>19/07/2016 21H30</div>\n\t\t\t\t\t\t</div>\n                        <hr/>\n\t\t\t\t\t\t<div class=\"offset-lg-10\">\n\t\t\t\t\t\t\t<div style=\"padding:5px;display:inline-block;\"><b>Nour</b> : Lorem ipsum dolor sit amet, consectetur adipiscing elit\n\t\t\t\t\t\t\t</div> \n                            <br/>\n\t\t\t\t\t\t\t<div ltr-right rtl-left>19/07/2016 21H30</div>\n\t\t\t\t\t\t</div>\n                        <hr/>\n                        <div>\n\t\t\t\t\t\t\t<div style=\"padding:5px;display:inline-block;\"><b>Alaric</b> : Lorem ipsum dolor sit amet\n                            </div>\n                            <br/>\n\t\t\t\t\t\t\t<div ltr-right rtl-left>19/07/2016 21H30</div>\n\t\t\t\t\t\t</div>\n                        <hr/>\n\t\t\t\t\t\t<div class=\"offset-lg-10\">\n\t\t\t\t\t\t\t<div style=\"padding:5px;display:inline-block;\"><b>Nour</b> : Lorem ipsum dolor sit amet, consectetur adipiscing elit\n\t\t\t\t\t\t\t</div> \n                            <br/>\n\t\t\t\t\t\t\t<div ltr-right rtl-left>19/07/2016 21H30</div>\n\t\t\t\t\t\t</div>\n                        <hr/>\n                        <div>\n\t\t\t\t\t\t\t<div style=\"padding:5px;display:inline-block;\"><b>Alaric</b> : Lorem ipsum dolor sit amet\n                            </div>\n                            <br/>\n\t\t\t\t\t\t\t<div ltr-right rtl-left>19/07/2016 21H30</div>\n\t\t\t\t\t\t</div>\n                        <hr/>\n                        <textarea rows=\"3\" class=\"width-lg-100\" value.bind=\"newMessage.text\"> </textarea><br/>\n                        <button click.delegate=\"saveNewMessage(r, newMessage)\"> Envoyer </button>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t-->\n\t\t\t</div>\n\t\t</div>\n\n\t</div>\n</template>"; });
define('text!views/volunteers/profile/profile.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"views/_components/user-form\"></require>\n\n    <div class=\"width-lg-50\" style=\"margin:auto;padding:5px;text-align:justify\">\n\n        <user-form show-credentials.bind=\"true\" show-identity.bind=\"true\" show-details=\"true\" action=\"update-profile\">\n        </user-form>\n    </div>\n    \n</template>"; });
//# sourceMappingURL=app-bundle.js.map