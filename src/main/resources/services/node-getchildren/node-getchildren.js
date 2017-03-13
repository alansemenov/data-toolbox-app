var nodeLib = require('/lib/xp/node');

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;
    var branchName = body.branchName;
    var parentPath = body.parentPath;
    var start = body.start || 0;
    var count = body.count || 50;

    var result = runSafely(getChildren, [repositoryName, branchName, parentPath, start, count]);
    return {
        contentType: 'application/json',
        body: result
    };
};

function getChildren(repositoryName, branchName, parentPath, start, count) {
    var repoConnection = nodeLib.connect({
        repoId: repositoryName,
        branch: branchName
    });

    if (parentPath) {
        var findChildrenResult = repoConnection.findChildren({
            parentKey: parentPath,
            start: start,
            count: count
        });
        return {
            success: {
                hits: findChildrenResult.hits.map(function (findChildrenResult) {
                    return repoConnection.get(findChildrenResult.id);
                }),
                count: findChildrenResult.count,
                total: findChildrenResult.total
            }
        };
    } else {
        var rootNode = repoConnection.get('/');
        if (rootNode) {
            rootNode._name = "[root]"
        }
        return {
            success: {
                hits: rootNode ? [rootNode] : [],
                count: rootNode ? 1 : 0,
                total: rootNode ? 1 : 0
            }
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