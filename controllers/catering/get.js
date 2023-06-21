const { prisma } = require('../../prismaInstance');

const getCaterings = async (req, res) => {
    const { userId } = req.query;
    if ((req.user.userId != userId) && !req.user.isAdmin) {
        return res.status(403).json({
            error: "User not authorized."
        })
    }
    try {
        let caterings;
        if (userId && !req.user.isAdmin) {
            caterings = await prisma.caterings.findMany({
                where: {
                    userId: userId,
                },
                orderBy: {
                    scheduledTime: 'asc',
                }
            });
        } else {
            caterings = await prisma.caterings.findMany({
                orderBy: {
                    scheduledTime: 'asc',
                },
            });
        }
        return res.status(200).json({
            message: userId ? 'Catering requests for the user retrieved successfully' : 'All catering requests retrieved successfully',
            data: caterings,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while retrieving the catering requests'
        });
    }
};

module.exports = { getCaterings };
