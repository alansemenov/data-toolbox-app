function displayView(viewId) {
    history.pushState(viewId, null, '#' + viewId);
    loadView(viewId);
}

$(window).bind('popstate',
    function (event) {
        loadView(event.originalEvent.state || 'viewPresentation');
    }
);

addView('viewPresentation', function (callback) {
    callback();
});