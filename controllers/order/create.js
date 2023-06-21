const { prisma } = require('../../prismaInstance');
const nodemailer = require('nodemailer');

const create = async (req, res) => {
    const { items, userId, pickUp } = req.body;
    if (!items || !userId) {
        return res.status(500).json({
            message: 'Invalid request. userId, items, and paymentId are required.',
        });
    }
    try {
        const user = await prisma.user.findUnique({ 
            where: {
                id: userId
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        const order = await prisma.order.create({
            data: {
                userId,
                items,
                createdAt: new Date(),
                status: false,
                pickUp,
            },
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
            to: user.email,
            subject: `Brûlée Patisserie - Order ${order.id} Successful!`,
            html: `
                <p>Hi ${user.name}!</p>
                <p>Your most recent order was successful! Please check it out by viewing your order history on our website!</p>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            message: 'Order successfully created',
            data: order
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred while creating the order',
            error: error.message,
        });
    }
};

module.exports = { create };