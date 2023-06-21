const bcrypt = require('bcrypt');
const { prisma } = require('../../prismaInstance');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, name, password } = req.body;
  console.log(req.body);

  try {
    // Check if email is already being used
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use. Please use another email.' });
    }

    // Generate hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        hashedPassword: hashedPassword,
      },
    });

    // Create verification token
    const verifyToken = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Create verification email and send to email
    const verificationLink = `${process.env.CLIENT_URL}/verify?userId=${newUser.id}&token=${verifyToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Brûlée Patisserie - Verify Your Account',
      html: `
        <h3>Hey ${name}!</h3>
        <p>Please click on the following link to verify your account:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (info.accepted) {
          console.log(info)
          return res.status(201).json({ message: 'Registration successful. Please check your email for verification.' });
        } else {
          return res.status(500).json({ message: "Error occurred in trying to send verification email. Please try again later."});
        }
        
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

module.exports = { register };