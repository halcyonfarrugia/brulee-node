const { prisma } = require('../../prismaInstance');

const complete = async (req, res) => {
    try {
        const { orders } = req.body;
        const failedUpdates = [];
        const orderPromises = orders.map(async (orderId) => {
            const order = await prisma.order.findUnique({
                where: {
                    id: orderId,
                },
            });

            if (!order) {
                failedUpdates.push(orderId);
                return;
            }

            return prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: true,
                },
            });
        });

        // await all promises
        await Promise.all(orderPromises);

        return res.status(200).json({
            message: 'Orders updated.',
            failedUpdates: failedUpdates,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while updating the order',
        });
    }
};

module.exports = { complete };
