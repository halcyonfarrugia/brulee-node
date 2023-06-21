const { prisma } = require('../../prismaInstance');

const get = async (req, res) => {
    try {
        // Find all queries
    const queries = await prisma.contactQuery.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.status(200).json({
            message: 'Queries retrieved successfully.',
            data: queries,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while retrieving the queries.',
        });
    }
};

module.exports = { get };
