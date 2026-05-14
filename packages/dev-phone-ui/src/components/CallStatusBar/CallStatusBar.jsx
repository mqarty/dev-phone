import { useContext, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Alert, Box, Button, Flex, ScreenReaderOnly, Text } from "@twilio-paste/core";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { CallIncomingIcon } from "@twilio-paste/icons/esm/CallIncomingIcon";
import { CallFailedIcon } from "@twilio-paste/icons/esm/CallFailedIcon";
import { TwilioVoiceContext } from "../WebsocketManagers/VoiceManager";

function getFromNumber(call) {
    if (!call) return null;
    const customFrom = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('From') || call.customParameters.get('from')
        : null;

    return call.parameters?.From
        || call.parameters?.from
        || call._options?.twimlParams?.from
        || customFrom
        || null;
}

function getToNumber(call) {
    if (!call) return null;
    const customTo = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('To') || call.customParameters.get('to')
        : null;

    return call.parameters?.To
        || call.parameters?.to
        || call._options?.twimlParams?.to
        || customTo
        || null;
}

function CallStatusBar() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo);
    const dialer = useContext(TwilioVoiceContext);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const toastTimeoutRef = useRef(null);

    if (!currentCallInfo) {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = null;
        }
        return null;
    }

    const toNumber = getToNumber(currentCallInfo);
    const fromNumber = getFromNumber(currentCallInfo);
    const isIncomingCall = !!dialer?.acceptCall && currentCallInfo._direction === 'INCOMING';
    const isIncomingCallRinging = isIncomingCall && currentCallInfo._mediaStatus !== "open";
    const canEndLiveCall = !isIncomingCallRinging && !!dialer?.hangUp;

    function showCopiedToast(msg) {
        setToastMessage(msg);
        setShowToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
    }

    function copyValue(value, label) {
        if (!value || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(value)
            .then(() => showCopiedToast(`Copied ${label} to clipboard`))
            .catch(() => { });
    }

    return (
        <Box
            width="100%"
            backgroundColor="colorBackgroundInfo"
            paddingY="space50"
            paddingX="space60"
            borderBottomStyle="solid"
            borderBottomWidth="borderWidth10"
            borderBottomColor="colorBorderInfoWeak"
        >
            <Flex vAlignContent="center" hAlignContent="between" wrap>
                <Flex vAlignContent="center" columnGap="space30" wrap>
                    <Box
                        borderRadius="borderRadiusCircle"
                        backgroundColor="colorBackgroundSuccess"
                        style={{ width: '10px', height: '10px' }}
                    />
                    <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize40">
                        Connected to
                    </Text>
                    <Text as="span" fontSize="fontSize40">
                        {toNumber || 'Unknown'}
                    </Text>
                    {toNumber && (
                        <Button variant="secondary_icon" size="reset" onClick={() => copyValue(toNumber, 'to number')}>
                            <ScreenReaderOnly>Copy connected number</ScreenReaderOnly>
                            <CopyIcon decorative={false} title="Copy connected number" />
                        </Button>
                    )}
                    <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize40">
                        from
                    </Text>
                    <Text as="span" fontSize="fontSize40">
                        {fromNumber || 'Unknown'}
                    </Text>
                    {fromNumber && (
                        <Button variant="secondary_icon" size="reset" onClick={() => copyValue(fromNumber, 'from number')}>
                            <ScreenReaderOnly>Copy source number</ScreenReaderOnly>
                            <CopyIcon decorative={false} title="Copy source number" />
                        </Button>
                    )}
                </Flex>
                <Flex vAlignContent="center" columnGap="space20">
                    {isIncomingCallRinging && (
                        <Button variant="secondary_icon" size="reset" onClick={dialer.acceptCall}>
                            <ScreenReaderOnly>Answer call</ScreenReaderOnly>
                            <CallIncomingIcon decorative={false} title="Answer call" />
                        </Button>
                    )}
                    {(isIncomingCallRinging || canEndLiveCall) && (
                        <Button
                            variant="secondary_icon"
                            size="reset"
                            onClick={isIncomingCallRinging ? dialer.declineCall : dialer.hangUp}
                        >
                            <ScreenReaderOnly>{isIncomingCallRinging ? 'Decline call' : 'Hang up call'}</ScreenReaderOnly>
                            <CallFailedIcon decorative={false} title={isIncomingCallRinging ? 'Decline call' : 'Hang up call'} />
                        </Button>
                    )}
                </Flex>
            </Flex>
            {showToast && (
                <>
                    <style>{`
                        @keyframes toastFadeOut {
                            0%, 75% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                    `}</style>
                    <Box
                        position="fixed"
                        bottom="space70"
                        right="space70"
                        zIndex="zIndex90"
                        boxShadow="shadowCard"
                        style={{ animation: 'toastFadeOut 2s ease-in forwards', minWidth: '240px' }}
                    >
                        <Alert variant="neutral">{toastMessage}</Alert>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default CallStatusBar;
