const express=require('express');
const path=require('path');
const dotenv=require('dotenv');
const morgan=require('morgan');
//const exphbs = require('express-handlebars')
const {engine} = require('express-handlebars');
const connectDB= require('./config/db')
const passport=require('passport');
const session=require('express-session')
const mongoose=require('mongoose');
const MongoStore = require('connect-mongo');
const methodOverride=require('method-override')
//load config
dotenv.config({path: './config/config.env'})
//passport config
require('./config/passport')(passport)

connectDB()
const app=express();


//body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)
//logging
// if(process.env.NODE_ENV==='development')
// {
//     app.use(morgan('dev'))
// }

//helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs')

//handlebars
app.engine(
  '.hbs',
  engine({
    helpers: {
      formatDate,
      stripTags,
      truncate,
     editIcon,
      select,
    },
    defaultLayout: 'main',
    extname: '.hbs',
  })
)
app.set('view engine', '.hbs');

//sessions
app.use(session({
  secret : 'mysecretkey',
  resave : true,
  saveUninitialized : true,
  store :MongoStore.create({ mongoUrl: "mongodb+srv://manasi3749:manasi3749@cluster1.vndql.mongodb.net/poems?" })
}));

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

//Static folder
app.use(express.static(path.join(__dirname,'public')))

//routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/poems', require('./routes/poems'))

const PORT=process.env.PORT||3000


app.listen(PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))