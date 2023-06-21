const { prisma } = require('../../prismaInstance');

const get = async (req, res) => {
    const { userId } = req.query;
    if ((req.user.userId != userId) && !req.user.isAdmin) {
        return res.status(403).json({
            error: "User not authorized."
        })
    }
    try {
        let orders;
        if (userId && !req.user.isAdmin) {
            orders = await prisma.order.findMany({
                where: {
                    userId: userId,
                },
                orderBy: {
                    pickUp: 'asc',
                }
            });
        } else {
            orders = await prisma.order.findMany({
                orderBy: {
                    pickUp: 'asc',
                },
            });
        }
        return res.status(200).json({
            message: userId ? 'Orders for the user retrieved successfully' : 'All orders retrieved successfully',
            data: orders,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while retrieving the orders'
        });
    }
};

module.exports = { get };
