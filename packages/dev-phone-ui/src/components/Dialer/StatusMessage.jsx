import { useEffect, useState } from "react";
import { Box, Flex, MediaBody, MediaFigure, MediaObject, Text } from "@twilio-paste/core";

function getIncomingCallerNumber(call) {
    if (!call) {
        return null;
    }

    const customFrom = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('From') || call.customParameters.get('from')
        : null;

    return call.parameters?.From
        || call.parameters?.from
        || call._options?.twimlParams?.from
        || customFrom
        || null;
}

function getOutgoingDestinationNumber(call) {
    if (!call) {
        return null;
    }

    return call._options?.twimlParams?.to
        || call.parameters?.To
        || call.parameters?.to
        || null;
}

function CallStatusMessage({ voiceDevice, currentCallInfo }) {
    const [message, setMessage] = useState('initializing')
    const [statusColor, setStatusColor] = useState('colorBackgroundBusy')

    useEffect(() => {
        if (voiceDevice && !currentCallInfo) {
            setMessage('ready for calls')
            setStatusColor('colorBackgroundSuccess')
        }

        if (voiceDevice && currentCallInfo) {
            setStatusColor('colorBackgroundBusy')
            if (currentCallInfo._direction === 'OUTGOING') {
                const destinationNumber = getOutgoingDestinationNumber(currentCallInfo)
                setMessage(destinationNumber ? `calling ${destinationNumber}` : 'calling')
            } else {
                const callerNumber = getIncomingCallerNumber(currentCallInfo)
                setMessage(callerNumber ? `incoming call from ${callerNumber}` : 'incoming call')
            }
            if (currentCallInfo && currentCallInfo._wasConnected) {
                setMessage('call connected')
                setStatusColor('colorBackgroundSuccess')
            }
        }
    }, [voiceDevice, currentCallInfo])

    return (
        <Flex hAlignContent={"center"}>
            <MediaObject verticalAlign="center">
                <MediaFigure spacing={"space20"}><Box borderRadius={"borderRadiusCircle"} padding={"space20"} backgroundColor={statusColor} /></MediaFigure>
                <MediaBody><Text as={"p"} fontStyle={"italic"}>{message}</Text></MediaBody>
            </MediaObject>
        </Flex>
    )
}

export default CallStatusMessage
