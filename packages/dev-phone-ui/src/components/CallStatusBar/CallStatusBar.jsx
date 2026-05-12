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

function getCallSids(call) {
    if (!call) return [];
    const parentSid = call.customParameters && typeof call.customParameters.get === 'function'
        ? call.customParameters.get('ParentCallSid') || null
        : null;
    const candidates = [
        { label: 'Params SID',  value: call.parameters?.CallSid || call.parameters?.callSid || null },
        { label: 'SDK SID',     value: call._callSid || null },
        { label: 'Options SID', value: call._options?.callSid || null },
        { label: 'Parent SID',  value: parentSid },
    ];
    const seen = new Set();
    return candidates.filter(({ value }) => {
        if (!value || seen.has(value)) return false;
        seen.add(value);
        return true;
    });
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
    const callSids = getCallSids(currentCallInfo);

    const customParams = (() => {
        const cp = currentCallInfo.customParameters;
        if (!cp || typeof cp.entries !== 'function') return [];
        return Array.from(cp.entries());
    })();

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
            paddingY="space30"
            paddingX="space60"
            borderBottomStyle="solid"
            borderBottomWidth="borderWidth10"
            borderBottomColor="colorBorderInfoWeak"
        >
            <Flex vAlignContent="center" columnGap="space80" flexWrap="wrap" rowGap="space30">
                <Flex vAlignContent="center" columnGap="space20">
                    <Text as="span" fontWeight="fontWeightSemibold" fontSize="fontSize20">
                        {statusLabel}:
                    </Text>
                    <Text as="span" fontSize="fontSize20">
                        {displayNumber || 'Unknown'}
                    </Text>
                    {displayNumber && (
                        <Button variant="secondary_icon" size="reset" onClick={() => copyValue(displayNumber, 'number')}>
                            <ScreenReaderOnly>Copy number</ScreenReaderOnly>
                            <CopyIcon decorative={false} title="Copy number" />
                        </Button>
                    )}
                </Flex>
                {callSids.map(({ label, value }) => (
                    <Flex key={label} vAlignContent="center" columnGap="space20">
                        <Text as="span" fontSize="fontSize20" fontWeight="fontWeightSemibold" color="colorTextWeak">
                            {label}:
                        </Text>
                        <Text as="span" fontSize="fontSize20" color="colorTextWeak">
                            {value}
                        </Text>
                        <Button variant="secondary_icon" size="reset" onClick={() => copyValue(value, label)}>
                            <ScreenReaderOnly>Copy {label}</ScreenReaderOnly>
                            <CopyIcon decorative={false} title={`Copy ${label}`} />
                        </Button>
                    </Flex>
                ))}
            </Flex>
            {customParams.length > 0 && (
                <Flex vAlignContent="center" columnGap="space50" flexWrap="wrap" rowGap="space20" marginTop="space30">
                    {customParams.map(([key, value]) => (
                        <Flex key={key} vAlignContent="center" columnGap="space20">
                            <Text as="span" fontSize="fontSize20" fontWeight="fontWeightSemibold" color="colorTextWeak">
                                {key}:
                            </Text>
                            <Text as="span" fontSize="fontSize20" color="colorTextWeak">
                                {value}
                            </Text>
                            <Button variant="secondary_icon" size="reset" onClick={() => copyValue(value, key)}>
                                <ScreenReaderOnly>Copy {key}</ScreenReaderOnly>
                                <CopyIcon decorative={false} title={`Copy ${key}`} />
                            </Button>
                        </Flex>
                    ))}
                </Flex>
            )}
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
