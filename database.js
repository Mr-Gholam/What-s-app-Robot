import Sequelize from "sequelize"
const Op = Sequelize.Op;

export default class database {
    constructor(password, host) {
        this.password = password
        this.host = host
        this.db = null
        this.message = null
        this.contacts = null
    }
    async start() {
        this.db = new Sequelize('whatsapp', 'root', this.password, {
            host: this.host,
            dialect: 'mysql',
            logging: false
        })
        this.message = this.db.define('Messages', {
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
            senderName: {
                type: Sequelize.STRING,
                allowNull: true
            },
            timestamp: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        })
        this.contacts = this.db.define('Contacts', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            numbers: {
                type: Sequelize.STRING,
                allowNull: false
            }
        })
        try {
            await this.db.authenticate();
            console.log('Connection has been established successfully.');
            await this.db.sync({ force: true });
            console.log('database has been synced')
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
    async createMessage(mobile, msgText, date, senderName) {
        await this.message.create({
            number: mobile,
            msgContent: msgText,
            timestamp: date,
            senderName: senderName
        })
    }
    async createContact(name, numbers) {
        await this.contacts.create({
            name: name,
            numbers: numbers
        })
    }
    async findContact(number) {
        const test = '%' + number + '%'
        const contact = await this.contacts.findOne({ where: { numbers: { [Op.like]: test } }, attributes: ['name'] })
        return contact
    }
}