const { prisma } = require('../../prismaInstance');

async function logout(req, res) {
  try {
    // Check if refreshToken exists in request cookies
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Find the user based on the refreshToken
      const user = await prisma.user.findFirst({
        where: {
          refreshToken: refreshToken,
        },
      });

      if (user) {
        // Clear refreshToken from the user model
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            refreshToken: null,
          },
        });

        // Clear refreshToken from the request cookies
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: 'Logout successful.' });
      }
    }

    return res.status(200).json({ message: 'No active session found.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}

module.exports = { logout };
