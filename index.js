const qrcode = require('qrcode-terminal');
const env = require('dotenv')
const TelegramBot = require('node-telegram-bot-api')
const { Client } = require('whatsapp-web.js');
const client = new Client({});


const Sequelize = require('sequelize')

const sequelize = new Sequelize('whatsapp', 'root', 'mehdi007', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
})
env.config()

const token = process.env.TOKEN
const chatId = process.env.CHATID

const bot = new TelegramBot(token, { polling: true });

const Msg = sequelize.define('Messages', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    number: {
        type: Sequelize.STRING,
        allowNull: false
    },
    msgContent: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
})



client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('ready')
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

client.on('message', async (message) => {
    const mobile = message.from.split('@')[0]
    const msgText = message.body
    const date = message.timestamp
    let reply
    const name = message._data.notifyName

    const number = mobile.substring(2, 11)

    const callableNumber = 0 + number

    if (message._data.quotedMsg) reply = message._data.quotedMsg.body

    await Msg.create({
        number: mobile,
        msgContent: msgText,
        timestamp: date
    })
    try {
        if (reply) return bot.sendMessage(chatId, `${msgText} \n\n ${reply} \n\n  ${callableNumber} \n${name} `)
        bot.sendMessage(chatId, `${msgText}  \n\n  ${callableNumber} \n${name} `)
    } catch (err) {
        console.log('telegram' + err.message)
    }
}

);
(async () => { await sequelize.sync({ force: false }); })()


client.initialize();
