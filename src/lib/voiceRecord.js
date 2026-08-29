export function pickAudioRecorderMime() {
    if (typeof MediaRecorder === 'undefined')
        return '';
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}
export function extensionForMime(mime) {
    if (mime.includes('mp4'))
        return 'mp4';
    if (mime.includes('ogg'))
        return 'ogg';
    return 'webm';
}
export function stopMediaStream(stream) {
    stream?.getTracks().forEach((track) => track.stop());
}
