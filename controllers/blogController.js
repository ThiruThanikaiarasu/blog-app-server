const { init } = require('@paralleldrive/cuid2')

const blogModel = require("../models/blogModel")
const userModel = require("../models/userModel")
const blogLikesModel = require("../models/blogLikesModel")
const { response, request } = require('express')
const blogBookMarkModel = require('../models/blogBookMarkModel')
const blogCommentsModel = require('../models/blogCommentsModel')
const mongoose = require('mongoose')

const generateBookId = (title, user) => {
    const uniqueIdentifier = init({
        random: Math.random,
        length: 8,
        fingerprint: user
    })

    const sluggedTitle = title
                            .trim() 
                            .toLowerCase() 
                            .replace(/[^a-z0-9\s]+/g, '') 
                            .replace(/\s+/g, '-')

    const bookId = sluggedTitle + "-" + uniqueIdentifier()

    return bookId
}

const addBlogPost = async (request, response) => {
    const {title, description, blogContent} = request.body
    const {filename} = request.file
    const {email} = request.user 

    try{
        const existingAuthor = await userModel.findOne({email})
        if(!existingAuthor) {
            response.status(404).send({ message: 'User not found' })
        }
        const image = 'public/images/' + filename

        const slug = generateBookId(title, existingAuthor._id)

        const newBlog = new blogModel({ 
            slug,
            author: existingAuthor._id,
            title, 
            description, 
            blogContent, 
            image
        })
        await newBlog.save()
        response.status(201).send({ message: 'Blog successfully published' })

    } catch(error) {
        response.status(500).send({ message: error.message })
    }
}

