const blogModel = require("../models/blogModel")

const getRandomPosts = async (request, response) => {
    const {_id} = request.user || {}

    try {
        const pipeline = [
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
                    image: {
                        $concat: ["http://localhost:3500/api/v1/", "$image"]
                    }
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
                    "author.password": 0
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

module.exports = {
    getRandomPosts
}