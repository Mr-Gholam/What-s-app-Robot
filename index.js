// const qrcode = require('qrcode-terminal');
// const env = require('dotenv')
// const TelegramBot = require('node-telegram-bot-api')
// const { Client } = require('whatsapp-web.js');
// const Database = require('./database')
// var vcard = require('vcard-json');
import qrcode from 'qrcode-terminal'
import env from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import { Client } from 'whatsapp-web.js'
import Database from './database.js';
import vcard from 'vcard-json'


env.config()
const client = new Client({});


const database = new Database('mehdi007', 'localhost')

const token = process.env.TOKEN
const chatId = process.env.CHATID

// const bot = new TelegramBot(token, { polling: true });

await database.start()


vcard.parseVcardFile('./contacts.vcf', async function (err, data) {
    // await database.sync(true)
    if (err) console.log('oops:' + err);
    else {
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            const name = element.fullname
            let numbers
            for (let j = 0; j < element.phone.length; j++) {
                const number = element.phone[j];
                // getting valid number
                if (number.value.length == 13) {
                    // removing - from number
                    if (number.value[3] == '-') {
                        const correctNumber = number.value.split('-')
                        if (numbers) {
                            numbers = numbers + '|' + correctNumber.join('')
                        } else {
                            numbers = correctNumber.join('')
                        }
                        continue
                    }
                    // removing +98 from number and adding 0
                    let correctNumber = number.value.slice(3, 13)
                    // adding more numbers to a contact
                    if (numbers) {
                        numbers = numbers + '|' + 0 + correctNumber
                    } else {
                        numbers = 0 + correctNumber
                    }
                    continue
                }
                // removing invalid number
                if (number.value.length <= 13) {
                    continue
                }
                // filtering for more valid number
                if (number.value.length >= 13) {
                    // filtering for more iranian numbers
                    if (number.value.includes(98)) {
                        // iranian numbers
                        if (number.value.slice(0, 3) == '+98') {
                            // invalid number removed 
                            if (number.value.length - 3 !== 10) continue
                            let correctNumber = number.value.slice(3)
                            // adding more numbers to a contact
                            if (numbers) {
                                numbers = numbers + '|' + 0 + correctNumber
                            } else {
                                numbers = 0 + correctNumber
                            }
                        }
                        if (number.value.slice(0, 2) == 98) {
                            const shortedNumber = number.value.slice(2)
                            const correctNumber = shortedNumber.split('-')
                            // adding more numbers to a contact
                            if (numbers) {
                                numbers = numbers + '|' + 0 + correctNumber.join('')
                            } else {
                                numbers = 0 + correctNumber.join('')
                            }
                            continue
                        }
                        //  Not iranian number 
                        if (numbers) {
                            numbers = numbers + '|' + number.value
                        } else {
                            numbers = number.value
                        }
                    } else {
                        //  Not iranian number 
                        // adding more numbers to a contact
                        if (numbers) {
                            numbers = numbers + '|' + number.value
                        } else {
                            numbers = number.value
                        }
                    }
                }
            }
            // preventing empty number to be inserted to database
            if (!numbers) continue
            database.createContact(name, numbers)
        }
    }
});





// client.on('qr', qr => {
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', async () => {
//     console.log('ready')
// });

client.on('message', async (message) => {
    const mobile = message.from.split('@')[0]
    const msgText = message.body
    const date = message.timestamp
    let reply
    const name = message._data.notifyName

    const number = mobile.substring(2, 11)

    const callableNumber = 0 + number

    if (message._data.quotedMsg) reply = message._data.quotedMsg.body


    database.createMessage(callableNumber, msgText, date)

    // try {
    //     if (reply) return bot.sendMessage(chatId, `${msgText} \n\n ${reply} \n\n  ${callableNumber} \n${name} `)
    //     bot.sendMessage(chatId, `${msgText}  \n\n  ${callableNumber} \n${name} `)
    // } catch (err) {
    //     console.log('telegram' + err.message)
    // }
}

);

client.initialize();
