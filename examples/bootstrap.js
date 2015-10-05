import { declareChildApplication } from "single-spa";

declareChildApplication('/apps/jspm-with-angular-1.3.0/single-spa.config.js', () => window.location.pathname.startsWith('/legacy'));
declareChildApplication('/apps/jspm-with-angular-1.4.6/single-spa.config.js', () => window.location.pathname.startsWith('/v2'));
declareChildApplication('/apps/bower-angular-phonecat/single-spa.config.js', () => window.location.pathname.startsWith('/phonecat'));
