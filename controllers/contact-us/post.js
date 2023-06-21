const { prisma } = require('../../prismaInstance');
const nodemailer = require('nodemailer');

const create = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, subject, description } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !subject || !description) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const newQuery = await prisma.contactQuery.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                subject,
                description,
            }
        });

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
            subject: `Your query (#${newQuery.id}) has been received`,
            html: `
                <p>Hi ${firstName} ${lastName},</p>
                <p>Thank you for your query. We have received your message and will respond to you shortly.</p>
                <p>Your Query ID is: ${newQuery.id}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: "Query created successfully.",
            data: newQuery,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "An error occurred while creating the query."
        });
    }
};

module.exports = { create };
