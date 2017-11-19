exports.post = function (req) {
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var path = body.path;
    var field = body.field;
    var type = body.type;
    var value = body.value;
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdFieldsScriptBean');

    return {
        contentType: 'application/json',
        body: bean.update(repositoryName, branchName, path, field, type, value)
    }
};