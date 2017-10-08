var nodeLib = require('/lib/xp/node');
var exceptionLib = require('/lib/exception');

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var path = body.path;
    var field = body.field;

    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdFieldsScriptBean');

    return {
        contentType: 'application/json',
        body: bean.list(repositoryName, branchName, path, field || null)
    }
};