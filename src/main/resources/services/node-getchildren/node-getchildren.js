var nodeLib = require('/lib/xp/node');

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var parentPath = body.parentPath;

    var result = runSafely(getChildren, [repositoryName, branchName, parentPath]);
    return {
        contentType: 'application/json',
        body: result
    };
};

function getChildren(repositoryName, branchName, parentPath) {
    var repoConnection = nodeLib.connect({
        repoId: repositoryName,
        branch: branchName
    });

    if (parentPath) {
        return {
            success: repoConnection.findChildren({
                parentKey: parentPath
            }).hits.map(function (findChildrenResult) {
                    return repoConnection.get(findChildrenResult.id);
                })
        };
    } else {
        var rootNode = repoConnection.get('/');
        return {
            success: rootNode ? [rootNode] : []
        };
    }
}

function runSafely(runnable, parameters) {
    try {
        return runnable.apply(null, parameters);
    } catch (e) {
        return {
            error: 'Error while getitng node children: ' + e.message
        }
    }
}