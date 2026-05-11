import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Flex, Stack, Grid, Column, Box, ScreenReaderOnly, Text } from "@twilio-paste/core";
import { MicrophoneOnIcon } from "@twilio-paste/icons/cjs/MicrophoneOnIcon";
import { MicrophoneOffIcon } from "@twilio-paste/icons/cjs/MicrophoneOffIcon";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { TwilioVoiceContext } from '../WebsocketManagers/VoiceManager';
import DTMFButton from './DtmfButton';
import { addDigitToDestinationNumber } from '../../actions';
import CallStatusMessage from './StatusMessage';

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

function Dialer() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo)
    const destinationNumber = useSelector(state => state.destinationNumber)
    const isMuted = useSelector(state => state.isMuted)
    const dispatch = useDispatch();
    const [showCopyToast, setShowCopyToast] = useState(false)
    const copyToastTimeoutRef = useRef(null)

    const dialer = useContext(TwilioVoiceContext)
    const { acceptCall, declineCall, voiceDevice } = dialer

    useEffect(() => {
        return () => {
            if (copyToastTimeoutRef.current) {
                clearTimeout(copyToastTimeoutRef.current)
            }
        }
    }, [])

    const hasValidDestinationNumber = useMemo(() => {
        return destinationNumber && destinationNumber.length > 6
    }, [destinationNumber])

    function makeCall() {
        dialer.makeCall(destinationNumber)
    }

    function hangUp() {
        dialer.hangUp()
    }

    function declineIncomingCall() {
        declineCall()
    }

    function toggleMute() {
        dialer.toggleMute();
    }

    function sendDTMF(num) {
        if (!currentCallInfo) {
            dispatch(addDigitToDestinationNumber(num))
        } else {
            dialer.sendDTMF(num)
        }
    }

    function generateDTMFColumn(col) {
        return col.map(tone => {
            return <DTMFButton
                key={tone}
                tone={tone}
                fullWidth={true}
                onClick={e => sendDTMF(tone)} />
        })
    }

    const isCallInProgress = !!currentCallInfo;
    const isIncomingCall = acceptCall && currentCallInfo && currentCallInfo._direction === 'INCOMING';
    const isIncomingCallRinging = isIncomingCall && currentCallInfo._mediaStatus !== "open";
    const incomingCallerNumber = isIncomingCall ? getIncomingCallerNumber(currentCallInfo) : null;

    function showCopiedToast() {
        setShowCopyToast(true)
        if (copyToastTimeoutRef.current) {
            clearTimeout(copyToastTimeoutRef.current)
        }
        copyToastTimeoutRef.current = setTimeout(() => setShowCopyToast(false), 2000)
    }

    function copyIncomingCallerNumber() {
        if (!incomingCallerNumber || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
            return;
        }

        navigator.clipboard.writeText(incomingCallerNumber)
            .then(showCopiedToast)
            .catch(() => { })
    }

    return (
        <Box width="100%" paddingTop="space60">
            <Stack orientation="vertical" spacing="space60">
                <Box width="100%">
                    {showCopyToast && (
                        <Box marginBottom="space40">
                            <Alert variant="neutral">
                                Copied caller number to clipboard
                            </Alert>
                        </Box>
                    )}
                    <Flex>
                        <Flex grow hAlignContent={"center"}>
                            <CallStatusMessage voiceDevice={voiceDevice} currentCallInfo={currentCallInfo} />
                        </Flex>
                        <Flex>
                            {isCallInProgress && <Button variant="secondary_icon" size="reset" onClick={toggleMute}>
                                {!isMuted ? <MicrophoneOnIcon size="sizeIcon20" title="Mute" decorative={false} /> : <MicrophoneOffIcon size="sizeIcon20" title="Mute" decorative={false} />}
                            </Button>}
                        </Flex>
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['1', '2', '3'])}
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['4', '5', '6'])}
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['7', '8', '9'])}
                    </Flex>
                    <Flex>
                        {generateDTMFColumn(['*', '0', '#'])}
                    </Flex>
                    <Grid spacing="space30" gutter="space30" marginBottom="space40">
                        {isIncomingCall && (
                            <Column span={12}>
                                <Flex hAlignContent="center" vAlignContent="center" columnGap="space30">
                                    <Text as="p" fontWeight="fontWeightSemibold">
                                        Incoming from: {incomingCallerNumber || 'Unknown caller'}
                                    </Text>
                                    <Button
                                        variant="secondary_icon"
                                        size="reset"
                                        onClick={copyIncomingCallerNumber}
                                        disabled={!incomingCallerNumber}
                                    >
                                        <ScreenReaderOnly>Copy incoming caller number</ScreenReaderOnly>
                                        <CopyIcon decorative={false} title="Copy incoming caller number" />
                                    </Button>
                                </Flex>
                            </Column>
                        )}
                        <Column span={isIncomingCallRinging ? 6 : !isCallInProgress ? 12 : 0}>
                            {isIncomingCallRinging ?
                                <Button
                                    fullWidth={true}
                                    disabled={false}
                                    onClick={acceptCall}
                                    variant="primary" >
                                    Answer
                                </Button>
                                : isCallInProgress ? null : <Button
                                    fullWidth={true}
                                    disabled={!!currentCallInfo || !hasValidDestinationNumber}
                                    onClick={makeCall} >
                                    Call
                                </Button>
                            }
                        </Column>
                        <Column span={isIncomingCallRinging ? 6 : (isCallInProgress ? 12 : 0)}>
                            {isIncomingCallRinging && <Button
                                fullWidth={true}
                                disabled={!currentCallInfo}
                                onClick={declineIncomingCall}
                                variant="destructive" >
                                Decline
                            </Button>}
                            {isCallInProgress && !isIncomingCallRinging && <Button
                                fullWidth={true}
                                disabled={!currentCallInfo}
                                onClick={hangUp}
                                variant="destructive" >
                                Hang up
                            </Button>}
                        </Column>
                    </Grid>
                </Box>
            </Stack>
        </Box>
    );
}

export default Dialer;
