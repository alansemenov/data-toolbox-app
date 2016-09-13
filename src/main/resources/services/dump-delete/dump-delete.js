exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var dumpName = JSON.parse(req.body).name;

    return {
        contentType: 'application/json',
        body: bean.delete(dumpName)
    }
};