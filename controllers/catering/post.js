const { prisma } = require('../../prismaInstance');
const nodemailer = require('nodemailer');

const postCatering = async (req, res) => {
  const { phoneNumber, scheduledTime, description } = req.body;

  if (!(phoneNumber && scheduledTime && description)) {
    return res.status(400).json({ error: "All input fields must be filled" });
  }

  try {
    const user = await prisma.user.findUnique({ 
        where: {
            id: req.user.userId
        },
    });
    
    const newCatering = await prisma.caterings.create({
      data: {
        phoneNumber: phoneNumber,
        scheduledTime: new Date(scheduledTime),
        description: description,
        userId: req.user.userId,
      },
    });

    // Set up email data
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
      subject: `Brûlée Patisserie - Catering Request ${newCatering.id} Successful!`,
      html: `
        <p>Hi ${user.name}!</p>
        <p>Your catering request was successful! Please check it out by viewing your request history on our website!</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(201).json({ message: "Catering request is successful." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};

module.exports = { postCatering };
