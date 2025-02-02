
if(process.env.NODE_ENV !== "production") { 
    require('dotenv').config();
}


console.log(process.env.SECRET)
console.log(process.env.YOU)
console.log(process.env.HEY)


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Joi= require('joi');

const ExpressError = require('./ultils/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Review = require('./models/review');
const session =require('express-session');
const flash =require('connect-flash');
const User = require('./models/user');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');




mongoose.connect('mongodb://localhost:27017/Yelp', {useNewUrlParser: true, useCreateIndex : true, useUnifiedTopology: true});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret : 'anything', resave : false,  saveUninitialized : true}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const sessionConfig = { 
    secret : 'thisshouldbebettersecret', 
    resave : false,
    saveUninitialized : true,
    cookie: { 
        httpOnly : true, 
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge : 000 * 60 * 60 *24 * 7
    }
}



app.use(session(sessionConfig))
app.use(flash());

app.use((req,res,next) => { 
   if(!['/login', '/'].includes(req.originalUrl)) { 
       req.session.returnTo = req.originalUrl;
   }


    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
 
})

app.get('/fakeUser', async (req, res)=> { 
    const user = new User({
        email : 'sanghwa@gmail', 
        username : 'sanghwa'
    })

    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})



// const validateCampground = (req, res, next) => { 

   
//    const { error} = CampgroundSchema.validate(req.body);
//    if(error) { 
//        const msg = error.details.map(el => el.message).join(',')
//        throw new ExpressError(msg, 400);
//         } else { 
//             next();
//         }

//     }
 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("It has been connected")
});

// const verifyPassword = (req, res, next) => { 
//     const { password} = req.query;
//     if (password === 'chickennugget') { 
//         next();
//     }
//     // res.send("Password needed ")
//     res.status(401)
//     throw  new AppError(401,'password required');
 

// app.get('/error', (req,res) => 
// {
//     chicken.fly()
// })


// const validateReview = (req, res, next) => { 
// const { error } = reviewSchema.validate(req.body);

// if(error) { 
//     const msg = error.details.map(el => el.message).join(',')
//     throw new ExpressError(msg, 400);
//      } else { 
//          next();
//      }

// }

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
   
    res.render('campgrounds/home');
})


// app.get('/makecampground', async (req,res) => {
//     const camp = new Campground( { 
//         title : 'my Backyard',
//         description : 'cheap camping'
//     })
//     await camp.save();
//     res.send(camp);

// })

app.get('/new', (req,res) => {
    res.render('campgrounds/new');
})

// app.get('/campgrounds/:id', catchAsync(async (req,res)=>  { 
//     const campground = await Campground.findById(req.params.id);
//     res.render('campgrounds/show', { campground });
// }))


// app.get('/campgrounds/new', (req,res) => {
//     res.render('campgrounds/new');
// })


// app.get('/', catchAsync(async (req,res, next ) => {
// const campgrounds = await Campground.find({});
// res.render('campgrounds/index', {campgrounds});
// }))

// app.post('/', validateCampground, catchAsync (async (req,res, next) => {
   
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);

// }))

// app.put('/:id', catchAsync (async (req,res, next)=> { 
 
//     const {id } =req.params;
//     const campground =  await Campground.findByIdAndUpdate(id,{ ...req.body.campground } ,{new : true})
//     console.log(campground);

//     res.redirect(`/campgrounds/${campground._id}`);

// }))

// app.get('/:id', catchAsync (async (req,res )=>  { 
//     const campground = await Campground.findById(req.params.id).populate('reviews');
//     console.log(campground);
//     res.render('campgrounds/show', { campground });
// }))
 

// app.get('/:id/edit', catchAsync(async (req,res) => { 
//     const campground = await Campground.findById(req.params.id);
//     res.render('campgrounds/edit', { campground });

// }))

// app.put('/campgrounds/:id', async(req,res)=> { 
 
//     const {id } =req.params;
//     //const campground = await Campground.findById(id);
//     const campground =  await Campground.findByIdAndUpdate(id,{ ...req.body.campground } ,{new : true})
//     console.log(campground);

//     res.redirect(`campgrounds/${campground._id}`);

// })

// app.delete('/:id', catchAsync (async (req,res, next)=> { 
//     const { id} = req.params;
//    await Campground.findByIdAndDelete(id);
   
//     res.redirect('/campgrounds');
// }));



// app.post('/campgrounds/:id/reviews', validateReview, catchAsync (async (req,res) => { 
//    const campground =  await Campground.findById(req.params.id);
//    const review = new Review(req.body.review);
//    campground.reviews.push(review); 
//    review.save();
//    campground.save();
//    console.log(review);
//    res.redirect(`/campgrounds/${campground._id}`)

// }))



// app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req,res) => {
//     const { id, reviewId }  = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull : { reviews : reviewId }})
//      await Review.findByIdAndDelete(req.params.reviewId)
//      res.redirect(`/campgrounds/ ${id}`);
   
    
// }))

// app.use((err, req, res, next) => { 
//     console.log("344djfhskjdfjhsdf"); 
//     console.log("ERRROR"); 
//     console.log("ERRROR");
//     console.log(err);
//     next(err)
// })

app.all('*', (req , res, next) => { 
    next( new ExpressError('Page is Not Found', 404));
})



app.use((err, req, res, next) => { 
    const { statusCode =500, message = 'Something went wrong'} = err;
    console.log(err);
    if(!err.message) err.message ='Oh no, something went wrong!'
    res.status(statusCode).render('error', { err } );
    
})


app.listen(3000, (req, res) => { 
    console.log("hello new page");
})


    