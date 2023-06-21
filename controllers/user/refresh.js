const jwt = require('jsonwebtoken');
const { prisma } = require('../../prismaInstance');

async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;

  try {
    // Check if refreshToken exists
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found.' });
    }

    // Verify the refreshToken
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if the refreshToken is valid
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Create new access token
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });

    return res.status(200).json({ accessToken: accessToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}

module.exports = { refresh }
