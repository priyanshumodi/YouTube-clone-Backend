import mongoose, {isValidObjectId} from "mongoose";
import{Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    // TODO: toggle like on vido

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }


    const video = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    let result;
    let like;

    if(!video) {
        result = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
        like = true;
    }
    else {
        result = await Like.deleteOne({
            video: videoId,
            likedBy: req.user?._id
        })
        like = false;
    }

    if(!result) {
        throw new ApiError(500, "something went wrong while toggling video like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, like?"Video toggle to like successfully":"Video toggle to unlike successfully"))
})

const toggleCommentLike = asyncHandler(async(req,res) => {
    const {commentId} = req.params
    // TODO: toggle like on comment

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video id")
    }


    const comment = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    let result;
    let like;

    if(!comment) {
        result = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        like = true;
    }
    else {
        result = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user?._id
        })
        like = false;
    }

    if(!result) {
        throw new ApiError(500, "something went wrong while toggling comment like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, like?"comment toggle to like successfully":"comment toggle to unlike successfully"))
})

const toggleTweetLike = asyncHandler(async(req,res) => {
    const {tweetId} = req.params
    // TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid video id")
    }


    const tweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    let result;
    let like;

    if(!tweet) {
        result = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        like = true;
    }
    else {
        result = await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        like = false;
    }

    if(!result) {
        throw new ApiError(500, "something went wrong while toggling tweet like")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, like?"tweet toggle to like successfully":"tweet toggle to unlike successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    // TODO: get all liked videos

    const videos = await Like.aggregate(
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id),
                    video: { $ne: null }
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videos"
                }
            },
            {
                $project: {
                    videos: 1,
                    likedBy:1
                }
            }
        ]
    )

    console.log(videos)

    if(!videos) {
        throw new ApiError(500, "something went wrong while fetching all liked videos")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All liked video fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}