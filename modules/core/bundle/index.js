// We use `require` here because luma and deck core must be imported before `global`
const LumaGL = require('@luma.gl/core');
const deckGLCore = require('../src');

const DeckGL = require('./deckgl').default;

/* global window, global */
const _global = typeof window === 'undefined' ? global : window;
_global.deck = _global.deck || {};
_global.luma = _global.luma || {};

Object.assign(_global.deck, deckGLCore, {DeckGL});
Object.assign(_global.luma, LumaGL);

module.exports = _global.deck;

export {

} from '@luma.gl/core';
