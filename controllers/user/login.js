const bcrypt = require('bcrypt');
const { prisma } = require('../../prismaInstance');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if email exists
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    }

    // Check if password matches hashedPassword
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new verification link and send email
      const verifyToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      const verificationLink = `${process.env.CLIENT_URL}/verify?userId=${user.id}&token=${verifyToken}`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Brûlée Patisserie - Verify to Access Account!',
        text: `Your account is not yet verified. Please click on the following link to verify your account: ${verificationLink}`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(401).json({ error: 'Account verification required. Please check your email for a verification link.' });
    }

    // User is verified, create access token
    const accessToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });

    // Check if refreshToken exists and update it in the model
    if (user.refreshToken) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
    }

    // Create refresh token
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Send access token in the response body and refresh token in cookies
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ 
      user: {
        name: user.name,
        id: user.id,
        isAdmin: user.isAdmin
      }, 
      accessToken: accessToken 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}

module.exports = { login };
