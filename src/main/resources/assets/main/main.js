$('#navLinkExports').click(displayExportsView);

$('#dumpAddButton').click(function () {
    var dumpName = $('#dumpNameInput').val() || 'dump-' + new Date().toISOString();
    $.ajax({
        method: 'POST',
        url: '/api/system/dump',
        data: JSON.stringify({name: dumpName}),
        contentType: 'application/json; charset=utf-8'
    });
    displayDumpView();
});


function displayExportsView() {
    $.ajax({
        url: config.servicesUrl + '/dump-list'

    }).done(function (dumps) {
        var tableBody = dumps.map(createDumpRow);
        $('#dumpTableBody').html(tableBody);

        $('.deleteDumpButton').click(function (event) {
            deleteDump(event.target.value);
        });
    }).always(function () {
        displayView('viewExports', 'Exports & Dumps');
    });
}

function deleteDump(dumpName) {
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-delete',
        data: JSON.stringify({name: dumpName}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        displayDumpView();
    });
}

function createDumpRow(dump) {
    return '<div class="table-row">' +
           '<div class="table-cell button-column"><i class="material-icons checkbox">check_box_outline_blank</i></div>' +
           '<div class="table-cell name-column"><span>' + dump.name + '</span></div>' +
           '<div class="table-cell"><span>' + new Date(dump.timestamp).toISOString() + '</span></div>' +
           '</div>';
}


function displayView(viewId, title) {
    $('.view').addClass('rcd-hidden');
    $('#' + viewId).removeClass('rcd-hidden');
    $('#contentTitle').html(title);
}