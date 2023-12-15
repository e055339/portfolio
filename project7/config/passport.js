const passport = require("passport");
const googlePassport = require("passport-google-oauth20");
const User = require("../models/user-model");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("serialize使用者。。。");
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  console.log("deserislize使用者。。。");
  let foundUser = await User.findOne({ _id });
  done(null, foundUser);
});

passport.use(
  new googlePassport(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入google strategy區域");
      // console.log(profile);
      // console.log("======================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已存在，無須儲存資料");
        done(null, foundUser);
      } else {
        console.log("新用戶需儲存資料");
        let newUser = new User({
          googleID: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          thumbnail: profile.photos[0].value,
        });
        let saveUser = await newUser.save();
        console.log("新用戶創建成功");
        done(null, saveUser);
      }
    }
  )
);

passport.use(
  new localStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
