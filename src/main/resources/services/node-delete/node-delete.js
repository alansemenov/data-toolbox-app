var nodeLib = require('/lib/xp/node');

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var keys = body.keys;

    var result = runSafely(deleteNodes, [repositoryName, branchName, keys]);
    return {
        contentType: 'application/json',
        body: result
    };
};

function deleteNodes(repositoryName, branchName, keys) {
    var repoConnection = nodeLib.connect({
        repoId: repositoryName,
        branch: branchName
    });

    return {
        success: repoConnection.delete(keys)
    };
}

function runSafely(runnable, parameters) {
    try {
        return runnable.apply(null, parameters);
    } catch (e) {
        return {
            error: 'Error while deleting repository: ' + e.message
        }
    }
}