exports.post = function (req) {
    var bean = __.newBean('systems.rcd.enonic.datatoolbox.RcdDumpScriptBean');
    var body = JSON.parse(req.body);
    var dumpNames = body.dumpNames;

    return {
        contentType: 'application/json',
        body: bean.load(dumpNames)
    }
};