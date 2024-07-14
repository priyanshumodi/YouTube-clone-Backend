import mongoose,{isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async(req,res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const subscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(!subscribed) {
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })
        .then((result) => {
            return res
                .status(200)
                .json(new ApiResponse(200, result, "channel Subscribed"))
        })
        .catch((error) => {
            throw new ApiError(500, error)
        })
    }

    const result = await Subscription.deleteOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(!result) {
        throw new ApiError(500, "Something wents wrong while toggle subscription")
    }

    return res
        .status(200)
        .json(new ApiRespon(200, result, "channeSubscribed"))

})

// controller to return subscription
const getUserChannelSubscribers = asyncHandler(async(req,res)=> {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const subscriber = await Subscription.find({
        channel: channelId
    })

    if(!subscriber) {
        throw new ApiError(500, "something went wrong while fatching subscriber")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriber, "all subscriber of this channel fatched successfully"))

})

// controller to return channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params

    if(!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber Id")
    }

    const subscribedTo = await Subscription.find({
        subscriber: subscriberId
    })

    if(!subscribedTo) {
        throw new ApiError(500, "something went wrong while fatching subscribed channel")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedTo, "all subscribed channel of this user fatched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}