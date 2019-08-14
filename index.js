const express = require('express');
const winston = require('winston');
const bodyParser = require('body-parser')
const session = require('express-session')
const { combine, timestamp } = winston.format;
const compression = require('compression');
const passport = require('passport')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const db = require('./db')
const sessionStore = new SequelizeStore({db})
const PORT = process.env.PORT || 3000;


const app = express();

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'my session secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV !== 'production') require('./secrets.js')

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp()),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
   
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

  app.use('/api', require('./api'))


  app.use((err, req, res, next) => {
    logger.error(err)
    logger.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })



app.listen(PORT, () => {
    logger.info(`server has start on port: ${PORT}`)
})

const syncDb = async () => await db.sync()
syncDb()