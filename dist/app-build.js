"bundle";!function(){var a=System.amdDefine;a("app.html!github:systemjs/plugin-text@0.0.4.js",[],function(){return'<template>\n  <span repeat.for="row of router.navigation">\n    <a href.bind="row.href">${row.title}</a>\n  </span>\n  <hr/>\n  <div>\n    <router-view></router-view>\n  </div>\n</template>\n'})}(),System.register("global.js",[],function(a){"use strict";var b;return{setters:[],execute:function(){b=function(){function a(){babelHelpers.classCallCheck(this,a)}return babelHelpers.createClass(a,[{key:"getUri",value:function(a,b){if(b){var c=[];for(var d in b){var e=b[d];e&&c.push(d+"="+e)}return c.length>0?a+"?"+c.join("&"):a}return a}}]),a}(),a("Global",b)}}}),System.register("app.js",["aurelia-framework","aurelia-fetch-client","aurelia-router","global"],function(a){"use strict";var b,c,d,e,f;return{setters:[function(a){b=a.inject},function(a){c=a.HttpClient},function(a){d=a.Router},function(a){e=a.Global}],execute:function(){f=function(){function a(a,b,c){babelHelpers.classCallCheck(this,f),b.configure(function(a){a.withBaseUrl("http://127.0.0.1:8080/api/").withDefaults({headers:{}}).withInterceptor({request:function(a){return console.log("Requesting "+a.method+" "+a.url),a},response:function(a){return console.log("Received "+a.status+" "+a.url),a}})}),b.fetch("referenceData").then(function(a){return a.json()}).then(function(a){return c.referenceData=a}),this.router=a,this.router.configure(function(a){a.title="CPA",a.map([{route:["","Welcome"],moduleId:"refugees/index",nav:!0,title:"Accueil"},{route:["teachings"],moduleId:"refugees/teachings/teachings",nav:!0,title:"Enseignements supérieurs"},{route:["cursus"],moduleId:"refugees/cursus/cursus",nav:!0,title:"Apprentissage du français"},{route:["workshops"],moduleId:"refugees/workshops/workshops",nav:!0,title:"Ateliers socio linguistiques"},{route:["libraries"],moduleId:"refugees/libraries/libraries",nav:!0,title:"Auto apprentissage"},{route:["volunteers"],moduleId:"refugees/volunteers/volunteers",nav:!0,title:"Bénévoles"}])})}var f=a;return a=b(d,c,e)(a)||a}(),a("App",f)}}});