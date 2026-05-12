import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Alert, Box, Button, Flex, ScreenReaderOnly, Text } from "@twilio-paste/core";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";

function getIncomingCallerNumber(call) {
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

function getOutgoingDestinationNumber(call) {
    if (!call) return null;
    return call._options?.twimlParams?.to
        || call.parameters?.To
        || call.parameters?.to
        || null;
}

function getConnectedPeerNumber(call) {
    if (!call) return null;
    if (call._direction === 'OUTGOING') return getOutgoingDestinationNumber(call);
    return getIncomingCallerNumber(call);
}

function getCallSid(call) {
    if (!call) return null;
    return call.parameters?.CallSid
        || call.parameters?.callSid
        || call._options?.callSid
        || call._callSid
        || null;
}

function CallStatusBar() {
    const currentCallInfo = useSelector((state) => state.currentCallInfo);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    if (!currentCallInfo) return null;

    const isIncoming = currentCallInfo._direction === 'INCOMING';
    const isConnected = !!currentCallInfo._wasConnected;
    const callSid = getCallSid(currentCallInfo);

    let statusLabel;
    let displayNumber;
    if (isConnected) {
        statusLabel = 'Connected to';
        displayNumber = getConnectedPeerNumber(currentCallInfo);
    } else if (isIncoming) {
        statusLabel = 'Incoming from';
        displayNumber = getIncomingCallerNumber(currentCallInfo);
    } else {
        statusLabel = 'Calling';
        displayNumber = getOutgoingDestinationNumber(currentCallInfo);
    }

    function showCopiedToast(msg) {
        setToastMessage(msg);
        setShowToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2000);
    }

    function copyNumber() {
        if (!displayNumber || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(displayNumber)
            .then(() => showCopiedToast('Copied number to clipboard'))
            .catch(() => {});
    }

    function copySid() {
        if (!callSid || !navigator.clipboard?.writeText) return;
        navigator.clipboard.writeText(callSid)
            .then(() => showCopiedToast('Copied call SID to clipboard'))
            .catch(() => {});
    }

    return (
        <Box
            width="100%"
            backgroundColor="colorBackgroundInfo"
            paddingY="space30"
            paddingX="space60"
            borderBottomStyle="solid"
            borderBottomWidth="borderWidth10"
            borderBottomColor="colorBorderInfoWeak"
        >
            <Flex vAlignContent="center" columnGap="space50">
                <Flex vAlignContent="center" columnGap="space20" grow>
                    <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize20">
                        {statusLabel}:
                    </Text>
                    <Text as="span" fontSize="fontSize20">
                        {displayNumber || 'Unknown'}
                    </Text>
                    {displayNumber && (
                        <Button variant="secondary_icon" size="reset" onClick={copyNumber}>
                            <ScreenReaderOnly>Copy number</ScreenReaderOnly>
                            <CopyIcon decorative={false} title="Copy number" />
                        </Button>
                    )}
                </Flex>
                {callSid && (
                    <Flex vAlignContent="center" columnGap="space20">
                        <Text as="span" fontSize="fontSize20" color="colorTextWeak">
                            SID: {callSid}
                        </Text>
                        <Button variant="secondary_icon" size="reset" onClick={copySid}>
                            <ScreenReaderOnly>Copy call SID</ScreenReaderOnly>
                            <CopyIcon decorative={false} title="Copy call SID" />
                        </Button>
                    </Flex>
                )}
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
