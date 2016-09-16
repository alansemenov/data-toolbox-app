var routerViews = {};
function addView(viewId, callback) {
    routerViews[viewId] = callback;
}

function loadView(viewId) {
    var callback = routerViews[viewId];
    callback(function () {
        $('.view').addClass('rcd-hidden');
        $('#' + viewId).removeClass('rcd-hidden');
    });
}
    