const getRandomPosts = async (request, response) => {
    const {_id} = request.user || {}

    try {
        const pipeline = [
            {
                $addFields: {
                    image: {
                        $concat: ["http://localhost:3500/api/v1/", "$image"]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $addFields: {
                    author: {
                        $first: "$author"
                    }
                }
            },
            {
                $addFields: {
                    "author.image": {
                        $concat: ["http://localhost:3500/api/v1/", "$author.image"]
                    }
                }
            },
            {
                $project: {
                    
                    "_id": 0,
                    "__v": 0,
                    "updatedAt": 0,
                    "author.password": 0,
                    "author._id": 0,
                    "author.__v": 0,
                    "author.role": 0,
                    "author.createdAt": 0,
                    "author.updatedAt": 0,
                }
            }
        ]

        const blogPosts = await blogModel.aggregate(pipeline)

        response.status(200).send({ data: blogPosts, message: 'Recommended Blog' })
    }
    catch(error) {
        response.status(500).send({ message: error.message })
    }
}

const getUserActionOfABlog = async (request, response) => {
    const userId = request.user?._id || {}
    const { slug } = request.params

    try {
        // const pipeline = [
        //     {
        //         $match: {
        //             slug: slug
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "bloglikes",
        //             localField: "slug", 
        //             foreignField: "likedPost", 
        //             as: "likes"
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "blogbookmarks", 
        //             localField: "slug", 
        //             foreignField: "bookmarkedPost",
        //             as: "bookmarks"
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "blogcomments",
        //             let: { postSlug: "$slug" }, // Use `let` to pass slug into the lookup
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ["$commentedPost", "$$postSlug"] }, // Match the commentedPost to the slug
        //                                 { $eq: ["$parentComment", null] } // Only comments where parentComment is null
        //                             ]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: "comments"
        //         }
        //     },
        //     {
        //         $addFields: {
        //             likesCount: {
        //                 $size: {
        //                     $ifNull: ["$likes", []]
        //                 }
        //             },
        //             bookmarks: {
        //                 $ifNull: ["$bookmarks", []]
        //             },
        //             commentsCount: {
        //                 $size: {
        //                     $ifNull: ["$comments", []]
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "comments.commentedBy",
        //             foreignField: "_id",
        //             as: "commentAuthors",
        //             pipeline: [
        //                 {
        //                     $project: {
        //                         firstName: 1,
        //                         image: {
        //                             $concat: ["http://localhost:3500/api/v1/", "$image"]
        //                         }
        //                     }
        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         $addFields: {
        //             comments: {
        //                 $map: {
        //                     input: "$comments",
        //                     as: "comment",
        //                     in: {
        //                         $mergeObjects: [
        //                             "$$comment",
        //                             {
        //                                 author: {
        //                                     $arrayElemAt: [
        //                                         {
        //                                             $filter: {
        //                                                 input: "$commentAuthors",
        //                                                 as: "author",
        //                                                 cond: {
        //                                                     $eq: ["$$author._id", "$$comment.commentedBy"]
        //                                                 }
        //                                             }
        //                                         },
        //                                         0
        //                                     ]
        //                                 }
        //                             }
        //                         ]
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // ]

        // // User-specific conditions for likes, bookmarks, and comments
        // if (userId) {
        //     pipeline.push(
        //         {
        //             $addFields: {
        //                 isUserLiked: {
        //                     $cond: {
        //                         if: {
        //                             $gt: [
        //                                 {
        //                                     $size: {
        //                                         $filter: {
        //                                             input: "$likes",
        //                                             as: "like",
        //                                             cond: {
        //                                                 $eq: ["$$like.likedUser", userId]
        //                                             }
        //                                         }
        //                                     }
        //                                 },
        //                                 0
        //                             ]
        //                         },
        //                         then: true,
        //                         else: false
        //                     }
        //                 },
        //                 userBookmarked: {
        //                     $cond: {
        //                         if: {
        //                             $gt: [
        //                                 {
        //                                     $size: {
        //                                         $filter: {
        //                                             input: "$bookmarks",
        //                                             as: "bookmark",
        //                                             cond: {
        //                                                 $eq: ["$$bookmark.bookmarkedUser", userId] 
        //                                             }
        //                                         }
        //                                     }
        //                                 },
        //                                 0
        //                             ]
        //                         },
        //                         then: true,
        //                         else: false
        //                     }
        //                 },
        //                 isUserComment: {
        //                     $cond: {
        //                         if: {
        //                             $gt: [
        //                                 {
        //                                     $size: {
        //                                         $filter: {
        //                                             input: "$comments",
        //                                             as: "comment",
        //                                             cond: {
        //                                                 $eq: ["$$comment.commentedBy", userId]
        //                                             }
        //                                         }
        //                                     }
        //                                 },
        //                                 0
        //                             ]
        //                         },
        //                         then: true,
        //                         else: false
        //                     }
        //                 }
        //             }
        //         },
        //         {
        //             $project: {
        //                 _id: 0,
        //                 likesCount: 1,
        //                 isUserLiked: 1,
        //                 userBookmarked: 1,
        //                 commentsCount: 1,
        //                 isUserComment: 1,
        //                 comments: 1 
        //             }
        //         }
        //     )
        // } else {
        //     pipeline.push(
        //         {
        //             $project: {
        //                 _id: 0,
        //                 likesCount: 1,
        //                 isUserLiked: 1,
        //                 userBookmarked: 1,
        //                 commentsCount: 1,
        //                 comments: 1 
        //             }
        //         }
        //     )
        // }

        const pipeline = [
            {
                $match: {
                    slug: slug
                }
            },
            {
                $lookup: {
                    from: "bloglikes",
                    localField: "slug",
                    foreignField: "likedPost",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "blogbookmarks",
                    localField: "slug",
                    foreignField: "bookmarkedPost",
                    as: "bookmarks"
                }
            },
            {
                $lookup: {
                    from: "blogcomments",
                    let: { postSlug: "$slug" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$commentedPost", "$$postSlug"] },
                                        { $eq: ["$parentComment", null] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "comments"
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: {
                            $ifNull: ["$likes", []]
                        }
                    },
                    bookmarks: {
                        $ifNull: ["$bookmarks", []]
                    },
                    commentsCount: {
                        $size: {
                            $ifNull: ["$comments", []]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.commentedBy",
                    foreignField: "_id",
                    as: "commentAuthors",
                    pipeline: [
                        {
                            $project: {
                                firstName: 1,
                                image: {
                                    $concat: ["http://localhost:3500/api/v1/", "$image"]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    comments: {
                        $map: {
                            input: "$comments",
                            as: "comment",
                            in: {
                                $mergeObjects: [
                                    "$$comment",
                                    {
                                        author: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$commentAuthors",
                                                        as: "author",
                                                        cond: {
                                                            $eq: ["$$author._id", "$$comment.commentedBy"]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        // Add the isUserComment field for each comment
                                        isUserComment: {
                                            $cond: {
                                                if: {
                                                    $eq: ["$$comment.commentedBy", userId]
                                                },
                                                then: true,
                                                else: false
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ];
        
        // Add the general user-specific fields
        if (userId) {
            pipeline.push(
                {
                    $addFields: {
                        isUserLiked: {
                            $cond: {
                                if: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$likes",
                                                    as: "like",
                                                    cond: {
                                                        $eq: ["$$like.likedUser", userId]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                then: true,
                                else: false
                            }
                        },
                        userBookmarked: {
                            $cond: {
                                if: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$bookmarks",
                                                    as: "bookmark",
                                                    cond: {
                                                        $eq: ["$$bookmark.bookmarkedUser", userId]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        likesCount: 1,
                        isUserLiked: 1,
                        userBookmarked: 1,
                        commentsCount: 1,
                        comments: 1
                    }
                }
            );
        } else {
            pipeline.push({
                $project: {
                    _id: 0,
                    likesCount: 1,
                    commentsCount: 1,
                    comments: 1
                }
            });
        }        

        const likeDetails = await blogModel.aggregate(pipeline)

        response.status(200).send({ message: "Query Performed", likeDetails })
    } catch (error) {
        response.status(500).send({ message: error.message })
    }
}


const toggleLike = async (request, response) => {
    const { likedStatus } = request.body
    const { slug } = request.params
    const userId = request.user._id

    try {

        const isUserAlreadyLiked = await blogLikesModel.findOne({ likedUser: userId, likedPost: slug })

        if (likedStatus) {
            if (isUserAlreadyLiked) {
                return response.status(400).send({ message: "You have already liked this post" })
            }

            const newLike = new blogLikesModel({
                likedUser: userId,
                likedPost: slug
            })

            await newLike.save()
            return response.status(201).send({ message: "Post liked" })
        } 

        if(!isUserAlreadyLiked) {
            return response.status(400).send({ message: "You haven't liked this post yet" })
        }

        await blogLikesModel.deleteOne({ _id: isUserAlreadyLiked._id })
        response.status(200).send({ message: "Like removed" })
        
    } 
    catch (error) {
        response.status(500).send({ message: error.message })
    }
}

const addRootComment = async (request, response) => {
    const { slug } = request.params
    const userId = request.user._id
    const { text } = request.body
    try{
        const blog = await blogModel.findOne({ slug })
        if(!blog) {
            response.status(404).send({ message: 'Blog not found' })
        }
        const initialReply = 0 

        const newComment = new blogCommentsModel({
            text,
            commentedBy: userId,
            commentedPost: slug,
            parentComment: null, // since it's an root comment
            numberOfReplies: initialReply
        })

        await newComment.save()
        response.status(201).send({ message: "Comment added successfully"})
    }
    catch (error) {
        response.status(500).send({ message: error.message })
    }
}

const addReplyComment = async (request, response) => {
    const { slug } = request.params
    const { text, parentComment } = request.body
    const userId = request.user._id

    const session = await blogCommentsModel.startSession()
    session.startTransaction()

    try {
        const initialReply = 0

        const existingParentComment = await blogCommentsModel.findOne({ _id: parentComment }).session(session)

        if (!existingParentComment) {
            await session.abortTransaction()
            session.endSession()
            return response.status(404).send({ message: 'Parent comment not found' })
        }

        existingParentComment.numberOfReplies += 1
        await existingParentComment.save({ session })

        const newReplyComment = new blogCommentsModel({
            text,
            commentedBy: userId,
            commentedPost: slug,
            parentComment,
            numberOfReplies: initialReply
        })

        await newReplyComment.save({ session })

        await session.commitTransaction()
        session.endSession()

        response.status(201).send({ message: 'Reply added successfully' })
    } catch (error) {
        await session.abortTransaction()
        session.endSession()

        response.status(500).send({ message: error.message || 'An error occurred while adding the reply' })
    }
}

const getNestedCommentsOfParentComment = async (request, response) => {
    const { parentComment } = request.body
    const userId = request?.user?._id || null
    console.log("parentComment",parentComment)
    console.log("userId", userId)

    try {

        const pipeline = [
            {
                $match: {
                    parentComment: new mongoose.Types.ObjectId(parentComment) 
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "commentedBy", 
                    foreignField: "_id",
                    as: "commentAuthors",
                    pipeline: [
                        {
                            $project: {
                                firstName: 1,
                                image: {
                                    $concat: ["http://localhost:3500/api/v1/", "$image"]
                                }
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    author: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$commentAuthors",
                                    as: "author",
                                    cond: {
                                        $eq: ["$$author._id", "$commentedBy"]
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            }
        ];
        
        if (userId) {
            pipeline.push({
                $addFields: {
                    isUserComment: {
                        $eq: ["$commentedBy", userId]
                    }
                }
            });
        }
        
        pipeline.push({
            $project: {
                _id: 1,
                text: 1,
                createdAt: 1,
                author: 1,
                isUserComment: 1,
                numberOfReplies: 1
            }
        });        
        
        const replyComments = await blogCommentsModel.aggregate(pipeline);
        console.log(replyComments)
        
        return response.status(200).json(replyComments);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
};



const toggleBookmark = async (request, response) => {
    const { bookmarkedStatus } = request.body
    const { slug } = request.params
    const userId = request.user._id

    try {
        
        const isUserAlreadyBookmarked = await blogBookMarkModel.findOne({ bookmarkedUser: userId, bookmarkedPost: slug })

        if(bookmarkedStatus) {
            if(isUserAlreadyBookmarked)  {
                return response.status(400).send({ message: "You have already bookmarked this post"})
            }

            const newBookmark = new blogBookMarkModel({
                bookmarkedUser: userId,
                bookmarkedPost: slug
            })

            await newBookmark.save()
            return response.status(201).send({ message: "Bookmark Added" })
        }

        if(!isUserAlreadyBookmarked) {
            return response.status(400).send({ message: "You haven't bookmarked this post yet" })
        }

        await blogBookMarkModel.deleteOne({ _id: isUserAlreadyBookmarked._id })
        response.status(200).send({ message: "Bookmark Removed" })
    } 
    catch (error) {
        return response.status(500).send({ message: error.message })
    }
}

module.exports = {
    getRandomPosts,
    addBlogPost,
    getUserActionOfABlog,
    toggleLike,
    addRootComment,
    addReplyComment,
    getNestedCommentsOfParentComment,
    toggleBookmark,
}