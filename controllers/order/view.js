const { prisma } = require('../../prismaInstance');

const view = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });

        if (!order) {
            return res.status(404).json({
                error: 'Order not found',
            });
        }

        // Check user authorization.
        if ((req.user.userId !== order.userId) && !req.user.isAdmin) {
            return res.status(403).json({
                error: 'User not authorized.',
            });
        }

        return res.status(200).json({
            message: 'Order retrieved successfully',
            data: order,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while retrieving the order',
        });
    }
};

module.exports = { view };
