const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);