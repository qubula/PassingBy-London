// Landmark pins for v2 maps (Choose Route and the ride).
// Design: light grey teardrop with the landmark's number in black.
// The number is a Google Maps marker label, so it uses the page font (Satoshi).

window.landmarkPin = function (number) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">'
        + '<path d="M14 0C21.7 0 28 6.2 28 13.8C28 16.4 27.3 18.4 26 21L14 40L2 21C0.7 18.4 0 16.4 0 13.8C0 6.2 6.3 0 14 0Z" fill="#D9D9D9"/>'
        + '</svg>';
    return {
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
            scaledSize: new google.maps.Size(28, 40),
            anchor: new google.maps.Point(14, 40),      // the tip sits on the landmark
            labelOrigin: new google.maps.Point(14, 14)  // number in the round head
        },
        label: {
            text: String(number),
            color: '#1a1a1a',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif"
        }
    };
};
