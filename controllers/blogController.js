const { init } = require('@paralleldrive/cuid2')

const blogModel = require("../models/blogModel")
const userModel = require("../models/userModel")
const blogLikesModel = require("../models/blogLikesModel")
const { response } = require('express')


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

    try{

        const pipeline = [
            {
              $match: {
                slug: slug
              }
            },
            {
              $lookup: {
                from: "bloglikes",
                localField: "_id",
                foreignField: "likedPost",
                as: "likes"
              }
            },
            {
              $addFields: {
                likesCount: {
                  $size: {
                    $ifNull: ["$likes", []]
                  }
                }
              }
            },
          ]

          if(userId) {
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
                      }
                    }
                  },
                  {
                    $project: {
                        _id: 0,
                        likesCount: 1,
                        isUserLiked: 1,
                      
                    }
                  }
            )
          }
          else {
            pipeline.push(
                {
                    $project: {
                        _id: 0,
                        likesCount: 1,
                        isUserLiked: 1,
                    }
                }
            )
          }
          
        const likeDetails = await blogModel.aggregate(pipeline)

        response.status(200).send({ message: "Query Performed", likeDetails})
    }
    catch(error) {
        response.status(500).send({ message: error.message })
    }
}

const toggleLike = async (request, response) => {
    const { likedStatus } = request.body
    const { slug } = request.params
    const userId = request.user._id

    try {
        const blog = await blogModel.findOne({ slug }, { _id: 1 })

        if (!blog) {
            return response.status(404).send({ message: "Blog not found" })
        }

        const isUserAlreadyLiked = await blogLikesModel.findOne({ likedUser: userId, likedPost: blog._id })

        if (likedStatus) {
            if (isUserAlreadyLiked) {
                return response.status(400).send({ message: "You have already liked this post" })
            }

            const newLike = new blogLikesModel({
                likedUser: userId,
                likedPost: blog._id
            })

            await newLike.save()
            return response.status(201).send({ message: "Post liked", newLike })
        } else {
            if (!isUserAlreadyLiked) {
                return response.status(400).send({ message: "You haven't liked this post yet" })
            }

            // await isUserAlreadyLiked.remove()
            await blogLikesModel.deleteOne({ _id: isUserAlreadyLiked._id })
            return response.status(200).send({ message: "Like removed" })
        }
    } catch (error) {
        return response.status(500).send({ message: error.message })
    }
}



module.exports = {
    getRandomPosts,
    addBlogPost,
    getUserActionOfABlog,
    toggleLike
}