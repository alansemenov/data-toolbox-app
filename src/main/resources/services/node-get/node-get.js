var nodeLib = require('/lib/xp/node');
var escapeLib = require('/lib/escape');

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var key = body.key;

    var result = runSafely(getInfo, [repositoryName, branchName, key]);
    return {
        contentType: 'application/json',
        body: result
    };
};

function getInfo(repositoryName, branchName, key) {
    var repoConnection = nodeLib.connect({
        repoId: repositoryName,
        branch: branchName
    });

    var result = repoConnection.get(key);
    var escapedResult = escapeLib.escapeHtml(result);

    return {
        success: escapedResult
    };
}

function runSafely(runnable, parameters) {
    try {
        return runnable.apply(null, parameters);
    } catch (e) {
        return {
            error: 'Error while retrieving node: ' + e.message
        }
    }
}