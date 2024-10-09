const { init } = require('@paralleldrive/cuid2')

const blogModel = require("../models/blogModel")
const userModel = require("../models/userModel")


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
        console.log(newBlog)
        // await newBlog.save()
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


module.exports = {
    getRandomPosts,
    addBlogPost
}