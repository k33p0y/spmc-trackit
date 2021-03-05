let url_ws_comment = wsStart + loc.host + '/ws/comments/';
const socket_comment = new WebSocket(url_ws_comment)

socket_comment.onopen = function(event) {
    console.log(event)
    socket_comment.send(JSON.stringify({a: 1, b: 'The quick brown fox', c: true}))
}

socket_comment.onmessage = function(event) {
    console.log(event)
}

socket_comment.onclose = function(event) {
    $('.online-status').removeClass('text-success');
}

socket_comment.onerror = function(event) {
    console.log(event)
    console.log('something went wrong')
}