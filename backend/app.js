const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const User = require('./models/authModel');

const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


const corsOptions = {
    origin: ["http://localhost:3000","https://uandinaturals.com", "https://www.uandinaturals.com"], // Allowed frontend origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName;
        const profilePictureUrl = profile.photos[0].value;
      

        let user = await User.findByGoogleIdOrIdentifier(googleId);
        if (user) {
          // Update login timestamp for existing user
          await User.updateLastLogin(user.user_id);
          return done(null, user);
        }

        user = await User.createGoogleUser(googleId, email, firstName, lastName, profilePictureUrl);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

  // app.use(
  //   '/auth',
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100,
  //   })
  // );

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const roleRoutes = require('./routes/roleRoutes');
app.use('/roles', roleRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);

const blogRoutes = require('./routes/blogRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const productReelRoutes = require('./routes/productReelRoutes');


app.use('/blogs', blogRoutes);
// app.use('/blogs', blogRoutes);
app.use('/testimonials', testimonialRoutes);
app.use('/reels', productReelRoutes);

const videoRoutes = require('./routes/videoRoutes');
app.use('/videos', videoRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/upload', uploadRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/user', profileRoutes);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/reviews', reviewRoutes);

const reviewAdminRoutes = require('./routes/reviewAdminRoutes');
app.use('/admin', reviewAdminRoutes);

const collectionRoutes = require('./routes/collectionRoutes');
app.use('/collections', collectionRoutes);

const couponRoutes = require('./routes/couponRoutes');
app.use('/coupons', couponRoutes);




const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require("./routes/orderRoutes");
const addressesRoutes = require("./routes/addressRoutes");
const paymentRoutes = require('./routes/paymentRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const routineRoutes = require('./routes/userRoutineRoutes');

app.use('/cart', cartRoutes);
app.use("/orders",orderRoutes)

app.use("/address",addressesRoutes)
app.use('/payments', paymentRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/routines',routineRoutes);

const shippingRoutes = require('./routes/shippingRoutes');
app.use('/shipping', shippingRoutes);

const customerRoutes = require('./routes/customerRoutes');
app.use('/customers', customerRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});



app.listen(5000, () => console.log('Backend running on http://localhost:5000'));


