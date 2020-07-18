import StateMachine from 'javascript-state-machine'
import Canvas from 'canvas'
import Discord from 'discord.js'
import cards from '../../../data/cards'
import api from '../../../helpers/api'
import capitalise from '../../../helpers/capitalise'
import formatTriviaScores from '../../../helpers/formatTriviaScores'
import arrayRandom from '../../../helpers/arrayRandom'
import getRandomQuestion from '../../../helpers/getRandomQuestion'
import searchCards from '../../../helpers/searchCards'
import getChannelId from '../../../helpers/getChannelId'
import getEmbed from '../../../helpers/getEmbed'
import parseCardGuess from '../../../helpers/parseCardGuess'
import parseTriviaSettings from '../../../helpers/parseTriviaSettings'
import questions from './questions'

const KITTY_ID = '368097495605182483'

const random = (min, max) => min + Math.random() * (max - min)
const BASE_URL = 'https://stormbound-kitty.com'

const TriviaMachine = StateMachine.factory({
  init: 'STOPPED',

  data: {
    answer: null,
    channel: null,
    collector: null,
    difficulty: null,
    duration: 60,
    cropCenter: null,
    cropSize: 50,
    initiator: null,
    mode: null,
    timers: [],
    useRandomLetters: true,
    streaks: {},
    ctx: Canvas.createCanvas(150, 150).getContext('2d'),
  },

  transitions: [
    { name: 'start', from: 'STOPPED', to: 'RUNNING' },
    { name: 'stop', from: 'RUNNING', to: 'FROZEN' },
    { name: 'unfreeze', from: 'FROZEN', to: 'STOPPED' },
  ],

  methods: {
    inspect: function ({ author }) {
      if (author.id !== KITTY_ID) return

      console.log({
        answer: this.answer,
        channel: this.channel.id,
        duration: this.duration,
        collector: this.collector,
        cropCenter: this.cropCenter,
        cropSize: this.cropSize,
        initiator: this.initiator,
        mode: this.mode,
        state: this.state,
        streaks: this.streaks,
        questions: questions.length,
        useRandomLetters: this.useRandomLetters,
      })
    },

    configure: function ({ content, author }) {
      if (author.id !== KITTY_ID) return

      const [key, value] = content.replace('configure', '').trim().split(/\s+/g)

      try {
        this[key] = JSON.parse(value)

        return getEmbed({ withHeader: false })
          .setTitle('Configuration')
          .addField('User', `<@${KITTY_ID}>`, true)
          .addField('Key', key, true)
          .addField('Value', this[key], true)
      } catch (error) {
        console.error(error)
      }
    },

    halfTime: function () {
      const embed = getEmbed({ withHeader: false })
        .setTitle('⏳ Half time!')
        .setDescription(`Only ${this.duration / 2} seconds left, hurry up!`)

      if (!this.channel) return

      if (this.mode === 'IMAGE') {
        Canvas.loadImage(BASE_URL + '/assets/images/cards/' + this.answer.image)
          .then(image => this.getAttachment(image, 1.75))
          .then(attachment => this.channel.send({ files: [attachment], embed }))
      } else {
        this.channel.send(embed)
      }
    },

    timeout: function (channel) {
      const embed = getEmbed({ withHeader: false }).setTitle('⌛️ Time’s up!')

      if (this.mode !== 'QUESTION') {
        embed.setDescription(`The answer was “**${this.answer.name}**”!`)
      }

      channel.send(embed)
    },

    getAttachment: function (image, multiplier = 1) {
      // This is the percentage of the image around the edges we do not want to
      // crop in to avoid having mostly padding.
      const boundary = 18

      // The multiplier is used to zoom out at half time if the image has not
      // been found yet.
      const crop = this.cropSize * multiplier

      // The top-left corner of the image should be computed randomly between
      // the top-left boundary and the bottom right boundary. For a 300x300
      // image, it gives a range of 60 to 240 pixels with a 20% boundary. If the
      // crop center has already been defined however, the top-left corner is
      // computed from the focal point, minus half the crop size on both axis.
      const startX = this.cropCenter
        ? this.cropCenter[0] - crop / 2
        : random(
            (image.width * boundary) / 100,
            image.width - (image.width * boundary) / 100 - crop
          )
      const startY = this.cropCenter
        ? this.cropCenter[1] - crop / 2
        : random(
            (image.height * boundary) / 100,
            image.height - (image.height * boundary) / 100 - crop
          )

      // If there is no image focal point just, define the coordinates of the
      // center of the crop area so the zoom out can be focused on the exact
      // same point.
      if (!this.cropCenter) {
        this.cropCenter = [startX + crop / 2, startY + crop / 2]
      }

      const { width, height } = this.ctx.canvas
      const args = [image, startX, startY, crop, crop, 0, 0, width, height]

      this.ctx.clearRect(0, 0, width, height)
      this.ctx.drawImage(...args)

      if (this.difficulty === 'HARD') {
        this.ctx.putImageData(this.grayscale(), 0, 0)
      }

      return new Discord.MessageAttachment(
        this.ctx.canvas.toBuffer(),
        'trivia_img.png'
      )
    },

    grayscale: function () {
      const { width, height } = this.ctx.canvas
      const image = this.ctx.getImageData(0, 0, width, height)
      const pixels = image.data

      for (var i = 0; i < pixels.length; i += 4) {
        const lightness = parseInt(
          (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
        )

        pixels[i] = lightness
        pixels[i + 1] = lightness
        pixels[i + 2] = lightness
      }

      return image
    },

    onStart: function () {
      if (this.mode === 'CARD') {
        this.answer = arrayRandom(cards.filter(card => !card.token))
      } else if (this.mode === 'IMAGE') {
        this.answer = arrayRandom(cards.filter(card => !card.token))
      } else if (this.mode === 'QUESTION') {
        const { question, choices } = getRandomQuestion(this.useRandomLetters)

        // Store the answer in a `name` property to align with the `CARD` mode.
        this.answer = { ...question, choices, name: String(question.answer) }
      }

      this.halfTimeTimer = setTimeout(
        this.halfTime.bind(this),
        (this.duration * 1000) / 2
      )
    },

    collect: function ({ content }) {
      if (content === 'stop') return true

      switch (this.mode) {
        case 'QUESTION':
          return Object.keys(this.answer.choices).includes(
            content.toUpperCase()
          )

        case 'IMAGE':
          return searchCards(content).length > 0

        case 'CARD':
          return !!parseCardGuess(content)[0] || searchCards(content).length > 0

        default:
          return false
      }
    },

    initialise: function ({ content, author, channel }) {
      // If there is already an ongoing trivia, ignore this command.
      if (!this.can('start')) return

      // Parse the trivia configuration and define sensible defaults.
      const { mode, duration, difficulty } = parseTriviaSettings(content)
      // If no valid trivia mode was found, ignore this command.
      if (!mode) return

      // Store all the settings for the duration of the game.
      this.difficulty = difficulty
      this.duration = duration
      this.initiator = author
      this.mode = mode

      // All `start()` does on top of transitioning to the correct FSM state
      // is defining `this.answer` and setting up the half-time timer.
      this.start()

      // Define a collector: the callback function (`this.collect`) defines
      // whether or not a message should be collected (and therefore the
      // `collect` callback executed).
      // See: https://discordjs.guide/popular-topics/collectors.html#basic-message-collector
      this.collector = channel.createMessageCollector(this.collect.bind(this), {
        time: this.duration * 1000,
      })
      this.collector.on('collect', message => {
        channel.send(this.guess(message))
      })
      this.collector.on('end', (collected, reason) => {
        if (reason === 'time') this.timeout(channel)
        this.stop()
      })

      const embed = getEmbed({ withHeader: false })
        .addField('Duration', duration + ' seconds', true)
        .addField('Initiator', author.username, true)

      if (mode === 'CARD') {
        embed
          .setTitle('🔮  Card trivia started')
          .setDescription(
            `You can ask questions and issue guesses with like \`elder\`, \`pirate\`, \`gifted\` or \`rof\`.`
          )

        return embed
      }

      if (mode === 'IMAGE') {
        const url = BASE_URL + '/assets/images/cards/' + this.answer.image
        const difficulty = capitalise((this.difficulty || '').toLowerCase())

        embed
          .setTitle('🔮  Image trivia started')
          .setDescription(`You can issue guesses like \`gifted\` or \`rof\`.`)
          .addField('Difficulty', difficulty || 'Regular', true)

        return Canvas.loadImage(url)
          .then(this.getAttachment.bind(this))
          .then(attachment => ({ files: [attachment], embed }))
      }

      if (mode === 'QUESTION') {
        embed.setTitle('🔮  ' + this.answer.question).setDescription(
          Object.keys(this.answer.choices)
            .map(letter => ' ' + letter + '. ' + this.answer.choices[letter])
            .join('\n')
        )

        return embed
      }
    },

    onStop: function () {
      // Freeze the game for 5 seconds after a round has been completed to avoid
      // chaining them too fast and making the whole thing a little too hectic.
      setTimeout(
        () => this.unfreeze(),
        process.env.NODE_ENV === 'development' ? 0 : 5000
      )

      this.answer = null
      this.difficulty = null
      this.duration = 60
      this.initiator = null
      this.mode = null
      this.halfTimeTimer = clearTimeout(this.halfTimeTimer)
      this.cropCenter = null
    },

    abort: function () {
      const answer = this.mode !== 'QUESTION' ? this.answer.name : '***'
      const embed = getEmbed({ withHeader: false })
        .setTitle('🔌 Trivia stopped')
        .addField('Answer', answer, true)
        .addField('Initiator', this.initiator.username, true)

      this.collector.stop('ABORT')

      return embed
    },

    success: function (author) {
      const answer = this.answer.name
      const increment = this.difficulty === 'HARD' ? +2 : +1

      api
        .setScore(author.id, this.guildId, increment)
        .then(() =>
          console.log(
            `Added ${increment} point${increment === 1 ? '' : 's'} to ${
              author.id
            }`
          )
        )
        .catch(console.error.bind(console))

      this.collector.stop('SUCCESS')

      return getEmbed({ withHeader: false })
        .setTitle('🎉 Correct answer: ' + answer)
        .addField('Winner', author.username, true)
        .addField('Points', '+' + increment, true)
    },

    guess: function ({ content, author, channel }) {
      // If the message is `stop` and it comes from the trivia initiator or from
      // Kitty, abort the current trivia, otherwise move on.
      if (
        content === 'stop' &&
        (author.id === this.initiator.id || author.id === KITTY_ID)
      ) {
        return this.abort()
      }

      const embed = getEmbed({
        withHeader: false,
      }).addField('User', author.username, true)

      if (this.mode === 'CARD' || this.mode === 'IMAGE') {
        const [key, value] = parseCardGuess(content)

        if (this.mode === 'CARD' && key) {
          embed.addField('Property', key, true).addField('Value', value, true)

          if (value === true) {
            const lead = key === 'elder' ? 'an' : 'a'
            const title =
              this.answer[key] === value
                ? '👍 Correct guess: ' + key
                : `👎 Incorrect guess: ~~${key}~~`
            const description =
              this.answer[key] === value
                ? `The card is indeed ${lead} *${key}*.`
                : `The card is not ${lead} *${key}*.`

            embed.setTitle(title).setDescription(description)
          } else {
            const title =
              this.answer[key] === value
                ? '👍 Correct guess: ' + value
                : `👎 Incorrect guess: ~~${value}~~`
            const description =
              this.answer[key] === value
                ? `The card’s *${key}* is indeed “**${value}**”.`
                : `The card’s *${key}* is not “${value}”.`

            embed.setTitle(title).setDescription(description)
          }

          return embed
        }

        const [card] = searchCards(content)

        if (card) {
          if (card.name === this.answer.name) {
            return this.success(author)
          } else {
            embed
              .setTitle(`❌ Incorrect answer: ~~${card.name}~~`)
              .setDescription(`The card is not ${card.name}, try again!`)
              .addField('Guess', content, true)
              .addField('Found', card.name, true)

            return embed
          }
        }
      } else if (this.mode === 'QUESTION') {
        const letter = content.toUpperCase().trim()
        const guess = this.answer.choices[letter]

        // If the given letter is not amongst the allowed letters for that round
        // skip processing the guess entirely.
        if (typeof this.answer.choices[letter] === 'undefined') return

        // If the choice mapped to the given letter is the correct answer,
        // end the round with a success. It is important to test against
        // `this.answer.name` and not `this.answer.question`, because the former
        // is a string, just like the guess, while the latter might be a number.
        if (guess === this.answer.name) {
          // Increment the streak here instead of within the `success` method
          // because we do not want to count streaks for the card trivia.
          this.streaks[author.id] = (this.streaks[author.id] || 0) + 1

          return this.success(author)
        }

        const streak = this.streaks[author.id]

        api
          .setScore(author.id, this.guildId, -1)
          .then(() => console.log('Subtracted 1 point from ' + author.id))
          .catch(console.error.bind(console))

        delete this.streaks[author.id]

        this.collector.stop('FAILURE')

        embed
          .setTitle(`❌ Incorrect guess: ~~${guess}~~`)
          .addField('Points', -1, true)

        if (streak > 1) {
          embed.setDescription(
            `You just ended your streak of ${streak} correct answers in a row, ${author}!`
          )
        }

        return embed
      }
    },

    leaderboard: function () {
      const embed = getEmbed({ withHeader: false })
        .setTitle('Current trivia scores')
        .setDescription('🏅 Failed to get scores. Try again later.')

      return api
        .getScores(this.guildId)
        .then(formatTriviaScores)
        .then(output => embed.setDescription(output))
        .catch(() => embed)
    },
  },
})

const CACHE = new Map()

export default {
  command: 'trivia',
  ping: false,
  help: function () {
    return getEmbed({ withHeader: false })
      .setTitle(`🔮  Trivia: help`)
      .setDescription(
        `Initiate a card, question, or image trivia (only in #trivia). It accepts an optional duration in seconds (and the keyword \`hard\` for grayscale image trivia).`
      )
      .addFields(
        { name: 'Start card trivia', value: '`!trivia card`', inline: true },
        { name: 'Start image trivia', value: '`!trivia image`', inline: true },
        {
          name: 'Start question trivia',
          value: '`!trivia question`',
          inline: true,
        },
        { name: 'Issue a guess', value: '`<guess>`', inline: true },
        { name: 'Stop current trivia', value: '`stop`', inline: true },
        { name: 'Display scores', value: '`!trivia scores`', inline: true }
      )
  },
  handler: function (message, client, messageObject) {
    const channelId = getChannelId(messageObject, this)
    const guildId = messageObject.channel.guild.id

    if (!channelId) return

    // If there is not already a trivia state machine for the current server,
    // create one and cache it.
    if (!CACHE.has(guildId)) {
      const trivia = new TriviaMachine()
      // It is necessary to store the guild ID to be able to get and set trivia
      // scores for the proper server.
      trivia.guildId = guildId
      // It is necessary to store the channel to be able to send messages that are
      // not answers to incoming users’ message, such as the result of a timeout.
      trivia.channel = client.channels.cache.get(channelId)

      CACHE.set(guildId, trivia)
    }

    const trivia = CACHE.get(guildId)

    switch (message.toLowerCase()) {
      case 'scores':
        return trivia.leaderboard()
      case 'inspect':
        return trivia.inspect(messageObject)
      case 'configure':
        return trivia.configure(messageObject)
      default:
        return trivia.initialise(messageObject)
    }
  },
}
