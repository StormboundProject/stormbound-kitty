import Discord from 'discord.js'
import command from './'

const client = new Discord.Client()
const guild = new Discord.Guild(client, {
  unavailable: false,
  id: '714858253531742208',
  name: 'Kitty House',
  icon: '<mock>',
  splash: '<mock>',
  region: 'eu-west',
  member_count: 1,
  large: false,
  features: [],
  application_id: Discord.SnowflakeUtil.generate(),
  afkTimeout: 1000,
  afk_channel_id: Discord.SnowflakeUtil.generate(),
  system_channel_id: Discord.SnowflakeUtil.generate(),
  embed_enabled: true,
  verification_level: 2,
  explicit_content_filter: 3,
  mfa_level: 8,
  joined_at: new Date('2018-01-01').getTime(),
  owner_id: Discord.SnowflakeUtil.generate(),
  channels: [],
  roles: [],
  presences: [],
  voice_states: [],
  emojis: [],
})
const channelID = Discord.SnowflakeUtil.generate()
const channel = new Discord.TextChannel(guild, {
  ...new Discord.GuildChannel(guild, {
    ...new Discord.Channel(client, { id: channelID }),
  }),
  topic: 'topic',
  name: 'trivia',
  nsfw: false,
  last_message_id: Discord.SnowflakeUtil.generate(),
  lastPinTimestamp: new Date('2019-01-01').getTime(),
  rate_limit_per_user: 0,
})
guild.channels = new Discord.GuildChannelManager(
  guild,
  new Discord.Collection()
)
client.channels = new Discord.GuildChannelManager(
  guild,
  new Discord.Collection()
)
guild.channels.add(channel)
client.channels.add(channel)

const user = new Discord.User(client, {
  id: '368097495605182483',
  username: 'Kitty ✨',
  discriminator: 'Kitty#1909',
  avatar: '<mock>',
  bot: false,
})
const guildMember = new Discord.GuildMember(
  client,
  {
    deaf: false,
    mute: false,
    self_mute: false,
    self_deaf: false,
    session_id: Discord.SnowflakeUtil.generate(),
    channel_id: Discord.SnowflakeUtil.generate(),
    nick: 'Kitty',
    joined_at: new Date('2020-01-01').getTime(),
    user,
    roles: [],
  },
  guild
)

const trivia = content => {
  const message = new Discord.Message(
    client,
    {
      id: Discord.SnowflakeUtil.generate(),
      type: 'DEFAULT',
      content: content,
      author: user,
      webhook_id: null,
      member: guildMember,
      pinned: false,
      tts: false,
      nonce: 'nonce',
      embeds: [],
      attachments: [],
      edited_timestamp: null,
      reactions: [],
      mentions: [],
      mention_roles: [],
      mention_everyone: [],
      hit: false,
    },
    channel
  )

  return command.handler(content.replace('!trivia ', ''), client, message)
}

describe('Bot — !trivia', () => {
  it('should return nothing for a missing term', () => {
    expect(trivia('')).to.equal(undefined)
  })

  it('should be possible to display scores', () => {
    trivia('!trivia scores').then(output =>
      expect(output.title).to.contain('scores')
    )
  })

  it('should be possible to start a card trivia', () => {
    expect(trivia('!trivia card').title).to.contain('trivia started')
  })
})
