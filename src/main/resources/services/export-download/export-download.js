var portalLib = require('/lib/xp/portal');

exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdExportScriptBean');
    var exportNames = req.params.exportNames.split(",");

    return {
        contentType: 'application/octet-stream',
        body: bean.download(exportNames),
        headers: {
            "Content-Disposition": "attachment; filename=" + (exportNames.length == 1 ? exportNames[0] : "export-archive") + ".zip"
        }
    }
};