const { Command, Argument } = require('patron.js');
const { inspect } = require('util');

class Eval extends Command {
  constructor() {
    super({
      names: ['eval'],
      groupName: 'botowner',
      description: 'Evaluates JavaScript code',
      args: [
        new Argument({
          key: 'code',
          name: 'code',
          type: 'string',
          example: 'client.token',
          remainder: true
        })
      ]
    });
  }

  async run(msg, args, text) {
    try {
      /* eslint-disable no-unused-vars */
      const { client, member, guild, author, channel, client: { db } } = msg;
      let result = eval(args.code);

      if (result !== undefined && typeof result.then === 'function') {
        result = await result;
      }

      if (typeof result !== 'string') {
        result = inspect(result, { depth: 0 });
      }

      result = result.replace(msg.client.token, ' ');

      return text.sendFields(['Eval', '```js\n' + args.code + '```', '**Returns**', '```js\n' + result + '```']);
    } catch (err) {
      return text.sendFields(['Eval', '```js\n' + args.code + '```', '**Error**', '```js\n' + err + '```']);
    }
  }
}

module.exports = new Eval();