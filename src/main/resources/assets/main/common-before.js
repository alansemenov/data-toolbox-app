

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
addView('viewDumps', loadDumps);
loadView((window.location.hash && window.location.hash.substring(1) ) || 'viewPresentation');