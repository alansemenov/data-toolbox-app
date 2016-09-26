exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdExportScriptBean');
    var body = JSON.parse(req.body);
    var contentPath = body.contentPath;
    var exportName = body.exportName;

    return {
        contentType: 'application/json',
        body: bean.create(contentPath, exportName)
    }
};