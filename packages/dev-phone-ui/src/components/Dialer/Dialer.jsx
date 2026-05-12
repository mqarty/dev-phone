import { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Button, Flex, Stack, Grid, Column, Box } from "@twilio-paste/core";
import { MicrophoneOnIcon } from "@twilio-paste/icons/cjs/MicrophoneOnIcon";
import { MicrophoneOffIcon } from "@twilio-paste/icons/cjs/MicrophoneOffIcon";
import { TwilioVoiceContext } from '../WebsocketManagers/VoiceManager';
import DTMFButton from './DtmfButton';
import { addDigitToDestinationNumber } from '../../actions';

function Dialer() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo)
    const destinationNumber = useSelector(state => state.destinationNumber)
    const isMuted = useSelector(state => state.isMuted)
    const dispatch = useDispatch();

    const dialer = useContext(TwilioVoiceContext)
    const { acceptCall, declineCall } = dialer

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

    return (
        <Box width="100%" paddingTop="space60">
            <Stack orientation="vertical" spacing="space60">
                <Box width="100%">
                    {isCallInProgress && (
                        <Flex hAlignContent="right" marginBottom="space20">
                            <Button variant="secondary_icon" size="reset" onClick={toggleMute}>
                                {!isMuted
                                    ? <MicrophoneOnIcon size="sizeIcon20" title="Mute" decorative={false} />
                                    : <MicrophoneOffIcon size="sizeIcon20" title="Unmute" decorative={false} />
                                }
                            </Button>
                        </Flex>
                    )}
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
