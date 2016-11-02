var portalLib = require('/lib/xp/portal');

exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var dumpNames = req.params.dumpNames.split(",");

    return {
        contentType: 'application/octet-stream',
        body: bean.download(dumpNames),
        headers: {
            "Content-Disposition": "attachment; filename=" + (dumpNames.length == 1 ? dumpNames[0] : "dump-archive") + ".zip"
        }
    }
};