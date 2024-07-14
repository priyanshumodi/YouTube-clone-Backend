import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import {verfyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verfyJWT)

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription)

router.route("/u/:subscriberId").get(getUserChannelSubscribers)

export default router