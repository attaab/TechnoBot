'use strict'

var assert = require('assert')
var storage = require('../storage')
var controller = require('../initializers/botkit').controller
var clientId = require('../config/soundcloud').clientId
var resolve = require('soundcloud-resolve')

let position = 0

// Reset devices
controller.hears('^play', 'direct_message,direct_mention,mention', function (bot, message) {
  if (!storage.device) return bot.reply(message, 'Текущее устройство не обнаружено. Воспользуйтесь командой `help` для получения дополнительной информации.')
  if (!storage.device.ready_) return bot.reply(message, 'Текущее устройство не готово. Воспользуйтесь командой `help` для получения дополнительной информации.')

  var track = getSoundcloudUrls(message.text).filter(isSoundcloudUrl).shift()

  storage.track = track

  resolve(clientId, track, function (err, res, body) {
    assert.equal(null, err)

    storage.device.play(body, position, function (res) {
      if (res) {
        storage.playing = true
        bot.reply(message, 'Начинаю проигрывание трека.')
      } else {
        storage.playing = false
        bot.reply(message, 'Не удалось запустить проигрывание трека.')
      }
    })
  })
})

controller.hears('^stop', 'direct_message,direct_mention,mention', function (bot, message) {
  storage.playing = false
  storage.device.stop()
  bot.reply(message, 'Проигрывание трека остановлено')
})

function getSoundcloudUrls (text) {
  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gmi
  return text.match(urlRegex)
}

function isSoundcloudUrl (url) {
  var regexp = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/gmi
  return regexp.test(url)
}
