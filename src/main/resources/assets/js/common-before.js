function displayView(viewId) {
    history.pushState(viewId, null, '#' + viewId);
    loadView(viewId);
}

addView('viewPresentation', function (callback) {
    callback();
});

$(window).bind('popstate',
    function (event) {
        loadView(event.originalEvent.state || 'viewPresentation');
    }
);