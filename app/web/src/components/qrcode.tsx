var React = require('react');
var QRCode = require('qrcode.react');

export default ({val}) => {
    return <QRCode value={val} />
}