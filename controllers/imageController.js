const getFileByName = (request, response) => {
    const {filename} = request.params
    const parentDirectory = (__dirname).split('controller')[0]
    const filePath = parentDirectory + 'public/images/' + filename
    // console.log(filePath)
    response.sendFile(filePath)
}

module.exports = {
    getFileByName
}