const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loginApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  unlockedLevel: {
    type: Number,
    default: 1
  }
});

const User = mongoose.model('User', UserSchema);

// 🔐 Login or Signup
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });

  if (!user) {
    // Create new user with default level 1
    const newUser = new User({ username, password, unlockedLevel: 1 });
    await newUser.save();
    return res.json({ success: true, message: "User created & logged in", user: newUser });
  }

  if (user.password !== password) {
    return res.json({ success: false, message: "Wrong password" });
  }

  res.json({ success: true, message: "Logged in successfully", user });
});

// 🆙 Update unlocked level
app.post('/updateUnlockedLevel', async (req, res) => {
  const { username, level } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "User not found" });

  if (level > user.unlockedLevel) {
    user.unlockedLevel = level;
    await user.save();
  }

  res.json({ success: true, message: "Level updated", unlockedLevel: user.unlockedLevel });
});

// 📦 Get unlocked level
app.get('/getUnlockedLevel/:username', async (req, res) => {
  const username = req.params.username;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "User not found" });

  res.json({ success: true, unlockedLevel: user.unlockedLevel });
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
