function loadDumps(callback) {
    return $.ajax({
        url: config.servicesUrl + '/dump-list'
    }).done(function (dumps) {
        $('.rcd-material-nav-link').removeClass('selected');
        $('#navLinkExports').addClass('selected');
        var tableBody = dumps.map(createDumpRow);
        $('#dumpTableBody').html(tableBody);
        $('.action-select-dump').click(onDumpSelected);
    }).always(function () {
        callback();
    });
}

function createDump(dumpName) {
    $.ajax({
        method: 'POST',
        url: '/api/system/dump',
        data: JSON.stringify({name: dumpName}),
        contentType: 'application/json; charset=utf-8'
    });
    setTimeout(function () {
        displayView('viewDumps');
    }, 1000);
    //displayView('viewDumps');
}

function deleteDumps(dumpNames) {
    $.ajax({
        method: 'POST',
        url: config.servicesUrl + '/dump-delete',
        data: JSON.stringify({dumpNames: dumpNames}),
        contentType: 'application/json; charset=utf-8'
    }).always(function () {
        displayView('viewDumps');
    });
}

function onDumpSelected(event) {
    var index = event.target.getAttribute('index');
    selectDumpRow(index);

    var nbDumpSelected = $('.dump-row.selected').length;
    enableIcon('actionLoadDump', nbDumpSelected == 1);
    enableIcon('actionDeleteDump', nbDumpSelected == 1);
}

function enableIcon(id, enabled) {
    console.log("aa");
    if (enabled) {
        $('#' + id).removeClass('disabled');
    } else {
        $('#' + id).addClass('disabled');
    }
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
    return '<div class="rcd-material-table-row dump-row" dump="' + dump.name + '" id="rowDump' + index + '">' +
           '<div class="rcd-material-table-cell button-column"><i class="material-icons rcd-material-checkbox action-select-dump" id="checkboxDump' +
           index +
           '" index="' + index + '">check_box_outline_blank</i>' + '</div>' +
           '<div class="rcd-material-table-cell name-column"><span>' + dump.name + '</span></div>' +
           '<div class="rcd-material-table-cell"><span>' + new Date(dump.timestamp).toISOString() + '</span></div>' +
           '</div>';
}

$('#navLinkExports').click(function () {
    displayView('viewDumps')
});

$('#actionCreateDump').click(function () {
    //var dumpName = $('#dumpNameInput').val() || 'dump-' + new Date().toISOString();
    var dumpName = 'dump-' + new Date().toISOString();
    createDump(dumpName);

});
$('#actionDeleteDump').click(function () {
    var dumpNames = $('.dump-row.selected').map(function (dumpRow) {
        return $(this).attr('dump');
    }).get();
    deleteDumps(dumpNames);
});

addView('viewDumps', loadDumps);

