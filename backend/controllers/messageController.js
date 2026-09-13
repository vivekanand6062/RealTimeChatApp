import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import { io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required." });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message content cannot be empty." });
        }

        // Verify receiver user exists in database
        const receiver = await User.findById(receiverId).select("_id");
        if (!receiver) {
            return res.status(404).json({ message: "Receiver user not found." });
        }

        let gotConversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!gotConversation) {
            gotConversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message.trim()
        });

        if (newMessage) {
            gotConversation.messages.push(newMessage._id);
        }

        await Promise.all([gotConversation.save(), newMessage.save()]);

        // SOCKET IO: Strictly route to receiver's private room. NEVER broadcast globally.
        io.to(receiverId.toString()).emit("newMessage", newMessage);

        return res.status(201).json({
            newMessage
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({ message: "Failed to send message." });
    }
};
export const getMessage = async (req,res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;
        const conversation = await Conversation.findOne({
            participants:{$all : [senderId, receiverId]}
        }).populate("messages"); 
        return res.status(200).json(conversation?.messages);
    } catch (error) {
        console.log(error);
    }
}