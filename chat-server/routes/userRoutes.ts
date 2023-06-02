import express from  'express'
import {registerUser, loginUser} from '../controllers/userControllers'

const router = express.Router()

router.route('/logout').post(registerUser)
router.post('/login', loginUser)

export default router