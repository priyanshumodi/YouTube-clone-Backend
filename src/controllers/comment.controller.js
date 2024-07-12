import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    
    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const comments =  await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "allComments"
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ])

    if(!comments?.length) {
        throw new ApiError(404, "comments not exist for this video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "successfully get all comments"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {comment} = req.body

    if(!comment.trim()) {
        throw new ApiError(400, "comment is required")
    }

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const commentAdded = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user._id
    })

    if(!commentAdded) {
        throw new ApiError(500, "something went wrong while comment on the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, commentAdded, "successfully comment on video"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {newComment} = req.body

    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id")
    }

    if(!newComment.trim()==="") {
        throw new ApiError(400, "comment is required")
    }

    const comment = await Comment.findById(commentId)

    if(comment.owner._id !== req.user._id) {
        throw new ApiError(403, "you dont have permission")
    }

    const commentUpdated = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: newComment
            }
        },
        {
            new: true
        }
    )

    if(!commentUpdated) {
        throw new ApiError(500,"Something went wrong while updating comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, commentUpdated, "successfully updated comment"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment Id")
    }

    const comment = await Comment.findById(commentId)

    if(comment.owner._id !== req.user._id) {
        throw new ApiError(403, "you dont have permission")
    }

    const commentDeleted = await Comment.findByIdAndDelete(commentId)

    if(!commentDeleted) {
        throw new ApiError(400, "Something wents wrong while deleting comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, commentDeleted, "successfully delete comment"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }