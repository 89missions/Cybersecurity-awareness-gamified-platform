const jwt = require('jsonwebtoken')
const registeredusers = require('../modal/regsiteredusers')

const handleRefreshToken = async (req, res) => {
    try {

        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            return res.status(401).json({
                message: 'No refresh token provided'
            })
        }

        const foundUser = await registeredusers.findOne({
            refreshToken
        })

        if (!foundUser) {
            return res.status(403).json({
                message: 'Invalid refresh token'
            })
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (error, decoded) => {

                if (error) {
                    return res.status(403).json({
                        message: 'Refresh token expired or invalid'
                    })
                }

                const accessToken = jwt.sign(
                    {
                        username: decoded.username
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                        expiresIn: '15m'
                    }
                )

                const isProduction =
                    process.env.NODE_ENV === 'production'

                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    maxAge: 15 * 60 * 1000,
                    path: '/'
                })

                return res.status(200).json({
                    message: 'Token refreshed'
                })
            }
        )

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = handleRefreshToken