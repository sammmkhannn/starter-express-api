import Like from "../../models/Like.model.js";
import Post from "../../models/Post.model.js";
import Reply from "../../models/Reply.model.js";
import Comment from "../../models/Comment.model.js";
import User from "../../models/User.model.js";
import SuperLike from "../../models/SuperLike.model.js";
import formatDate from "../../utils/getDate.js";
import jwt from "jsonwebtoken";
import { response } from "express";



//create a  post
export const createPost = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
    let payload = req.body;
    payload.userId = userId;
    let media = [];
    let {postType} = payload;
    if(!postType) {
      return res.status(400).send({success:false, Message:"define a valid post type"});
    }
    if (req?.files.length > 0) {
      // payload.postType = req.file ? req.file.mimetype.split('/')[0] : null;
      for(let file of req.files) {
        // return res.status(200).send(file.filename);
        media.push(file.filename);
      }
      // return res.status(200).send({success:true,media});
      //add post type
    payload.media = media;
    let newPost = new Post(payload);
    await newPost.save();
    return res.status(200).send({
      success: true,
      Message: "Your post has been published",
      post: newPost,
    });
    }
    let newPost = new Post(payload);
    await newPost.save();
    return res.status(200).send({
      success: true,
      Message: "Your post has been published",
      post: newPost,
    });
  } catch (err) {   
    console.log(err);
    return res.status(500).send({ success: false, Message: err.message });
  }
};

