import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";
import mongoose from "mongoose"

export const searchContacts = async (request, response, next) => {
    try {
        const { searchTerm } = request.body;
        if (searchTerm === undefined || searchTerm === null) {
            return response.status(400).send("Search term is required");
        }

        const santizedSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
        const regex = new RegExp(santizedSearchTerm, "i");

        const contacts = await User.find({
            $and: [
                {_id: {$ne: request.userId}},{
                    $or: [{firstName:regex },{lastName:regex},{email: regex}],
                }
            ],
        })

        response.status(200).json({ contacts});
    } catch (error) {
      console.log(error);
      return response.status(500).send("Internal server error");
    }
  };


  export const getContactsForDmList = async (request, response, next) => {
    try {

        let {userId} = request;
        userId = new mongoose.Types.ObjectId(userId);

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [
                        {sender: userId},
                        {receiver: userId},
                    ],
                },
            },
            {
                $sort: {
                    timestamp:-1
                },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if:{
                                $eq: ["$sender", userId]
                            },
                            then: "$receiver",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: {$first: "$timestamp"}
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                },
            },
            {
                $unwind: "$contactInfo",
            },
            {
                $project: {
                    _id: 1,
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    email: "$contactInfo.email",
                    image: "$contactInfo.image",
                    color: "$contactInfo.color",
                    lastMessageTime: 1,
                },
            },
            {
                $sort: {
                    lastMessageTime: -1,
                },
            }
        ])

        response.status(200).json({ contacts});
    } catch (error) {
      console.log(error);
      return response.status(500).send("Internal server error");
    }
  };


  export const getAllContacts = async (request, response, next) => {
    try {
        const users = await User.find({_id: {$ne: request.userId}},"firstName lastname _id email")
        
        const contacts = users.map((user)=>({
            label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id
        }))

        response.status(200).json({ contacts});
    } catch (error) {
      console.log(error);
      return response.status(500).send("Internal server error");
    }
  };