$("#nav-item-dump").click(displayDumpView);

$("#dumpAddButton").click(function () {
    var dumpName = $("#dumpNameInput").val() || "dump-" + new Date().toISOString();
    $.ajax({
        method: 'POST',
        url: '/api/system/dump',
        data: JSON.stringify({name: dumpName}),
        contentType: "application/json; charset=utf-8"
    });
    displayDumpView();
});

function displayDumpView() {
    $.ajax({
        url: config.servicesUrl + '/dump-list'

    }).done(function (dumps) {
        var tableBody = dumps.map(createDumpRow);
        $('#dumpTableBody').html(tableBody);
    }).always(function () {
        displayView("dumpView", "Dumps");
    });
}

function createDumpRow(dump) {
    return '<div class="table-row"><div class="table-cell name-column"><span>' + dump.name + '</span></div><div class="table-cell"><span>' +
           new Date(dump.timestamp).toISOString() + '</span></div></div>';
}


function displayView(viewId, title) {
    $('.view').addClass("rcd-hidden");
    $('#' + viewId).removeClass("rcd-hidden");
    $('#headerTitleText').html(title);
}