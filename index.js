'use strict'

var pkg = require('./package.json')
var debug = require('debug')(pkg.name)
var Registry = require('./lib/registry')
var Server = require('./lib/mdns-server')
var Browser = require('./lib/browser')

module.exports = Bonjour

function Bonjour (opts) {
  if (!(this instanceof Bonjour)) return new Bonjour(opts)
  this._server = new Server(opts)
  this._registry = new Registry(this._server)
}

Bonjour.prototype.publish = function (opts) {
  debug('Bonjour publish %j', opts)
  return this._registry.publish(opts)
}

Bonjour.prototype.unpublishAll = function (cb) {
  this._registry.unpublishAll(cb)
}

Bonjour.prototype.find = function (opts, onup) {
  debug('Bonjour find %j', opts)
  return new Browser(this._server.mdns, opts, onup)
}

Bonjour.prototype.findOne = function (opts, cb) {
  debug('Bonjour findOne %j', opts)
  var browser = new Browser(this._server.mdns, opts)
  var tout = opts.timeout && setTimeout(function () {
    browser.emit('notfound')
    browser.stop()
    if (cb) cb(false)
    debug('Bonjour timeout')
  }, opts.timeout)
  browser.once('up', function (service) {
    clearTimeout(tout)
    browser.stop()
    if (cb) cb(service)
  })
  return browser
}

Bonjour.prototype.destroy = function () {
  this._registry.destroy()
  this._server.mdns.destroy()
}
