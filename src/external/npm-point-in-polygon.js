!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).pointInPolygon=e()}}(function(){return function(){return function e(n,o,r){function t(i,u){if(!o[i]){if(!n[i]){var d="function"==typeof require&&require;if(!u&&d)return d(i,!0);if(f)return f(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var p=o[i]={exports:{}};n[i][0].call(p.exports,function(e){return t(n[i][1][e]||e)},p,p.exports,e,n,o,r)}return o[i].exports}for(var f="function"==typeof require&&require,i=0;i<r.length;i++)t(r[i]);return t}}()({1:[function(e,n,o){n.exports=function(e,n){for(var o=e[0],r=e[1],t=!1,f=0,i=n.length-1;f<n.length;i=f++){var u=n[f][0],d=n[f][1],l=n[i][0],p=n[i][1];d>r!=p>r&&o<(l-u)*(r-d)/(p-d)+u&&(t=!t)}return t}},{}]},{},[1])(1)});