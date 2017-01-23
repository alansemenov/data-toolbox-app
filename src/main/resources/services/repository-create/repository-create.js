exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdRepositoryScriptBean');
    var body = JSON.parse(req.body);
    var repositoryName = body.repositoryName;

    return {
        contentType: 'application/json',
        body: bean.create(repositoryName)
    }
};