//update a post
export const updatePost = async (req, res) => {
  let postId = req.body.postId;
  try {
    let payload = req.body;
    let media = [];
    if(req.files && req.files.length > 0) {
      for(let file of req.files) {
        media.push(file.filename);
      }
      payload.media = media;
    }
    
    await Post.updateOne({ _id: postId }, payload);
    return res
      .status(200)
      .send({ success: false, Message: "post has been updated!" });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

//delete a post
export const deletePost = async (req, res) => {
  let postId = req.body.postId;
  try {
    await Post.deleteOne({ _id: postId });
    return res
      .status(200)
      .send({ success: true, Message: "Post has been deleted!" });
  } catch (err) {
    return res.status(500).send({ success: true, Message: err.message });
  }
};

//like/unlike a post
export const likeUnlikePost = async (req, res) => {
  let postId = req.body.postId;
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
    let like = await Like.findOne({ postId, userId });
    if (like) {
      await Like.deleteOne({ postId, userId });
      let post = await Post.findOne({ _id: postId });
      if (post.userId == userId) {
        post.likedByAuthor = false;
        await post.save();
      }
      return res
        .status(200)
        .send({ success: true, Message: "You Unliked the Post", liked: false });
    } else {
      let newLike = new Like({ postId, userId });
      await newLike.save();
      let post = await Post.findOne({ _id: postId });
      if (post.userId == userId) {
        post.likedByAuthor = true;
        await post.save();
      }
      return res
        .status(200)
        .send({ success: true, Message: "You Liked the Post!", liked: true });
    }
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

//comment on a  post
export const comment = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let senderId = decoded.id;
  let postId = req.body.postId;
  try {
    let payload = req.body;
    payload.senderId = senderId;
    payload.postId = postId;
    let newComment = new Comment(payload);
    await newComment.save();
    return res
      .status(200)
      .send({ success: true, Message: "you commented on this post" });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

//reply to a comment
export const reply = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let senderId = decoded.id;

  let commentId = req.body.commentId;
  try {
    let payload = req.body;
    payload.senderId = senderId;
    payload.commentId = commentId;
    let newReply = new Reply(payload);
    await newReply.save();
    return res
      .status(200)
      .send({ success: true, Message: "Your reply has been sent" });
  } catch (err) {
    return res.status(200).send({ success: false, Message: err.message });
  }
};

//get all posts by user id
export const getPosts = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  // let postType = req.body.postType;
  try {
    let posts = await Post.find().sort({dateTime: "desc"});
    // return res.status(200).send(posts.media);
    if (posts.length == 0) {
      return res
        .status(404)
        .send({ success: false, Message: "No posts found" });
    }

    let allLikes = [];

    //get likes for each post
    for (let post of posts) {
      let likes = await Like.find({ postId: post._id });

      allLikes.push(likes.length);
    }

    let modifiedPosts = [];

    for (let i = 0; i < posts.length; i++) {
      let liked = await Like.findOne({ postId: posts[i]._id, userId });
      let superLiked = await SuperLike.findOne({
        postId: posts[i]._id,
        userId,
      });

      let post = {
        _id: posts[i]._id,
        userId: posts[i].userId,
        description: posts[i].description,
        media: posts[i].media.map(mediaFile => process.env.BASE_URL + mediaFile),
        dateTime: formatDate(posts[i].dateTime),
        hide: posts[i].hide,
        createdAt: posts[i].createdAt,
        modifiedAt: posts[i].updatedAt,
        likes: allLikes[i],
        postType: posts[i]?.postType,
        likedByUser: liked ? true : false,
        superLikedByUser: superLiked ? true : false,
      };
      modifiedPosts.push(post);
    }
    return res.status(200).send({ success: true, posts: modifiedPosts });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

export const getMyandMyFriendsPosts = async (req, res) => {
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  let postType = req.body.postType;
  // let user = await User.findOne({ _id: userId });

  try {
    //get user posts
    let userPosts = await Post.find({ userId, postType }).sort({
      dateTime: "desc",
    });

    let allUserPostsLikes = [];

    for (let post of userPosts) {
      let likes = await Like.find({ postId: post._id });
      allUserPostsLikes.push(likes.length);
    }

    //change date format
    // //get user profile
    let modifiedUserPosts = [];

    for (let i = 0; i < userPosts.length; i++) {
      let liked = await Like.findOne({ postId: userPosts[i]._id, userId });
      let superLiked = await SuperLike.findOne({
        postId: userPosts[i]._id,
        userId,
      });

      let post = {
        _id: userPosts[i]._id,
        userId: userPosts[i].userId,
        description: userPosts[i].description,
        media: userPosts[i].media.length > 0
          ? userPosts[i].media.map(mediaFile => process.env.BASE_URL + mediaFile)
          : "",
        dateTime: formatDate(userPosts[i].dateTime),
        hide: userPosts[i].hide,
        createdAt: userPosts[i].createdAt,
        modifiedAt: userPosts[i].updatedAt,
        likes: allUserPostsLikes[i],
        postType: userPosts[i]?.postType,
        likedByUser: liked ? true : false,
        superLikedByUser: superLiked ? true : false,
      };
      modifiedUserPosts.push(post);
    }
    let user = await User.findOne({ _id: userId });

    //get friend list
    let friendsList = user.friendList;
    let friendsPosts = [];

    for (let friendId of friendsList) {
      let friendPosts = await Post.find({ userId: friendId, postType }).sort({
        dateTime: "desc",
      });
      friendsPosts.push(friendPosts);
    }
    friendsPosts = friendsPosts.flat(1);

    let allFriendsPostsLikes = [];
    for (let post of friendsPosts) {
      let likes = await Like.find({ postId: post._id });
      allFriendsPostsLikes.push(likes.length);
    }
 
    let modifiedFriendsPosts = [];

    for (let i = 0; i < friendsPosts.length; i++) {
      let liked = await Like.findOne({ postId: friendsPosts[i]._id, userId });
      let superLiked = await SuperLike.findOne({
        postId: friendsPosts[i]._id,
        userId,
      });

      let post = {
        _id: friendsPosts[i]._id,
        userId: friendsPosts[i].userId,
        description: friendsPosts[i].description,
        media: userPosts[i].media.length > 0
          ? userPosts[i].media.map(mediaFile => process.env.BASE_URL + mediaFile)
          : "",
        dateTime: formatDate(friendsPosts[i].dateTime),
        hide: friendsPosts[i].hide,
        createdAt: friendsPosts[i].createdAt,
        modifiedAt: friendsPosts[i].updatedAt,
        likes: allFriendsPostsLikes[i],
        postType: friendsPosts[i]?.postType,
        likedByUser: liked ? true : false,
        superLikedByUser: superLiked ? true : false,
      };
      modifiedFriendsPosts.push(post);
    }
    return res
      .status(200)
      .send([...modifiedUserPosts, ...modifiedFriendsPosts]);
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

export const getComments = async (req, res) => {
  let postId = req.body.postId;
  try {
    let comments = await Comment.find({ postId }).sort({ dateTime: "asc" });
    if (comments.length <= 0) {
      return res
        .status(404)
        .send({ success: false, Message: "Comments Not Found!" });
    }

    //format the dateTime
    comments = comments.map((comment) => {
      comment.dateTime = formatDate(comment.dateTime);
      return comment;
    });
    return res.status(200).send(comments);
  } catch (err) {
    return res.status(200).send({ success: false, Message: err.message });
  }
};

export const getReplies = async (req, res) => {
  let commentId = req.body.commentId;
  try {
    let replies = await Reply.find({ commentId });

    if (replies.length <= 0) {
      return res
        .status(404)
        .send({ success: true, Message: "Replies Not Found!" });
    }
    //format the dateTime
    replies = replies.map((reply) => {
      reply.dateTime = formatDate(reply.dateTime);
      return reply;
    });
    return res.status(200).send(replies);
  } catch (err) {
    return res.status(500).send({ success: true, Message: err.message });
  }
};

export const getLikes = async (req, res) => {
  let postId = req.body.postId;
  try {
    let likes = await Like.find({ postId });
    if (likes.length <= 0) {
      return res
        .status(404)
        .send({ success: false, Message: "Likes Not Found!" });
    }
    return res.status(200).send(likes);
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};

export const hideUnhidePost = async (req, res) => {
  let postId = req.body.postId;
  //FIXME: post.save is not a function
  try {
    let post = await Post.findOne({ _id: postId });
    post.hide = !post.hide;
    post.save().then((response) => {
      return res.status(200).send(response);
    });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};


export const superLike = async (req, res) => {
  let postId = req.body.postId;
  let authToken = req.header('auth-token');
  let decoded = jwt.decode(authToken);
  let userId = decoded.id;

  try {
    let like = new SuperLike({
      userId,
      postId,
      liked: true,
    });
    let post = await Post.findOne({ _id: postId });
    if (!post) {
      return res
        .status(404)
        .send({ success: true, Message: "Post Not Found!" });
    }
    if (post.userId == userId) {
      post.superLikedByUser = !post.superLikedByUser;
      await post.save();
    }
    await like.save();
    return res
      .status(200)
      .send({ success: true, Message: "You Super liked the post" });
  } catch (err) {
    return res.status(200).send({ success: false, Message: err.message });
  }
};

export const getCommentsCount = async (req, res) => {
  let postId = req.body.postId;
  try {
    let commentsCount = await Comment.find({ postId }).count();

    return res.status(200).send({ success: true, commentsCount });
  } catch (err) {
    return res.status(200).send({
      success: false,
      Message: "Got an error while getting number of comments",
    });
  }
};

export const superLikesCount = async (req, res) => {
  let postId = req.body.postId;
  try {
    let superLikesCount = await SuperLike.find({ postId }).count();
    return res.status(200).send({ success: true, superLikesCount });
  } catch (err) {
    return res.status(500).send({ success: true, Message: err.message });
  }
};

export const getTotalLikes = async (req, res) => {
  let postId = req.body.postId;
  try {
    let likesCount = await Like.find({ postId }).count();
    return res.status(200).send({ success: true, likes: likesCount });
  } catch (err) {
    return res.status(500).send({ success: false, Message: err.message });
  }
};
