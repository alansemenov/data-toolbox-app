exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdExportScriptBean');
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var nodePath = body.nodePath;
    var exportName = body.exportName;

    return {
        contentType: 'application/json',
        body: bean.create(repositoryName, branchName, nodePath, exportName)
    }
};