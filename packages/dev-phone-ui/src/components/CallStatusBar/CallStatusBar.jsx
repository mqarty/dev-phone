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
            <style>{`
                .callActionButton {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 58px;
                    height: 58px;
                    border-radius: 9999px;
                    border: 1px solid transparent;
                    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
                    transition: transform 140ms ease, box-shadow 140ms ease, filter 140ms ease;
                }

                .callActionButton:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.03);
                    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.24);
                }

                .callActionButton:active {
                    transform: translateY(0);
                }

                .callActionButton:focus-visible {
                    outline: 2px solid rgba(2, 99, 224, 0.45);
                    outline-offset: 3px;
                }

                .callActionAnswer {
                    background: #e9fcef;
                    border-color: #7ccf8a;
                }

                .callActionEnd {
                    background: #ffe9e9;
                    border-color: #f08a8a;
                }

                .callActionGroup {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    row-gap: 6px;
                }

                .callActionLabel {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    opacity: 0;
                    transform: translateY(-2px);
                    transition: opacity 140ms ease, transform 140ms ease;
                    user-select: none;
                }

                .callActionGroup:hover .callActionLabel,
                .callActionGroup:focus-within .callActionLabel {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (min-width: 900px) {
                    .callActionLabel {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <Flex vAlignContent="center" columnGap="space30" wrap>
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
            </Flex>
            {(isIncomingCallRinging || canEndLiveCall) && (
                <Flex hAlignContent="center" vAlignContent="center" columnGap="space100" marginTop="space50">
                    {isIncomingCallRinging && (
                        <Box as="span" className="callActionGroup">
                            <Button variant="secondary_icon" size="reset" onClick={dialer.acceptCall}>
                                <ScreenReaderOnly>Answer call</ScreenReaderOnly>
                                <Box as="span" className="callActionButton callActionAnswer" color="colorTextSuccess">
                                    <CallIncomingIcon decorative={false} title="Answer call" size="sizeIcon70" />
                                </Box>
                            </Button>
                            <Text as="span" className="callActionLabel" color="colorTextSuccess">
                                Answer
                            </Text>
                        </Box>
                    )}
                    {(isIncomingCallRinging || canEndLiveCall) && (
                        <Box as="span" className="callActionGroup">
                            <Button
                                variant="secondary_icon"
                                size="reset"
                                onClick={isIncomingCallRinging ? dialer.declineCall : dialer.hangUp}
                            >
                                <ScreenReaderOnly>{isIncomingCallRinging ? 'Decline call' : 'Hang up call'}</ScreenReaderOnly>
                                <Box as="span" className="callActionButton callActionEnd" color="colorTextError">
                                    <CallFailedIcon
                                        decorative={false}
                                        title={isIncomingCallRinging ? 'Decline call' : 'Hang up call'}
                                        size="sizeIcon70"
                                    />
                                </Box>
                            </Button>
                            <Text as="span" className="callActionLabel" color="colorTextError">
                                {isIncomingCallRinging ? 'Decline' : 'End'}
                            </Text>
                        </Box>
                    )}
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
                        boxShadow="shadowCard"
                        style={{ animation: 'toastFadeOut 2s ease-in forwards', minWidth: '240px', zIndex: 9999 }}
                    >
                        <Alert variant="neutral">{toastMessage}</Alert>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default CallStatusBar;
