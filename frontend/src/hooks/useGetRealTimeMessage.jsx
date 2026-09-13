import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
    const { socket } = useSelector(store => store.socket);
    const { authUser, selectedUser } = useSelector(store => store.user);
    const { messages } = useSelector(store => store.message);
    const dispatch = useDispatch();

    const authUserRef = useRef(authUser);
    const selectedUserRef = useRef(selectedUser);
    const messagesRef = useRef(messages);

    useEffect(() => {
        authUserRef.current = authUser;
    }, [authUser]);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (!newMessage) return;

            const currentAuth = authUserRef.current;
            const currentSelected = selectedUserRef.current;
            const currentMessages = messagesRef.current;

            // 1. Authoritative verification: message must be addressed to the currently authenticated user
            if (!currentAuth?._id) return;
            if (newMessage.receiverId?.toString() !== currentAuth._id.toString()) {
                return;
            }

            // 2. Active conversation filtering: only display immediately if it belongs to currently selected conversation
            if (currentSelected?._id && newMessage.senderId?.toString() === currentSelected._id.toString()) {
                // Avoid duplicate messages if already present
                const exists = currentMessages?.some(m => m._id?.toString() === newMessage._id?.toString());
                if (!exists) {
                    dispatch(setMessages([...(currentMessages || []), newMessage]));
                }
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, dispatch]);
};

export default useGetRealTimeMessage;