const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/test", (req, res) => {
  return res.send("成功連結auth route");
});

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度太短，至少要8個數字或英文字母");
    return res.redirect("/auth/signup");
  }

  router.post(
    "/login",
    passport.authenticate("local", {
      failureRedirect: "/auth/login",
      failureFlash: "信箱或密碼錯誤，請重新輸入",
    }),
    (req, res) => {
      return res.redirect("/profile");
    }
  );

  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash("error_msg", "信箱已經被註冊，請使用其他信箱");
    return res.redirect("/auth/signup");
  }
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "註冊成功，請重新登入系統");
  return res.redirect("/auth/login");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/profile");
});

module.exports = router;
