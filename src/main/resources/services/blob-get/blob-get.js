exports.post = function (req) {
    var blobBean = __.newBean('systems.rcd.enonic.datatoolbox.RcdBlobScriptBean');
    var body = JSON.parse(req.body);

    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var type = body.type;
    var id = body.id;
    var versionKey = body.versionKey;

    var result = blobBean.get(repositoryName, branchName, id, versionKey, type);

    return {
        contentType: 'application/json',
        body: result
    }
};