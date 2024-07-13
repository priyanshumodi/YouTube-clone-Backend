import mongoose,{isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req,res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy,
        sortType,
        userId
    } = req.query;
    // TODO: get all Videos based on query, sort, pagination

    const vidoe = await Video.find(
        {
            $where
        }
    )
})

const publishVideo = asyncHandler(async (req,res) => {
    const {title, description} = req.body

    // TODO: get video, upload to cloudinary, create video

    if(title.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "All fields are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath) {
        throw new ApiError(400, "Video File are required")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file are required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile) {
        throw new ApiError(400, "Video File are required")
    }

    if(!thumbnail) {
        throw new ApiError(400, "thumbnail File are required")
    }

    // console.log(videoFile)

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if(!video) {
        throw new ApiError(500, "Something wents wrong while uploading video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded successfully"))

})

const getVideoById = asyncHandler(async (req,res) => {
    const { videoId } = req.params
    // TODO: get video by id

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, "something went wrong while fetching video by ID")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video feteched successfully"))
})

const updateVideo = asyncHandler( async (req,res) => {
    const {videoId} = req.params
    // TODO: update video details like title, description, thumbnail
    const {title, description} = req.body

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    // console.log(video.owner?._id)
    // console.log(req.user?._id)

    if(video.owner?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you dont have permission")
    }

    if(title.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "title or description are required")
    }

    const thumbnailLocalPath = req.file?.path

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is missing")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail) {
        throw new ApiError(400, "Error while uploading new thumbnail")
    }

    const videoUpdated = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title,
                description,

            }
        },
        {
            new: true
        }
    )

    if(!videoUpdated) {
        throw new ApiError(500, "somenthing went wrong while updating video details")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoUpdated, "video details updated Successfully"))
})

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    // TODO: delete video

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    // console.log(video.owner?._id)
    // console.log(req.user?._id)

    if(video.owner?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you dont have permission")
    }

    const videoDeleted = await Video.findByIdAndDelete(videoId)

    if(!videoDeleted) {
        throw new ApiError(500, "something wents wrong while deleting video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoDeleted, "video has deleted Successfully"));
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    // console.log(video.owner?._id)
    // console.log(req.user?._id)

    if(video.owner?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you dont have permission")
    }

    // console.log(video.isPublished)
    const togglePublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: ! video.isPublished,
            }
        },
        {
            new: true
        }
    )

    if(!togglePublish) {
        throw new ApiError(500, "something wents wrong while toggle Publish video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, togglePublish, "Publish has toggled Successfully"));

})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}