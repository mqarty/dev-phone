import {
    Box, Flex, SkeletonLoader,
    Text, ChatLog, ChatMessage,
    ChatBubble, ChatMessageMeta, ChatMessageMetaItem,
    Avatar
} from "@twilio-paste/core"
import { UserIcon } from '@twilio-paste/icons/esm/UserIcon';
import { useSelector } from "react-redux"
import EmptyMessageList from "./EmptyMessageList";


function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function MessageList({ devPhoneName }) {
    const messageList = useSelector(state => state.messageList)
    const numberInUse = useSelector(state => state.numberInUse ? state.numberInUse.phoneNumber : "");

    return (
        messageList ?
            <Box overflowY="scroll" height="size40" tabIndex={0}>
                <ChatLog>
                    {messageList.length > 0 ?
                        messageList.map((message, i) => {
                            const isFromDevPhone = message.author === devPhoneName;
                            return (
                                <ChatMessage variant={!isFromDevPhone ? "outbound" : "inbound"}>
                                    <ChatBubble>
                                        {message.body}
                                    </ChatBubble>
                                    <ChatMessageMeta aria-label={!isFromDevPhone ? "said by outbound user" : "said by dev phone"}>
<<<<<<< HEAD
                                        <Flex flexDirection="column" alignItems="center" gap="space40">
                                            <Flex flexDirection="column" alignItems="center" gap="space20">
                                                <Avatar size="sizeIcon30" name={message.author} icon={UserIcon} />
                                                <Text fontSize="fontSize70">{message.author}</Text>
                                            </Flex>
=======
                                        <Flex flexDirection="column" alignItems="center">
                                            <Avatar size="sizeIcon30" name={message.author} icon={UserIcon} />
                                            <Text>{message.author}</Text>
>>>>>>> 8a32fac83749ca7300aea09544ebc558488d2f50
                                            <Box
                                                borderStyle="solid"
                                                borderWidth="borderWidth10"
                                                borderColor="colorBorderWeaker"
<<<<<<< HEAD
                                                borderRadius="borderRadiusRound"
                                                paddingX="space30"
                                                paddingY="space20"
                                            >
                                                <Text fontSize="fontSize70">{formatTime(message.dateCreated)}</Text>
=======
                                                borderRadius="borderRadiusCircle"
                                                paddingX="space20"
                                                paddingY="space10"
                                                marginTop="space20"
                                            >
                                                <Text fontSize="fontSize80">{formatTime(message.dateCreated)}</Text>
>>>>>>> 8a32fac83749ca7300aea09544ebc558488d2f50
                                            </Box>
                                        </Flex>
                                    </ChatMessageMeta>
                                </ChatMessage>
                            )
                        })
                        : <EmptyMessageList devPhoneNumber={numberInUse} />
                    }
                </ChatLog>
            </Box>
            : <SkeletonLoader height={"size20"} />
    )
}

export default MessageList
