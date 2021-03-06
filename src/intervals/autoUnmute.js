const client = require('../structures/Client.js');
const Constants = require('../utility/Constants.js');
const ModerationService = require('../services/ModerationService.js');

client.setInterval(async () => {
  const mutes = await client.db.muteRepo.findMany();

  for (let i = 0; i < mutes.length; i++) {
    if (mutes[i].mutedAt + mutes[i].muteLength > Date.now()) {
      continue;
    }

    await client.db.muteRepo.deleteById(mutes[i]._id);

    const guild = client.guilds.get(mutes[i].guildId);

    if (guild === undefined) {
      continue;
    }

    const member = guild.member(mutes[i].userId);

    if (member === null) {
      continue;
    }

    const dbGuild = await client.db.guildRepo.getGuild(guild.id);
    const role = guild.roles.get(dbGuild.roles.muted);

    if (role === undefined) {
      continue;
    }

    if (guild.me.hasPermission('MANAGE_ROLES') === false || role.position >= guild.me.highestRole.position) {
      continue;
    }

    await member.removeRole(role);
    await ModerationService.tryInformUser(guild, client.user, 'automatically unmuted', member.user);

    return ModerationService.tryModLog(dbGuild, guild, 'Automatic Unmute', Constants.EMBED_COLORS.UNMUTE , '', null, member.user);
  }
}, Constants.INTERVALS.AUTO_UNMUTE);