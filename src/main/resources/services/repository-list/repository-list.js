exports.get = function () {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdRepositoryScriptBean');

    return {
        contentType: 'application/json',
        body: bean.list()
    }
};