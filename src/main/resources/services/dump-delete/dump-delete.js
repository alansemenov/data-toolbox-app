exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var dumpNames = JSON.parse(req.body).dumpNames;

    return {
        contentType: 'application/json',
        body: bean.delete(dumpNames)
    }
};