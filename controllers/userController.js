const blogBookMarkModel = require("../models/blogBookMarkModel")
const blogModel = require("../models/blogModel")
const imageBasePath = "http://localhost:3500/api/v1/"

const getUsersPostsAndBookmarks = async (request, response) => {
    const userId = request.user._id
    try {
        const userPosts = await blogModel.aggregate([
            {
                $match: { author: userId } 
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
                $unwind: { 
                    path: "$author", 
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $project: { 
                    title: 1,
                    content: 1,
                    slug: 1,
                    description: 1,
                    blogContent: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    image : { 
                        $concat: [imageBasePath, "/", "$image"] 
                    },
                    "author.firstName": 1,
                    "author.image": { 
                        $concat: [imageBasePath, "/", "$author.image"] 
                    },
                }
            }
        ])

        const userBookmarks = await blogBookMarkModel.aggregate(
            [
                {
                  $match: {
                    bookmarkedUser: userId,
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "bookmarkedUser",
                    foreignField: "_id",
                    as: "author",
                  },
                },
                {
                  $unwind: {
                    path: "$author",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              
                {
                  $lookup: {
                    from: "blogposts",
                    localField: "bookmarkedPost",
                    foreignField: "slug",
                    as: "blog",
                  },
                },
                {
                  $unwind: {
                    path: "$blog",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                  {
                  $unset: [
                    "author.password",
                    "author._id",
                    "author.role",
                    "author.updatedAt",
                    "author.createdAt",
                    "author.__v",
                  ],
                },
                {
                  $addFields: {
                    "blog.author": "$author"
                      }
                },
                {
                  $addFields: {
                    "blog.image": {
                      $concat: [imageBasePath, "$blog.image"]
                    }
                  }
                },
                {
                  $addFields: {
                    "blog.author.image": {
                      $concat: [imageBasePath, "$blog.author.image"]
                    }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    blog: 1,
                  }
                }
              ]
        )
            

        response.status(200).send({ userPosts, userBookmarks })
    }
    catch(error) {
        response.status(500).send({ message: error.message })
    }
}


module.exports = {
    getUsersPostsAndBookmarks
}