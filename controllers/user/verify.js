const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { prisma } = require('../../prismaInstance');

const verify = async (req, res) => {
  const { userId, token } = req.query;

  try {
    // Check if userId and token are provided
    if (!userId || !token) {
      return res.status(400).json({ error: 'Invalid verification URL. Please provide userId and token.' });
    }

    // Check if userId is valid
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid userId. Please provide a valid userId.' });
    }

    // Verify the token
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Token is valid, change user's isVerified to true
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isVerified: true,
        },
      });

      return res.status(200).json({ message: 'Account verification successful. You can now login.' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Token expired, create new token and send verification email
        const newToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const verificationLink = `${process.env.CLIENT_URL}/verify?userId=${user.id}&token=${newToken}`;

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
          subject: 'Brûlée Patisserie - Verify Your Account',
          html: `
            <h3>Hey ${user.name}!</h3>
            <p>Your verification token has expired. Please click on the link below to verify your account:</p>
            <a href="${verificationLink}">${verificationLink}</a>
          `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(400).json({ error: 'Verification token expired. Please check your email for a new verification link.' });
      } else {
        // Invalid token
        return res.status(400).json({ error: 'Invalid verification token. Please provide a valid token.' });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}

module.exports = { verify };
