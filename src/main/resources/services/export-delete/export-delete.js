exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdExportScriptBean');
    var exportNames = JSON.parse(req.body).exportNames;

    return {
        contentType: 'application/json',
        body: bean.delete(exportNames)
    }
};