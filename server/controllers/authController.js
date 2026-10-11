const jwt = require('jsonwebtoken');
const User = require('../models/User');

const publicUser = (user) => ({_id: user._id, id: user._id, name: user.name, email: user.email, avatar: user.avatar, initials: user.initials, color: user.color, activeStatus: user.activeStatus}) 

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_sprintcraft_2026', {
    expiresIn: '30d',
  })
}

const register = async (req, res) => {
  try{
    const { name, email, password } = req.body;

    if(!name || !email || !password){
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    if(String(password).length < 6){
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });

    if(userExists){
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash: password,
    })

    if(user){
      return res.status(201).json({
        ...publicUser(user),
        token: generateToken(user._id),
      })
    } 
    else {
      return res.status(400).json({ message: 'Invalid user data received' });
    }
  } 
  catch (error) {
    if(error.name === 'ValidationError'){
      const first = Object.values(error.errors)[0];
      return res.status(400).json({ message: first ? first.message : 'Invalid user data' });
    }
    if(error.code === 11000){
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

const login = async (req, res) => {
  try{
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if(user && (await user.comparePassword(password))){
      return res.json({
        ...publicUser(user),
        token: generateToken(user._id),
      });
    } 
    else{
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } 
  catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

const getMe = async (req, res) => {
  try{
    const user = await User.findById(req.user._id);
    if(!user){
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(publicUser(user));
  } 
  catch (error) {
    console.error('GetMe Error:', error.message);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
}

module.exports = {register, login, getMe}
