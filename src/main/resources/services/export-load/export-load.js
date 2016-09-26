exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdExportScriptBean');
    var body = JSON.parse(req.body);
    var contentPath = body.contentPath;
    var exportNames = body.exportNames;

    return {
        contentType: 'application/json',
        body: bean.load(contentPath, exportNames)
    }
};