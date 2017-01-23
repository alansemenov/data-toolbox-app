exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdRepositoryScriptBean');
    var repositoryNames = JSON.parse(req.body).repositoryNames;

    return {
        contentType: 'application/json',
        body: bean.delete(repositoryNames)
    }
};