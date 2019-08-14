const Sequelize = require('sequelize')
const pkg = require('../package.json')
const dburl = require('../secrets')

const databaseName = pkg.name + (process.env.NODE_ENV === 'test' ? '-test' : '')

const db = new Sequelize(process.env.DATABASE_URL || dburl || `postgres://localhost:5432/${databaseName}`, { logging: false})
module.exports = db;