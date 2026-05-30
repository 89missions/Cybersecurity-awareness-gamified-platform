const registeredusers = require('../modal/regsiteredusers')

const handleLogout = async (req, res) => {

    try {

        const refreshToken = req.cookies.refreshToken

        // No cookie? User is already logged out
        if (!refreshToken) {
            return res.sendStatus(204)
        }

        const foundUser = await registeredusers.findOne({
            refreshToken
        })

        if (foundUser) {
            foundUser.refreshToken = ''
            await foundUser.save()
        }

        const isProduction =
            process.env.NODE_ENV === 'production'

        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        })

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/'
        })

        return res.status(200).json({
            message: 'Logged out successfully'
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = handleLogout