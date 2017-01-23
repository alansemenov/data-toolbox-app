var repoLib = require('/lib/xp/repo');

exports.post = function (req) {
    var repositoryNames = JSON.parse(req.body).repositoryNames;

    var result;
    if (repositoryNames.some(isProtectedAgainstDeletion)) {
        result = {
            error: 'The repositories [cms-repo] and [system-repo] cannot be deleted.'
        };
    } else {
        result = runSafely(deleteRepositories, repositoryNames);
    }
    return {
        contentType: 'application/json',
        body: result
    }


    return {
        contentType: 'application/json',
        body: bean.delete(repositoryNames)
    }
};

function isProtectedAgainstDeletion(repositoryName) {
    return "cms-repo" === repositoryName || "system-repo" === repositoryName;
}

function deleteRepositories(repositoryNames) {
    repositoryNames.forEach(deleteRepository);
    return {
        success: true
    };
}

function deleteRepository(repositoryName) {
    repoLib.delete(repositoryName);
}

function runSafely(runnable, parameter) {
    try {
        return runnable(parameter);
    } catch (e) {
        return {
            error: 'Error while deleting repositories'
        }
    }
}