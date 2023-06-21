const { prisma } = require('../../prismaInstance');

const complete = async (req, res) => {
    try {
        const { requests } = req.body;
        const failedUpdates = [];
        const cateringPromises = requests.map(async (cateringId) => {
            const catering = await prisma.caterings.findUnique({
                where: {
                    id: cateringId,
                },
            });

            if (!catering) {
                failedUpdates.push(cateringId);
                return;
            }

            return prisma.caterings.update({
                where: {
                    id: cateringId,
                },
                data: {
                    status: true,
                },
            });
        });

        // await all promises
        await Promise.all(cateringPromises);

        return res.status(200).json({
            message: 'Catering requests updated.',
            failedUpdates: failedUpdates,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while updating the catering requests',
        });
    }
};

module.exports = { complete };
