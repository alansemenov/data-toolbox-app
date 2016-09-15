$('#navLinkExports').click(displayExportsView);

$('#actionCreateDump').click(function () {
    //var dumpName = $('#dumpNameInput').val() || 'dump-' + new Date().toISOString();
    var dumpName = 'dump-' + new Date().toISOString();
    createDump(dumpName);

});

function displayExportsView() {
    $.ajax({
        url: config.servicesUrl + '/dump-list'

    }).done(function (dumps) {
        var tableBody = dumps.map(createDumpRow);
        $('#dumpTableBody').html(tableBody);

        $('.action-select-dump').click(function (event) {
            var index = event.target.getAttribute('index');
            selectDumpRow(index);
        });
    }).always(function () {
        displayView('viewExports', 'Exports & Dumps');
    });
}

function createDump(dumpName) {
    $.ajax({
        method: 'POST',
        url: '/api/system/dump',
        data: JSON.stringify({name: dumpName}),
        contentType: 'application/json; charset=utf-8'
    });
    displayDumpView();
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

function selectDumpRow(index) {
    var row = $('#rowDump' + index);
    var checkbox = $('#checkboxDump' + index);

    if (row.hasClass('selected')) {
        row.removeClass('selected');
        checkbox.removeClass('selected').
            html('check_box_outline_blank');
    } else {
        row.addClass('selected');
        checkbox.addClass('selected').
            html('check_box');
    }
}

function createDumpRow(dump, index) {
    return '<div class="table-row" id="rowDump' + index + '">' +
           '<div class="table-cell button-column"><i class="material-icons checkbox action-select-dump" id="checkboxDump' + index +
           '" index="' + index + '">check_box_outline_blank</i>' + '</div>' +
           '<div class="table-cell name-column"><span>' + dump.name + '</span></div>' +
           '<div class="table-cell"><span>' + new Date(dump.timestamp).toISOString() + '</span></div>' +
           '</div>';
}

function displayView(viewId, title) {
    $('.view').addClass('rcd-hidden');
    $('#' + viewId).removeClass('rcd-hidden');
    $('#contentTitle').html(title);
}